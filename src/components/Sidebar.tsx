'use client';

import { cn } from '@/lib/utils';
import { BookOpenText, Home, Search, SquarePen, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import Layout from './Layout';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full">{children}</div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
      label: 'Home',
    },
    {
      icon: Search,
      href: '/discover',
      active: segments.includes('discover'),
      label: 'Noticias',
    },
    {
      icon: BookOpenText,
      href: '/library',
      active: segments.includes('library'),
      label: 'Historial',
    },
  ];

  return (
    <div className="flex h-full min-h-[100dvh]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:inset-y-0 lg:z-50 lg:flex lg:w-16 lg:flex-col">
        <div className="flex grow flex-col items-center justify-between gap-y-5 overflow-y-auto bg-[#1D3752] dark:bg-dark-secondary px-2 py-8">
          <a href="/">
            <SquarePen className="cursor-pointer text-light-primary dark:text-white" />
          </a>
          <VerticalIconContainer>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  'relative flex flex-row items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 duration-150 transition w-full py-2 rounded-lg',
                  link.active
                    ? 'text-light-primary dark:text-white'
                    : 'text-light-primary/70 dark:text-white/70',
                )}
              >
                <link.icon />
                {link.active && (
                  <div className="absolute right-0 -mr-2 h-full w-1 rounded-l-lg bg-[#D0043C] dark:bg-white" />
                )}
              </Link>
            ))}
          </VerticalIconContainer>

          <Link href="/settings">
            <Settings className="cursor-pointer text-light-primary dark:text-white" />
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-primary dark:bg-dark-primary px-4 py-4 shadow-sm lg:hidden">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 h-screen overflow-hidden bg-[#1D3752] lg:p-2 pl-0">
        <Layout>{children}</Layout>
      </div>
    </div>
  );
};

export default Sidebar;
