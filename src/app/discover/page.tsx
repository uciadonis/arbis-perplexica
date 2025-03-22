'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  ) : (
    <>
      <div className="">
        <div className="flex flex-col pt-5">
          <div className="ease px-md md:px-lg relative flex w-full items-center justify-between duration-150 max-w-screen-md mx-auto px-2">
            <div className="flex items-center gap-2 w-full">
              <Search />
              <h1 className="text-2xl font-medium">Noticias</h1>
            </div>
          </div>

          <hr className="border-t bg-light-secondary my-4 w-full" />
        </div>

        <div
          className={cn(
            'grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1',
            'gap-4 pb-28 lg:pb-8 w-full',
            'justify-items-center lg:justify-items-start',
            'max-w-screen-lg mx-auto size-full max-w-screen-md px-md md:px-lg',
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
    </>
  );
};

export default Page;
