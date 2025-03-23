'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Discover {
  title: string;
  content: string;
  url: string;
  thumbnail: string;
}

const Page = () => {
  const [discover, setDiscover] = useState<Discover[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/discover`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        data.blogs = data.blogs.filter((blog: Discover) => blog.thumbnail);

        setDiscover(data.blogs);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
        toast.error('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return loading ? (
    <div className="flex flex-row items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="flex flex-col h-full">
      <div className="flex-none pt-5 px-4">
        <div className="ease relative flex w-full items-center justify-between duration-150 max-w-screen-md mx-auto">
          <div className="flex items-center gap-2 w-full">
            <Search />
            <h1 className="text-2xl font-medium">Noticias</h1>
          </div>
        </div>

        <hr className="border-t bg-light-secondary mt-4 w-full" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4">
        <div
          className={cn(
            'grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1',
            'gap-4 pt-4 pb-28 lg:pb-8 w-full',
            'justify-items-center lg:justify-items-start',
            'max-w-screen-lg mx-auto max-w-screen-md',
          )}
        >
          {discover &&
            discover?.map((item, i) => {
              const isWide = i % 4 === 0;

              return (
                <Link
                  href={`/?q=Summary: ${item.url}`}
                  key={i}
                  className={cn(
                    'rounded-lg overflow-hidden hover:-translate-y-[1px] transition duration-200',
                    'border border-light-secondary dark:border-dark-secondary',
                    isWide && 'lg:col-span-3 md:col-span-2',
                  )}
                  target="_blank"
                >
                  <div
                    className={cn(
                      isWide &&
                        'flex w-full shrink-0 overflow-hidden rounded-t-lg aspect-[4/3] md:aspect-[1036/350]',
                      !isWide &&
                        'flex w-full shrink-0 overflow-hidden rounded-t-lg aspect-[3/2]',
                    )}
                  >
                    <img
                      className={cn(
                        'object-cover w-full aspect-video',
                        // isWide && 'lg:h-[200px]',
                      )}
                      src={
                        new URL(item.thumbnail).origin +
                        new URL(item.thumbnail).pathname +
                        `?id=${new URL(item.thumbnail).searchParams.get('id')}`
                      }
                      alt={item.title}
                    />
                  </div>
                  <div className="p-4 flex w-full grow transform-gpu flex-col">
                    <div
                      className={cn(
                        'font-display text-lg font-medium',
                        !isWide && 'text-md',
                      )}
                    >
                      <div className="leading-[1.4]">
                        {item.title.slice(0, 100)}...
                      </div>
                    </div>

                    <p
                      className={cn(
                        'break-word mt-2 line-clamp-2 dark:!text-white/50 !text-black/60 default font-sans text-base',
                        !isWide && 'text-balance',
                      )}
                    >
                      {isWide
                        ? item.content.slice(0, 3000)
                        : item.content.slice(0, 100)}
                      ...
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Page;
