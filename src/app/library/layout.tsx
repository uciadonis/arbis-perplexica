import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Historial - Arbis',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-light-primary dark:bg-dark-primary h-full rounded-lg">
      <div className="h-full">{children}</div>
    </main>
  );
};

export default Layout;
