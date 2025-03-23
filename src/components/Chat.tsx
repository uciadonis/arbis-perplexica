'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { File, Message } from './ChatWindow';
import MessageBox from './MessageBox';
import MessageBoxLoading from './MessageBoxLoading';
import { cn } from '@/lib/utils';
import { FeedbackProvider } from '@/context/FeedbackContext';

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
    const scroll = () => {
      messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (messages.length === 1) {
      document.title = `${messages[0].content.substring(0, 30)} - Arbis`;
    }

    if (messages[messages.length - 1]?.role == 'user') {
      scroll();
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden mx-auto">
      <div className="flex-1 overflow-y-auto relative">
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
                  />
                  {!isLast && msg.role === 'assistant' && (
                    <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary" />
                  )}
                </Fragment>
              );
            })}
            {loading && !messageAppeared && <MessageBoxLoading />}
          </FeedbackProvider>
        </div>
        {/* <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div> */}
      </div>
      <div ref={messageEnd} className="h-0" />
      {dividerWidth > 0 && (
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
                  Arbis puede cometer errores. Considera verificar la
                  información importante.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
