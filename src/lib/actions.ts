import { Message } from '@/components/ChatWindow';
import { Suggestion } from './types';

export const generateSuggestions = async (
  chatHisory: Message[],
): Promise<string[]> => {
  const chatModel = localStorage.getItem('chatModel');
  const chatModelProvider = localStorage.getItem('chatModelProvider');

  const customOpenAIKey = localStorage.getItem('openAIApiKey');
  const customOpenAIBaseURL = localStorage.getItem('openAIBaseURL');

  const res = await fetch(`/api/suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatHistory: chatHisory,
      chatModel: {
        provider: chatModelProvider,
        model: chatModel,
        ...(chatModelProvider === 'custom_openai' && {
          customOpenAIKey,
          customOpenAIBaseURL,
        }),
      },
    }),
  });

  const data = (await res.json()) as { suggestions: string[] };

  return data.suggestions;
};

export const getSuggestions = async (chatHisory: Message[]) => {
  const lastMessage = chatHisory[chatHisory.length - 1];
  const chatId = lastMessage.chatId;
  const messageId = lastMessage.messageId;

  const res = await fetch(
    `/api/suggestions?chatId=${chatId}&messageId=${messageId}`,
  );

  const data = (await res.json()) as { questions: string[] };
  console.log(data);

  if (data.questions.length > 0) {
    return data.questions;
  }

  const suggestions = await generateSuggestions(chatHisory);

  return suggestions;
};
