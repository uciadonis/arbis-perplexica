'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { File, Message } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';
import { FeedbackProvider } from '@/context/FeedbackContext';
import Navbar from './Navbar';

const Chat = ({
  loading,
  messages,
  sendMessage,
  messageAppeared,
  rewrite,
  fileIds,
  setFileIds,
  files,
  setFiles,
  chatId,
}: {
  messages: Message[];
  sendMessage: (message: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  chatId: string;
}) => {
  const [dividerWidth, setDividerWidth] = useState(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.scrollWidth);
      }
    };

    updateDividerWidth();

    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  });

  useEffect(() => {
    if (messages.length === 1) {
      document.title = `${messages[0].content.substring(0, 30)} - Arbis`;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden mx-auto">
      <div className="flex-none h-8 bg-white dark:bg-black z-40">
        <Navbar chatId={chatId!} messages={messages} />
      </div>
      <div className="flex-1 overflow-y-auto relative pt-8">
        <div className="px-4 max-w-screen-lg mx-auto">
          <FeedbackProvider>
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;

              return (
                <Fragment key={msg.messageId}>
                  <MessageBox
                    key={i}
                    message={msg}
                    messageIndex={i}
                    history={messages}
                    loading={loading}
                    dividerRef={isLast ? dividerRef : undefined}
                    isLast={isLast}
                    rewrite={rewrite}
                    sendMessage={sendMessage}
                    shouldScroll={
                      // i === messages.length - 1 && msg.role === 'user'
                      i === messages.length - 1
                    }
                    // showSkeleton={loading && !messageAppeared}
                  />
                  {!isLast && msg.role === 'assistant' && (
                    <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                  )}
                </Fragment>
              );
            })}
            <div className="h-24" />
          </FeedbackProvider>
        </div>
      </div>
      <div ref={messageEnd} className="h-0" />
      {/* {dividerWidth > 0 && ( */}
      <div className="flex flex-col pb-24 lg:pb-2">
        <div className="max-w-screen-lg w-full mx-auto">
          <div className="lg:w-3/12"></div>
          <div className=" px-4 lg:w-9/12">
            <MessageInput
              loading={loading}
              sendMessage={sendMessage}
              fileIds={fileIds}
              setFileIds={setFileIds}
              files={files}
              setFiles={setFiles}
            />
            <div className="text-center mt-4">
              <p className="dark:text-white/70 text-black/65 text-xs">
                Arbis puede cometer errores. Considera verificar la información
                importante.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default Chat;
