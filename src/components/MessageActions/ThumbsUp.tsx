import { useState, useEffect } from 'react';
import { ThumbsUp as ThumbsUpIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useFeedback } from '../../context/FeedbackContext';

const ThumbsUp = ({ messageId }: { messageId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { activeFeedback, setMessageFeedback } = useFeedback();

  const isActive = activeFeedback[messageId] === 'positive';

  // Cargar estado de feedback al montar el componente
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/feedback?messageId=${messageId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.feedback) {
            setMessageFeedback(messageId, data.feedback.feedback);
          } else {
            // Asegurarse de que se establece como null si no hay feedback
            setMessageFeedback(messageId, null);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    // Solo cargar si aún no tenemos un valor en el contexto
    if (activeFeedback[messageId] === undefined) {
      fetchFeedback();
    }
  }, [messageId, setMessageFeedback, activeFeedback]);

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

      const data = await response.json();

      // Actualizar el estado según la acción realizada
      if (data.action === 'removed') {
        setMessageFeedback(messageId, null);
        toast.info('Has eliminado tu valoración');
      } else if (data.action === 'added' || data.action === 'changed') {
        setMessageFeedback(messageId, 'positive');
        toast.success('¡Gracias por tu valoración positiva!');
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
