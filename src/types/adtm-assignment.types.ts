export interface AvailableStudent {
  id: string;
  studentId: string;
  name: string;
  avatar: string | null;
  grade: string;
  class: string;
  classId: string | null;
  hasActiveAdtm: boolean;
  lastAdtmTest: {
    testCode: string;
    date: Date;
    score: number;
  } | null;
}

export interface AvailableStudentsResponse {
  students: AvailableStudent[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdtmTemplateForAssignment {
  id: string;
  testCode: string;
  title: string;
  grade: string;
  semester: string;
  totalScore: number;
  questionCount: number;
  section1Count: number;
  section2Count: number;
  section3Count: number;
}

export interface AssignStudentsRequest {
  studentIds: string[];
  templateId: string;
  testDate: string; // ISO date string
  gradingDueDate?: string; // ISO date string
  notes?: string;
  notifyStudents: boolean;
  notifyParents: boolean;
}

export interface AssignStudentsResponse {
  success: boolean;
  assignedCount: number;
  submissions: Array<{
    id: string;
    studentId: string;
    testId: string;
    status: 'PENDING';
  }>;
}

export interface AssignmentFilters {
  grade?: string;
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

