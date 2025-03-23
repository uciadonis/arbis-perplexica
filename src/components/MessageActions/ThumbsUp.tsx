import { ThumbsUp as ThumbsUpIcon } from 'lucide-react';

const ThumbsUp = ({
  thumbsUp,
  messageId,
}: {
  thumbsUp?: (messageId: string) => void;
  messageId: string;
}) => {
  return (
    <button
      onClick={() => thumbsUp?.(messageId)}
      className="py-2 px-3 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex flex-row items-center space-x-1"
    >
      <ThumbsUpIcon size={18} />
      <p className="text-xs font-medium"></p>
    </button>
  );
};

export default ThumbsUp;
