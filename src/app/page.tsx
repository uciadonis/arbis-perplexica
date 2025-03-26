import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Chat - Arbis',
  description: 'Chat with the internet, chat with Arbis.',
};

const Home = () => {
  return (
    <div className="h-full">
      <Suspense>
        <ChatWindow />
      </Suspense>
    </div>
  );
};

export default Home;
