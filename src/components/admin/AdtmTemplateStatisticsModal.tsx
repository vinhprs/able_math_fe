import { Modal, Card, CardContent, CardHeader, CardTitle, Alert } from '@/components/ui';
import { useAdtmTemplateStatistics } from '@/hooks/useAdtmTemplates';
import { Loader2 } from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdtmTemplateStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
}

export function AdtmTemplateStatisticsModal({
  isOpen,
  onClose,
  templateId,
}: AdtmTemplateStatisticsModalProps) {
  const { data, isLoading } = useAdtmTemplateStatistics(templateId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Statistics" size="xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-secondary-500 mb-1">Total Submissions</p>
                <p className="text-2xl font-bold">{data.totalSubmissions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-secondary-500 mb-1">Completed</p>
                <p className="text-2xl font-bold">{data.completedSubmissions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-secondary-500 mb-1">In Progress</p>
                <p className="text-2xl font-bold">{data.inProgressSubmissions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-secondary-500 mb-1">Average Score</p>
                <p className="text-2xl font-bold">{data.averageScore.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution Chart */}
          {data.scoreDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-secondary-200" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Section Performance Chart */}
          {data.sectionAverages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Score by Section</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={data.sectionAverages}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-secondary-200" />
                    <XAxis
                      dataKey="sectionName"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      domain={[0, 100]}
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Average Score']}
                    />
                    <Bar dataKey="averageScore" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {data.totalSubmissions === 0 && (
            <Alert variant="info">No submissions yet for this template.</Alert>
          )}
        </div>
      ) : (
        <p className="text-center text-secondary-500 py-12">Statistics not available</p>
      )}
    </Modal>
  );
}

