import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from '@langchain/core/prompts';
import {
  RunnableLambda,
  RunnableMap,
  RunnableSequence,
} from '@langchain/core/runnables';
import { BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import LineOutputParser from '../outputParsers/lineOutputParser';
import { Document } from 'langchain/document';
import path from 'path';
import fs from 'fs';
import computeSimilarity from '../utils/computeSimilarity';
import formatChatHistoryAsString from '../utils/formatHistory';
import eventEmitter from 'events';
import { StreamEvent } from '@langchain/core/tracers/log_stream';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { MetaSearchAgentType } from './metaSearchAgent';
import { searchRag, RAGQueryResult, RAGRelationship } from '../rag/ragSearch';

interface Config {
  searchWeb: boolean;
  rerank: boolean;
  summarizer: boolean;
  rerankThreshold: number;
  queryGeneratorPrompt: string;
  responsePrompt: string;
  activeEngines: string[];
}

type BasicChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

class RAGSearchAgent implements MetaSearchAgentType {
  private config: Config;
  private strParser = new StringOutputParser();

  constructor(config: Config) {
    this.config = config;
  }

  private async createSearchRetrieverChain(llm: BaseChatModel) {
    (llm as unknown as ChatOpenAI).temperature = 0;

    return RunnableSequence.from([
      PromptTemplate.fromTemplate(this.config.queryGeneratorPrompt),
      llm,
      this.strParser,
      RunnableLambda.from(async (llmOutput: string) => {
        console.log('=======>', 'Going to search rag');
        return llmOutput;
      }),
      RunnableLambda.from(async (input: string) => {
        const questionOutputParser = new LineOutputParser({
          key: 'question',
        });
        let question = this.config.summarizer
          ? await questionOutputParser.parse(input)
          : input;

        if (question === 'not_needed') {
          return { query: '', docs: [] };
        }

        const res = await searchRag(question);

        const relations = res.relations;
        const hyde_document = res.hyde_document;

        const documents = res.results.map(
          (result: RAGQueryResult) =>
            new Document({
              pageContent: result.content,
              metadata: {
                title: result.document_title,
                url: result.document_url,
                section: result.section,
                importance_score: result.similarity_score,
              },
            }),
        );

        return {
          query: question,
          docs: documents,
          relations,
          // hyde: hyde_document,
        };
      }),
    ]);
  }

  private async createAnsweringChain(
    llm: BaseChatModel,
    fileIds: string[],
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
  ) {
    return RunnableSequence.from([
      RunnableMap.from({
        query: (input: BasicChainInput) => input.query,
        chat_history: (input: BasicChainInput) => input.chat_history,
        date: () => new Date().toISOString(),
        context: RunnableLambda.from(async (input: BasicChainInput) => {
          const processedHistory = formatChatHistoryAsString(
            input.chat_history,
          );
          let docs: Document[] | null = null;
          let relations: RAGRelationship[] | undefined = undefined;
          let query = input.query;

          if (this.config.searchWeb) {
            const searchRetrieverChain =
              await this.createSearchRetrieverChain(llm);
            const searchRetrieverResult = await searchRetrieverChain.invoke({
              chat_history: processedHistory,
              query,
            });
            console.log(
              '=======>',
              'Search retriever result:',
              searchRetrieverResult,
            );
            query = searchRetrieverResult.query;
            docs = searchRetrieverResult.docs;
            relations = searchRetrieverResult.relations;
          }

          const sortedDocs = await this.rerankDocs(
            query,
            docs ?? [],
            fileIds,
            embeddings,
            optimizationMode,
          );

          const processedDocs = this.processDocs(
            sortedDocs || [],
            relations || [],
          );

          return processedDocs;
        }).withConfig({
          runName: 'FinalSourceRetriever',
        }),
        // .pipe(this.processDocs),
      }),

      ChatPromptTemplate.fromMessages([
        ['system', this.config.responsePrompt],
        new MessagesPlaceholder('chat_history'),
        ['user', '{query}'],
      ]),

      // RunnableLambda.from(async (llmOutput: string) => {
      //   console.log('before final response:222------>', llmOutput);
      //   // Retornamos la salida sin modificar para que siga el flujo
      //   return llmOutput;
      // }),
      llm,
      this.strParser,
    ]).withConfig({
      runName: 'FinalResponseGenerator',
    });
  }

  private async rerankDocs(
    query: string,
    docs: Document[],
    fileIds: string[],
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
  ) {
    if (docs.length === 0 && fileIds.length === 0) {
      return docs;
    }

    // Cargar y preparar los datos de los archivos locales
    const filesData = fileIds
      .map((file) => {
        const filePath = path.join(process.cwd(), 'uploads', file);
        const contentPath = filePath + '-extracted.json';
        const embeddingsPath = filePath + '-embeddings.json';

        const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
        const embeddingsData = JSON.parse(
          fs.readFileSync(embeddingsPath, 'utf8'),
        );

        const fileSimilaritySearchObject = content.contents.map(
          (c: string, i: number) => ({
            fileName: content.title,
            content: c,
            embeddings: embeddingsData.embeddings[i],
          }),
        );

        return fileSimilaritySearchObject;
      })
      .flat();

    if (query.toLocaleLowerCase() === 'summarize') {
      return docs.slice(0, 15);
    }

    const docsWithContent = docs.filter(
      (doc) => doc.pageContent && doc.pageContent.length > 0,
    );

    if (optimizationMode === 'speed' || this.config.rerank === false) {
      if (filesData.length > 0) {
        const [queryEmbedding] = await Promise.all([
          embeddings.embedQuery(query),
        ]);

        const fileDocs = filesData.map((fileData) => {
          return new Document({
            pageContent: fileData.content,
            metadata: {
              title: fileData.fileName,
              url: 'File',
            },
          });
        });

        const similarity = filesData.map((fileData, i) => {
          const sim = computeSimilarity(queryEmbedding, fileData.embeddings);
          return { index: i, similarity: sim };
        });

        let sortedDocs = similarity
          .filter(
            (sim) => sim.similarity > (this.config.rerankThreshold ?? 0.3),
          )
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 15)
          .map((sim) => fileDocs[sim.index]);

        sortedDocs =
          docsWithContent.length > 0 ? sortedDocs.slice(0, 8) : sortedDocs;

        return [
          ...sortedDocs,
          ...docsWithContent.slice(0, 15 - sortedDocs.length),
        ];
      } else {
        return docsWithContent.slice(0, 15);
      }
    } else if (optimizationMode === 'balanced') {
      const [docEmbeddings, queryEmbedding] = await Promise.all([
        embeddings.embedDocuments(
          docsWithContent.map((doc) => doc.pageContent),
        ),
        embeddings.embedQuery(query),
      ]);

      docsWithContent.push(
        ...filesData.map((fileData) => {
          return new Document({
            pageContent: fileData.content,
            metadata: {
              title: fileData.fileName,
              url: 'File',
            },
          });
        }),
      );

      docEmbeddings.push(...filesData.map((fileData) => fileData.embeddings));

      const similarity = docEmbeddings.map((docEmbedding, i) => {
        const sim = computeSimilarity(queryEmbedding, docEmbedding);
        return { index: i, similarity: sim };
      });

      const sortedDocs = similarity
        .filter((sim) => sim.similarity > (this.config.rerankThreshold ?? 0.3))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 15)
        .map((sim) => docsWithContent[sim.index]);

      return sortedDocs;
    }
  }

  private processDocs(sortedDocs: Document[], relations: RAGRelationship[]) {
    // Procesar documentos
    // const docs_str = sortedDocs
    //   .map(
    //     (_, index) =>
    //       `${index + 1}. ${sortedDocs[index].metadata.title} ${sortedDocs[index].pageContent}`,
    //   )
    //   .join('\n');

    const docs_str = sortedDocs.map((_, index) => {
      const doc = sortedDocs[index];
      const title = doc.metadata.title;
      const url = doc.metadata.url || 'URL no disponible';
      // return `${index + 1}. ${title}\n${doc.pageContent}\nFuente: ${url}\n---`;
      return `DOCUMENTO ${index + 1}
        Título: ${title}
        Contenido:
        ${doc.pageContent}
        Fuente: ${url}
        ---
        `;
    });

    // Procesar relaciones si existen
    if (relations.length === 0) {
      return docs_str;
    }

    // Continuar con el índice después del último documento
    // const startRelationIndex = sortedDocs.length + 1;
    let relations_str = 'Knowledge graph:\n';
    for (let i = 0; i < relations.length && i < 25; i++) {
      const relation = relations[i];
      // relations_str += relations
      //   .map(
      //     (r, i) => `${i + 1}. (${r.source}) -[${r.relation}]-> (${r.target})`,
      //   )
      //   .join('\n');
      // relations_str += `${i + 1}. ${relation.source} ${relation.relation} ${relation.target}\n`;
      relations_str += `${i + 1}. (${relation.source}) -[${relation.relation}]-> (${relation.target})\n`;
    }

    // Combinar ambos
    return `${docs_str}\n\n${relations_str}`;
  }

  private async handleStream(
    stream: IterableReadableStream<StreamEvent>,
    emitter: eventEmitter,
  ) {
    for await (const event of stream) {
      if (
        event.event === 'on_chain_end' &&
        event.name === 'FinalSourceRetriever'
      ) {
        emitter.emit(
          'data',
          JSON.stringify({ type: 'sources', data: event.data.output }),
        );
      }
      if (
        event.event === 'on_chain_stream' &&
        event.name === 'FinalResponseGenerator'
      ) {
        emitter.emit(
          'data',
          JSON.stringify({ type: 'response', data: event.data.chunk }),
        );
      }
      if (
        event.event === 'on_chain_end' &&
        event.name === 'FinalResponseGenerator'
      ) {
        emitter.emit('end');
      }
    }
  }

  async searchAndAnswer(
    message: string,
    history: BaseMessage[],
    llm: BaseChatModel,
    embeddings: Embeddings,
    optimizationMode: 'speed' | 'balanced' | 'quality',
    fileIds: string[],
  ) {
    const emitter = new eventEmitter();

    const answeringChain = await this.createAnsweringChain(
      llm,
      fileIds,
      embeddings,
      optimizationMode,
    );

    const stream = answeringChain.streamEvents(
      {
        chat_history: history,
        query: message,
      },
      { version: 'v1' },
    );

    this.handleStream(stream, emitter);

    return emitter;
  }
}

export default RAGSearchAgent;
