import { Message } from '@/components/ChatWindow';
import generateSuggestions from '@/lib/chains/suggestionGeneratorAgent';
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '@/lib/config';
import { getAvailableChatModelProviders } from '@/lib/providers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { suggestions as suggestionsTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Suggestion } from '@/lib/types';

interface ChatModel {
  provider: string;
  model: string;
}

interface SuggestionsGenerationBody {
  chatHistory: Message[];
  chatModel?: ChatModel;
}

export const POST = async (req: Request) => {
  try {
    const body: SuggestionsGenerationBody = await req.json();

    const messageId = body.chatHistory[body.chatHistory.length - 1].messageId;
    const chatId = body.chatHistory[body.chatHistory.length - 1].chatId;

    const chatHistory = body.chatHistory
      .map((msg: any) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else if (msg.role === 'assistant') {
          return new AIMessage(msg.content);
        }
      })
      .filter((msg) => msg !== undefined) as BaseMessage[];

    const chatModelProviders = await getAvailableChatModelProviders();

    const chatModelProvider =
      chatModelProviders[
        body.chatModel?.provider || Object.keys(chatModelProviders)[0]
      ];
    const chatModel =
      chatModelProvider[
        body.chatModel?.model || Object.keys(chatModelProvider)[0]
      ];

    let llm: BaseChatModel | undefined;

    if (body.chatModel?.provider === 'custom_openai') {
      llm = new ChatOpenAI({
        openAIApiKey: getCustomOpenaiApiKey(),
        modelName: getCustomOpenaiModelName(),
        temperature: 0.7,
        configuration: {
          baseURL: getCustomOpenaiApiUrl(),
        },
      }) as unknown as BaseChatModel;
    } else if (chatModelProvider && chatModel) {
      llm = chatModel.model;
    }

    if (!llm) {
      return Response.json({ error: 'Invalid chat model' }, { status: 400 });
    }

    const suggestions = await generateSuggestions(
      {
        chat_history: chatHistory,
      },
      llm,
    );

    await db.insert(suggestionsTable).values({
      chatId,
      messageId,
      questions: suggestions,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ suggestions }, { status: 200 });
  } catch (err) {
    console.error(`An error ocurred while generating suggestions: ${err}`);
    return Response.json(
      { message: 'An error ocurred while generating suggestions' },
      { status: 500 },
    );
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 },
      );
    }

    // const result = await db.query.suggestions.findMany({
    //   where: (s) => and(eq(s.messageId, messageId), eq(s.chatId, chatId || '')),
    // });
    const result = await db
      .select()
      .from(suggestionsTable)
      .where(
        and(
          eq(suggestionsTable.messageId, messageId),
          eq(suggestionsTable.chatId, chatId || ''),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    return NextResponse.json(result[0] as Suggestion);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 },
    );
  }
}
