'use client';

import DeleteChat from '@/components/DeleteChat';
import { cn, formatTimeDifference } from '@/lib/utils';
import { BookOpenText, ClockIcon, Delete, ScanEye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  focusMode: string;
}

const Page = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      const res = await fetch(`/api/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      setChats(data.chats);
      setLoading(false);
    };

    fetchChats();
  }, []);

  return loading ? (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="flex-none pt-5 px-4">
          <div className="ease relative flex w-full items-center justify-between duration-150 max-w-screen-md mx-auto">
            <div className="flex items-center gap-2 w-full">
              <BookOpenText />
              <h1 className="text-2xl font-medium">Historial</h1>
            </div>
          </div>
        </div>
        <hr className="border-t bg-light-secondary mt-4 w-full" />
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4">
        {chats.length === 0 ? (
          <div className="flex flex-row items-center justify-center min-h-[60vh]">
            <p className="text-black/70 dark:text-white/70 text-sm">
              No chats found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col pb-20 lg:pb-2 max-w-screen-md mx-auto gap-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="rounded-lg border border-light-secondary dark:border-dark-secondary hover:bg-light-secondary dark:hover:bg-dark-secondary"
              >
                <div className="flex flex-row items-center justify-between w-full gap-x-4 p-4">
                  <Link
                    href={`/c/${chat.id}`}
                    className="flex-1 transition cursor-pointer"
                  >
                    <div className="text-black/70 dark:text-white/70 space-y-2">
                      <div className="font-medium text-ellipsis overflow-hidden line-clamp-1">
                        {chat.title}
                      </div>
                      <div className="flex flex-row items-center space-x-1 text-md lg:space-x-1.5 text-black/65 dark:text-white/70">
                        <ClockIcon size={15} />
                        <p className="text-xs">
                          {formatTimeDifference(new Date(), chat.createdAt)} Ago
                        </p>
                      </div>
                    </div>
                  </Link>

                  <DeleteChat
                    chatId={chat.id}
                    chats={chats}
                    setChats={setChats}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
