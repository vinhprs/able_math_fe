/**
 * Assignment status enum
 */
export const AssignmentStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
} as const;

export type AssignmentStatus = typeof AssignmentStatus[keyof typeof AssignmentStatus];

/**
 * Assignment interface
 */
export interface IAssignment {
  id: string;
  testId: string;
  studentId: string;
  classId?: string | null;
  assignedById: string;
  deadline: string | null;
  instructions: string | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;

  // Relations
  test?: {
    id: string;
    testCode: string;
    title: string;
    testType: string;
    gradeLevel: string;
    totalScore: number;
  };

  student?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    grade?: string;
  };

  class?: {
    id: string;
    name: string;
  } | null;

  assignedBy?: {
    id: string;
    fullName: string;
  };
}

/**
 * DTO for assigning test to a class
 */
export interface IAssignToClassDto {
  testId: string;
  classId: string;
  deadline?: string;
  instructions?: string;
}

/**
 * DTO for assigning test to specific students
 */
export interface IAssignToStudentsDto {
  testId: string;
  studentIds: string[];
  deadline?: string;
  instructions?: string;
}

/**
 * Query parameters for filtering teacher assignments
 */
export interface IAssignmentQueryParams {
  page?: number;
  limit?: number;
  testId?: string;
  classId?: string;
  studentId?: string;
  status?: AssignmentStatus;
}

/**
 * Query parameters for filtering student assignments
 */
export interface IStudentAssignmentQueryParams {
  page?: number;
  limit?: number;
  status?: AssignmentStatus;
  hasDeadline?: boolean;
  overdue?: boolean;
}

/**
 * Paginated assignments response
 * Backend returns: { data: IAssignment[], total: number, page: number, totalPages: number }
 */
export interface IPaginatedAssignmentsResponse {
  data: IAssignment[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Response from assign-to-class endpoint
 */
export interface IAssignToClassResponse {
  message: string;
  classId: string;
  className: string;
  testId: string;
  testTitle: string;
  assignedCount: number;
  skippedCount: number;
  deadline?: string;
}

/**
 * Student assignment detail response
 */
export interface IStudentAssignmentDetail {
  id: string;
  test: {
    id: string;
    title: string;
    testCode: string;
    totalScore: number;
    questionCount: number;
  };
  assignedBy: {
    fullName: string;
  };
  status: AssignmentStatus;
  deadline: string | null;
  isOverdue: boolean;
  timeRemaining: {
    days: number;
    hours: number;
  } | null;
  assignedAt: string;
  submission: {
    id: string;
    status: string;
    score: number | null;
    submittedAt: string;
    gradedAt: string | null;
  } | null;
  canStart: boolean;
  canContinue: boolean;
  canViewResult: boolean;
}

/**
 * Upcoming deadline response
 */
export interface IUpcomingDeadline {
  id: string;
  testTitle: string;
  testCode: string;
  deadline: string;
  timeRemaining: {
    days: number;
    hours: number;
  };
}

/**
 * Student assignment statistics
 */
export interface IStudentAssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  graded: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
}

