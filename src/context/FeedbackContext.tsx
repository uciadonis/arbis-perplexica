import React, { createContext, useState, useContext, ReactNode } from 'react';

type FeedbackType = 'positive' | 'negative' | null;

interface FeedbackContextProps {
  activeFeedback: Record<string, FeedbackType>;
  setMessageFeedback: (messageId: string, type: FeedbackType) => void;
}

const FeedbackContext = createContext<FeedbackContextProps | undefined>(
  undefined,
);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeFeedback, setActiveFeedback] = useState<
    Record<string, FeedbackType>
  >({});

  const setMessageFeedback = (messageId: string, type: FeedbackType) => {
    setActiveFeedback((prev) => ({
      ...prev,
      [messageId]: type,
    }));
  };

  return (
    <FeedbackContext.Provider value={{ activeFeedback, setMessageFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
