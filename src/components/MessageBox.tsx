'use client';

/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import {
  BookCopy,
  Disc3,
  Volume2,
  StopCircle,
  Layers3,
  Plus,
} from 'lucide-react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import Copy from './MessageActions/Copy';
import Rewrite from './MessageActions/Rewrite';
import MessageSources from './MessageSources';
import SearchImages from './SearchImages';
import SearchVideos from './SearchVideos';
import { useSpeech } from 'react-text-to-speech';
import ThinkBox from './ThinkBox';
import ThumbsUp from './MessageActions/ThumbsUp';
import ThumbsDown from './MessageActions/ThumbsDown';
import MessageBoxLoading from './MessageBoxLoading';

const ThinkTagProcessor = ({ children }: { children: React.ReactNode }) => {
  return <ThinkBox content={children as string} />;
};

const MessageBox = ({
  message,
  messageIndex,
  history,
  loading,
  dividerRef,
  isLast,
  rewrite,
  sendMessage,
  shouldScroll = true,
  showSkeleton = false,
}: {
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: MutableRefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
  shouldScroll?: boolean;
  showSkeleton?: boolean;
}) => {
  const [parsedMessage, setParsedMessage] = useState(message.content);
  const [speechMessage, setSpeechMessage] = useState(message.content);

  const [remainingHeight, setRemainingHeight] = useState<number | null>(null);

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldScroll && messageRef.current && message.role === 'user') {
      // Desplaza el viewport para que este mensaje quede en la parte superior visible
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [shouldScroll]);

  // // useEffect(() => {
  // //   if (
  // //     message.role === 'user' &&
  // //     shouldScroll &&
  // //     messageRef.current &&
  // //     typeof window !== 'undefined' &&
  // //     remainingHeight === null // Solo calcular una vez
  // //   ) {
  // //     const messageHeight = messageRef.current.offsetHeight;
  // //     const screenHeight = window.innerHeight;
  // //     const diff = screenHeight - messageHeight;

  // //     if (diff > 0) {
  // //       setRemainingHeight(diff);
  // //     }

  // //     console.log('remainingHeight', remainingHeight);
  // //     console.log('messageHeight', messageHeight);
  // //     console.log('screenHeight', screenHeight);
  // //     console.log('diff', diff);
  // //   }
  // // }, [shouldScroll, message.role]);

  // useEffect(() => {
  //   if (
  //     message.role === 'user' &&
  //     shouldScroll &&
  //     messageRef.current &&
  //     typeof window !== 'undefined' &&
  //     remainingHeight === null
  //   ) {
  //     const boundingBox = messageRef.current.getBoundingClientRect();
  //     const remainingSpace = window.innerHeight - boundingBox.bottom;

  //     const validHeight = remainingSpace > 0 ? remainingSpace : 0;
  //     setRemainingHeight(validHeight);

  //     console.log('🧮 boundingBox.bottom:', boundingBox.bottom);
  //     console.log('📏 window.innerHeight:', window.innerHeight);
  //     console.log('🧩 remainingSpace:', remainingSpace);
  //     console.log('✅ remainingHeight (clamped):', validHeight);
  //   }
  // }, [shouldScroll, message.role]);

  useEffect(() => {
    if (message.role === 'assistant') {
      const previousScrollY = window.scrollY;
      const previousHeight = document.body.scrollHeight;

      // Esperamos dos frames para asegurarnos de que todo se renderizó (incluyendo imágenes, videos, etc.)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newHeight = document.body.scrollHeight;
          const diff = newHeight - previousHeight;

          if (diff > 0) {
            window.scrollTo({
              top: previousScrollY + diff,
              behavior: 'auto',
            });
          }
        });
      });
    }
  }, [message.content]);

  useEffect(() => {
    const regex = /\[(\d+)\]/g;
    let processedMessage = message.content;

    if (message.role === 'assistant' && message.content.includes('<think>')) {
      const openThinkTag = processedMessage.match(/<think>/g)?.length || 0;
      const closeThinkTag = processedMessage.match(/<\/think>/g)?.length || 0;

      if (openThinkTag > closeThinkTag) {
        processedMessage += '</think> <a> </a>'; // The extra <a> </a> is to prevent the the think component from looking bad
      }
    }

    if (
      message.role === 'assistant' &&
      message?.sources &&
      message.sources.length > 0
    ) {
      setParsedMessage(
        processedMessage.replace(
          regex,
          (_, number) =>
            `<a href="${
              message.sources?.[number - 1]?.metadata?.url
            }" target="_blank" className="bg-light-secondary dark:bg-dark-secondary px-1 rounded ml-1 no-underline text-xs text-black/70 dark:text-white/70 relative">${number}</a>`,
        ),
      );
      return;
    }

    setSpeechMessage(message.content.replace(regex, ''));
    setParsedMessage(processedMessage);
  }, [message.content, message.sources, message.role]);

  const { speechStatus, start, stop } = useSpeech({ text: speechMessage });

  const markdownOverrides: MarkdownToJSX.Options = {
    overrides: {
      think: {
        component: ThinkTagProcessor,
      },
    },
  };

  return (
    <div
      ref={messageRef}
      className={shouldScroll ? 'min-h-screen' : 'h-auto'}
      // className={
      //   message.role === 'user' && shouldScroll
      //     ? `min-h-screen ${remainingHeight ? `h-[calc(100vh-${remainingHeight}px)]` : 'h-screen'}`
      //     : 'h-auto'
      // }
      // style={
      //   message.role === 'user' && shouldScroll
      //     ? { minHeight: '100vh' }
      //     : remainingHeight
      //       ? { height: `${remainingHeight}px` }
      //       : undefined
      // }
    >
      {message.role === 'user' && (
        <div
          className={cn(
            'w-full',
            messageIndex === 0 ? 'pt-16' : 'pt-8',
            'break-words',
            'pb-8',
          )}
        >
          <h2 className="text-black dark:text-white font-medium text-2xl lg:w-9/12">
            {message.content}
          </h2>
        </div>
      )}

      {showSkeleton && <MessageBoxLoading />}

      {message.role === 'assistant' && (
        <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
          <div
            ref={dividerRef}
            className="flex flex-col space-y-6 w-full lg:w-9/12"
          >
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <BookCopy className="text-black dark:text-white" size={20} />
                  <h3 className="text-black dark:text-white font-medium text-lg">
                    Fuentes
                  </h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3
                  className={cn(
                    'text-black dark:text-white',
                    isLast && loading ? 'animate-spin' : 'animate-none',
                  )}
                  size={20}
                />
                <h3 className="text-black dark:text-white font-medium text-lg">
                  Respuesta
                </h3>
              </div>

              <Markdown
                className={cn(
                  'prose prose-h1:mb-3 prose-h2:mb-2 prose-h2:mt-6 prose-h2:font-[800] prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:font-[600] dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 font-[400]',
                  'max-w-none break-words text-black dark:text-white',
                )}
                options={markdownOverrides}
              >
                {parsedMessage}
              </Markdown>
              {loading && isLast ? null : (
                <div className="flex flex-row items-center justify-between w-full text-black dark:text-white py-4 -mx-2">
                  <div className="flex flex-row items-center space-x-1">
                    {/*  <button className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black text-black dark:hover:text-white">
                      <Share size={18} />
                    </button> */}
                    <Rewrite rewrite={rewrite} messageId={message.messageId} />
                  </div>
                  <div className="flex flex-row items-center space-x-1">
                    <ThumbsUp messageId={message.messageId} />
                    <ThumbsDown messageId={message.messageId} />
                    <Copy initialMessage={message.content} message={message} />
                    <button
                      onClick={() => {
                        if (speechStatus === 'started') {
                          stop();
                        } else {
                          start();
                        }
                      }}
                      className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
                    >
                      {speechStatus === 'started' ? (
                        <StopCircle size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {isLast &&
                message.suggestions &&
                message.suggestions.length > 0 &&
                message.role === 'assistant' &&
                !loading && (
                  <>
                    <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                    <div className="flex flex-col space-y-3 text-black dark:text-white">
                      <div className="flex flex-row items-center space-x-2 mt-4">
                        <Layers3 />
                        <h3 className="text-xl font-medium">
                          Preguntas relacionadas
                        </h3>
                      </div>
                      <div className="flex flex-col space-y-3">
                        {message.suggestions.map((suggestion, i) => (
                          <div
                            className="flex flex-col space-y-3 text-sm"
                            key={i}
                          >
                            <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                            <div
                              onClick={() => {
                                sendMessage(suggestion);
                              }}
                              className="cursor-pointer flex flex-row justify-between font-medium space-x-2 items-center"
                            >
                              <p className="transition duration-200 hover:text-[#0A81E4]">
                                {suggestion}
                              </p>
                              <Plus
                                size={20}
                                className="text-[#0A81E4] flex-shrink-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>
          <div className="lg:sticky lg:top-20 flex flex-col items-center space-y-3 w-full lg:w-3/12 z-30 h-full pb-4">
            <SearchImages
              query={history[messageIndex - 1].content}
              chatHistory={history.slice(0, messageIndex - 1)}
              messageId={message.messageId}
            />
            <SearchVideos
              chatHistory={history.slice(0, messageIndex - 1)}
              query={history[messageIndex - 1].content}
              messageId={message.messageId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
