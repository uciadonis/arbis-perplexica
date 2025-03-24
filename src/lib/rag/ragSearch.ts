import axios from 'axios';

interface SearchRagOptions {
  query: string;
  project_id: string;
  retrieval_strategy: string;
  max_results: number;
  min_similarity_score: number;
  use_hyde: boolean;
  enable_reranking: boolean;
  embedding_provider: string;
}

export interface RAGRelationship {
  source: string;
  relation: string;
  target: string;
}

export interface RAGQueryResult {
  chunk_id: string;
  content: string;
  section: string;
  document_id: string;
  document_title: string;
  document_url: string;
  similarity_score: number;
  used_hyde: boolean;
}

export interface RAGQueryResponse {
  results: RAGQueryResult[];
  hyde_document?: string;
  relations?: RAGRelationship[];
}

export const searchRag = async (
  query: string,
  opts?: SearchRagOptions,
): Promise<RAGQueryResponse> => {
  // const ragApiURL = 'http://192.168.68.106:8000';
  const ragApiURL = 'http://localhost:8000';
  const url = new URL(
    `${ragApiURL}/api/v1/rag/query-knowledge-graph?project_id=8e57648e-fd9b-4cd9-8092-663d49d679b4&use_hyde=true`,
  );

  //   url.searchParams.append('q', query);

  //   if (opts) {
  //     Object.keys(opts).forEach((key) => {
  //       if (Array.isArray(opts[key])) {
  //         url.searchParams.append(key, opts[key].join(','));
  //         return;
  //       }
  //       url.searchParams.append(key, opts[key]);
  //     });
  //   }

  const response = await axios.post(url.toString(), { query });

  return response.data;
};
