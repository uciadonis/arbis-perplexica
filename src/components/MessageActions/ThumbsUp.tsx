import { useState, useEffect } from 'react';
import { ThumbsUp as ThumbsUpIcon } from 'lucide-react';
import { toast } from 'sonner';

const ThumbsUp = ({ messageId }: { messageId: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estado de feedback al montar el componente
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?messageId=${messageId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.feedback && data.feedback.feedback === 'positive') {
            setIsActive(true);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, [messageId]);

  const handleThumbsUp = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback: 'positive',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }

      setIsActive(!isActive); // Toggle para permitir quitar el thumbs up
      if (!isActive) {
        toast.success('¡Gracias por tu valoración positiva!');
      } else {
        toast.info('Has eliminado tu valoración');
      }
    } catch (error) {
      console.error('Error saving thumbs up:', error);
      toast.error('No se pudo guardar la valoración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleThumbsUp}
      disabled={isLoading}
      className={`p-2 rounded-xl transition duration-200 hover:bg-light-secondary dark:hover:bg-dark-secondary ${
        isActive
          ? 'text-green-500 dark:text-green-400'
          : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <ThumbsUpIcon size={18} />
    </button>
  );
};

export default ThumbsUp;
