import { useState } from 'react';
import { ThumbsDown as ThumbsDownIcon } from 'lucide-react';
import { toast } from 'sonner';

const ThumbsDown = ({ messageId }: { messageId: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');

  const handleThumbsDown = async () => {
    if (isLoading) return;

    if (!showFeedbackForm) {
      setShowFeedbackForm(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback: 'negative',
          comment: feedbackComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }

      setIsActive(true);
      setShowFeedbackForm(false);
      toast.success('¡Gracias por tu valoración!');
    } catch (error) {
      console.error('Error saving thumbs down:', error);
      toast.error('No se pudo guardar la valoración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleThumbsDown}
        disabled={isActive || isLoading}
        className={`p-2 rounded-xl transition duration-200 hover:bg-light-secondary dark:hover:bg-dark-secondary ${
          isActive
            ? 'text-red-500 dark:text-red-400'
            : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <ThumbsDownIcon size={18} />
      </button>

      {showFeedbackForm && !isActive && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-dark-primary rounded-md shadow-lg w-64 z-50 border border-light-secondary dark:border-dark-secondary">
          <p className="text-sm text-black dark:text-white mb-2">
            ¿Por qué no te gustó esta respuesta?
          </p>
          <textarea
            className="w-full p-2 text-sm border border-light-secondary dark:border-dark-secondary rounded-md bg-light-primary dark:bg-dark-secondary text-black dark:text-white mb-2"
            placeholder="Por favor, danos más detalles (opcional)"
            rows={3}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          />
          <div className="flex justify-between">
            <button
              onClick={() => setShowFeedbackForm(false)}
              className="text-xs py-1 px-2 text-black/70 dark:text-white/70"
            >
              Cancelar
            </button>
            <button
              onClick={handleThumbsDown}
              className="text-xs py-1 px-3 bg-light-secondary dark:bg-dark-secondary rounded-md text-black dark:text-white"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbsDown;
