import { ReportHeader } from './ReportHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ReportBarChart } from '@/components/charts/ReportBarChart';
import { ReportRadarChart } from '@/components/charts/ReportRadarChart';
import { cn } from '@/lib/cn';
import type { AdtmReportData } from '@/types/reports.types';

interface AdtmReportProps {
  reportData: AdtmReportData;
}

/**
 * Get grade based on score
 */
function getGrade(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Satisfactory';
  if (score >= 60) return 'Needs Improvement';
  return 'Requires Attention';
}

/**
 * Get color class based on score
 */
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background gradient based on score
 */
function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-500 to-green-600';
  if (score >= 60) return 'from-yellow-500 to-yellow-600';
  return 'from-red-500 to-red-600';
}

export function AdtmReport({ reportData }: AdtmReportProps) {
  return (
    <div className="report-card space-y-6 print:space-y-4">
      {/* Header */}
      <ReportHeader
        studentName={reportData.student.name}
        testLevel={reportData.test.level}
        testCode={reportData.test.testCode}
        testDate={reportData.test.testDate}
        testType="ADTM"
      />

      {/* Overall Score */}
      <Card className="mb-6 print:mb-4">
        <CardContent className="p-6">
          <div
            className={cn(
              'bg-gradient-to-r rounded-lg p-8 text-center text-white',
              getScoreGradient(reportData.overallScore)
            )}
          >
            <h2 className="text-xl font-semibold mb-2">Overall Standard Score</h2>
            <div className="text-6xl font-bold mb-2">{reportData.overallScore.toFixed(1)}%</div>
            <div className="text-lg opacity-90">{getGrade(reportData.overallScore)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Section Scores Chart */}
      <ReportBarChart
        title="Section Performance"
        data={reportData.charts.sectionBar}
        height={350}
        color="#8b5cf6"
      />

      {/* Section Details */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.sections.map((section) => (
              <div
                key={section.number}
                className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-secondary-900">
                    Section {section.number}: {section.name}
                  </h3>
                </div>
                <div className={cn('text-3xl font-bold mb-2', getScoreColor(section.standardScore))}>
                  {section.standardScore.toFixed(1)}%
                </div>
                <div className="text-sm text-secondary-600 mb-3">
                  {section.rawScore} / {section.maxScore} points
                </div>
                {section.correctCount !== undefined && (
                  <div className="text-xs text-secondary-500 space-y-1">
                    <div>Correct: {section.correctCount}</div>
                    {section.mistakeCount !== undefined && (
                      <div>Mistake: {section.mistakeCount}</div>
                    )}
                    {section.unsolvedCount !== undefined && (
                      <div>Unsolved: {section.unsolvedCount}</div>
                    )}
                  </div>
                )}
                {section.unitScores && section.unitScores.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-700 mb-2">Unit Scores:</p>
                    <div className="space-y-1">
                      {section.unitScores.map((unit) => (
                        <div
                          key={unit.unitName}
                          className="flex justify-between text-xs text-secondary-600"
                        >
                          <span>{unit.unitName}</span>
                          <span className="font-medium">
                            {unit.standardScore.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unit Balance Radar Chart */}
      <ReportRadarChart
        title="Unit Balance Analysis"
        data={reportData.charts.unitRadar}
        height={400}
        color="#8b5cf6"
      />

      {/* Recommendations */}
      <Card className="print:break-inside-avoid">
        <CardHeader className="bg-yellow-50 border-b border-yellow-200">
          <CardTitle className="text-yellow-900">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {reportData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-yellow-600 font-bold mt-1">✓</span>
                <span className="text-secondary-700 flex-1">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

