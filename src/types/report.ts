/**
 * Report Status Enum
 * Tracks the approval and publishing status of reports
 */
export enum ReportStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

/**
 * Pending report interface for teacher review list
 */
export interface PendingReport {
  id: string;
  submissionId: string;
  studentName: string;
  testTitle: string;
  testCode: string;
  createdAt: string;
  totalScore: number;
}

/**
 * Report Card interface
 * Matches backend ReportCard entity
 */
export interface ReportCard {
  id: string;
  submissionId: string;
  studentId: string;
  testId: string;
  status: ReportStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  reviewComment: string | null;
  pdfUrl: string | null;
  isPublished: boolean;
  reportData: {
    studentInfo: {
      name: string;
      grade: string;
      school: string;
    };
    testInfo: {
      testCode: string;
      testType: string;
      title: string;
      date: string;
    };
    scores: {
      totalScore: number;
      standardScore: number;
      percentile?: number;
    };
    sectionPerformance?: Array<{
      sectionNumber: number;
      sectionName: string;
      score: number;
      maxScore: number;
      standardScore: number;
      units?: Array<{
        unitName: string;
        score: number;
        maxScore: number;
      }>;
    }>;
    analysis?: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    adtmData?: {
      recommendedLevel: number;
      concentrationLevel: number;
      section1Analysis: {
        correct: number;
        mistake: number;
        unsolved: number;
      };
    };
  };
  // Relations (optional, populated when loaded with relations)
  test?: {
    id: string;
    testCode: string;
    title: string;
    testType: string;
  };
  submission?: {
    id: string;
    totalScore: number;
    standardScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for approving a report
 */
export interface ApproveReportDto {
  comment?: string;
}

/**
 * DTO for rejecting a report
 */
export interface RejectReportDto {
  reason: string;
}

