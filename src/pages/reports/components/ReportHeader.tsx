interface ReportHeaderProps {
  student: {
    name: string;
    grade: string;
    school?: string;
  };
  test: {
    level: number;
    testDate: string;
    testCode?: string;
  };
}

export function ReportHeader({ student, test }: ReportHeaderProps) {
  return (
    <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 mb-6 print:bg-white print:border-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase">
            Student Information
          </h3>
          <p className="text-2xl font-bold text-gray-900">{student.name}</p>
          <p className="text-gray-700 mt-1">Grade: {student.grade}</p>
          {student.school && (
            <p className="text-gray-600 text-sm mt-1">{student.school}</p>
          )}
        </div>

        {/* Test Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase">
            Test Information
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            A-DTM Level {test.level}
          </p>
          {test.testCode && (
            <p className="text-gray-700 mt-1">Code: {test.testCode}</p>
          )}
          <p className="text-gray-600 text-sm mt-1">
            Test Date: {new Date(test.testDate).toLocaleDateString("en-US")}
          </p>
        </div>
      </div>
    </div>
  );
}
