import ChatWindow from '@/components/ChatWindow';
import React from 'react';
import { Suspense } from 'react';

const Page = ({ params }: { params: Promise<{ chatId: string }> }) => {
  const { chatId } = React.use(params);
  // return <ChatWindow id={chatId} />;
  return (
    <Suspense>
      <ChatWindow id={chatId} />
    </Suspense>
  );
};

export default Page;
