import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questions: Array<{
    id: string;
    questionNumber: number;
  }>;
  answers: Record<string, string>;
  isSubmitting: boolean;
}

export function SubmitModal({
  isOpen,
  onClose,
  onConfirm,
  questions,
  answers,
  isSubmitting,
}: SubmitModalProps) {
  const unansweredQuestions = questions.filter(
    (q) => !answers[q.id] || answers[q.id].trim() === ''
  );

  const hasUnanswered = unansweredQuestions.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Submit Test</h2>
          <p className="text-gray-500 mt-2">
            Please review your submission before confirming
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Answered</span>
            </div>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {questions.length - unansweredQuestions.length}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              hasUnanswered
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                hasUnanswered ? 'text-yellow-700' : 'text-gray-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Unanswered</span>
            </div>
            <p
              className={`text-3xl font-bold mt-2 ${
                hasUnanswered ? 'text-yellow-900' : 'text-gray-900'
              }`}
            >
              {unansweredQuestions.length}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {hasUnanswered && (
          <Alert variant="warning">
            <AlertTriangle className="w-5 h-5" />
            <div className="ml-3">
              <h3 className="font-bold">You have unanswered questions</h3>
              <p className="text-sm mt-1">
                Questions:{' '}
                {unansweredQuestions.map((q) => q.questionNumber).join(', ')}
              </p>
              <p className="text-sm mt-2">
                You can still submit, but these questions will be marked as
                incomplete.
              </p>
            </div>
          </Alert>
        )}

        <Alert variant="info">
          <Info className="w-5 h-5" />
          <div className="ml-3">
            <h3 className="font-bold">Important</h3>
            <p className="text-sm mt-1">
              Once you submit, you cannot change your answers. Make sure you've
              reviewed all questions.
            </p>
          </div>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Review Again
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Confirm Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

