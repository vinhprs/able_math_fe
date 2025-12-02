import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useResultDetail } from '@/hooks/useResults';
import { formatDateTime } from '@/lib/utils';
import { ScoreSummary } from './components/ScoreSummary';
import { QuestionBreakdown } from './components/QuestionBreakdown';
import { UnitScoreChart } from './components/UnitScoreChart';
import { StatisticsView } from './components/StatisticsView';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-secondary-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-20 bg-secondary-200 rounded animate-pulse"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ResultDetail() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  // Fetch result detail
  const { data: result, isLoading } = useResultDetail(submissionId || '');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('PDF download will be implemented in Phase 4');
  };

  if (isLoading) return <LoadingSkeleton />;
  if (!result) return null;

  const { test, scores, questions, unitScores, submission } = result;

  return (
    <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/student/results')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">{test.title}</h1>
              <p className="text-secondary-500">{test.testCode}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block border-b border-secondary-200 pb-4 mb-4">
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-secondary-600">{test.testCode}</p>
          <p className="text-sm text-secondary-500 mt-2">
            Graded: {formatDateTime(submission.gradedAt)}
          </p>
        </div>

        {/* Success Alert */}
        <Alert variant={scores.standardScore >= 70 ? 'success' : 'warning'}>
          {scores.standardScore >= 70 ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <div className="ml-3">
                <h3 className="font-bold">Great job! You passed this test.</h3>
                <p className="text-sm mt-1">
                  Your score of {Math.round(scores.standardScore)}% exceeds the passing
                  threshold.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <div className="ml-3">
                <h3 className="font-bold">Keep practicing!</h3>
                <p className="text-sm mt-1">
                  Your score of {Math.round(scores.standardScore)}% is below the passing
                  threshold. Review the questions below to improve.
                </p>
              </div>
            </>
          )}
        </Alert>

        {/* Score Summary */}
        <ScoreSummary
          totalScore={scores.totalRawScore}
          maxScore={scores.maxScore}
          standardScore={scores.standardScore}
          questions={questions}
          submittedAt={submission.submittedAt}
          gradedAt={submission.gradedAt}
        />

        {/* Unit Scores Chart */}
        {unitScores && unitScores.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Performance by Unit</h2>
            <UnitScoreChart unitScores={unitScores} />
          </Card>
        )}

        {/* Tabs: Question Breakdown / Statistics */}
        <Tabs defaultValue="questions" className="print:hidden">
          <TabsList>
            <TabsTrigger value="questions">Question Breakdown</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionBreakdown questions={questions} />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsView questions={questions} unitScores={unitScores} />
          </TabsContent>
        </Tabs>

        {/* Print Version: All content */}
        <div className="hidden print:block space-y-6">
          <QuestionBreakdown questions={questions} />
        </div>
      </div>
  );
}
