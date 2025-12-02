import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ReportHeaderProps {
  studentName: string;
  testTitle?: string;
  testLevel?: number;
  testCode?: string;
  testDate: string;
  testType: 'ACHIEVEMENT' | 'ADTM';
}

export function ReportHeader({
  studentName,
  testTitle,
  testLevel,
  testCode,
  testDate,
  testType,
}: ReportHeaderProps) {
  const formattedDate = format(new Date(testDate), 'MMMM dd, yyyy');

  return (
    <Card className="mb-6 print:mb-4">
      <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {testType === 'ACHIEVEMENT' ? 'Achievement Test Report' : 'A-DTM Test Report'}
            </h1>
            <p className="text-primary-100 text-sm md:text-base">
              {testType === 'ACHIEVEMENT'
                ? 'Level Maintenance Test Results'
                : 'Entrance Level Diagnostic Test Results'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-secondary-500 mb-1">Student Name</p>
            <p className="text-lg font-semibold text-secondary-900">{studentName}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-500 mb-1">Test Date</p>
            <p className="text-lg font-semibold text-secondary-900">{formattedDate}</p>
          </div>
          {testTitle && (
            <div>
              <p className="text-sm text-secondary-500 mb-1">Test Title</p>
              <p className="text-lg font-semibold text-secondary-900">{testTitle}</p>
            </div>
          )}
          {testLevel && (
            <div>
              <p className="text-sm text-secondary-500 mb-1">Test Level</p>
              <p className="text-lg font-semibold text-secondary-900">Level {testLevel}</p>
            </div>
          )}
          {testCode && (
            <div>
              <p className="text-sm text-secondary-500 mb-1">Test Code</p>
              <p className="text-lg font-semibold text-secondary-900">{testCode}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

