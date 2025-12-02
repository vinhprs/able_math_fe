import { TestType, TestStatus, DifficultyLevel, Term } from '@shared/types/enum';

/**
 * Test interface matching backend entity
 */
export interface ITest {
  id: string;
  testCode: string;
  testType: TestType;
  title: string;
  grade: string;
  curriculum: string;
  semester: string;
  term: string;
  level: number;
  totalScore: number;
  status: TestStatus;
  creatorId: string;
  creator?: {
    id: string;
    username: string;
    fullName: string;
  };
  questions?: ITestQuestion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Test question interface
 */
export interface ITestQuestion {
  id: string;
  testId: string;
  questionNumber: number;
  sectionNumber: number;
  unitName: string | null;
  questionText: string;
  questionImage: string | null;
  correctAnswer: string;
  score: number;
  difficulty: DifficultyLevel | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Test statistics
 */
export interface ITestStatistics {
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

/**
 * Test detail with questions and statistics
 */
export interface ITestDetail extends ITest {
  questions: ITestQuestion[];
  statistics?: ITestStatistics;
}

/**
 * Create test DTO
 */
export interface ICreateTestDto {
  title: string;
  curriculum: string;
  grade: string;
  semester: string;
  term: Term;
  level: number;
}

/**
 * Update test DTO
 */
export interface IUpdateTestDto {
  title?: string;
  curriculum?: string;
  grade?: string;
  semester?: string;
  term?: Term;
  level?: number;
}

/**
 * Create question DTO
 */
export interface ICreateQuestionDto {
  questionNumber: number;
  unitName: string;
  correctAnswer: string;
  score: number;
  difficulty: DifficultyLevel;
  questionText?: string;
  questionImage?: string;
}

/**
 * Test query filters
 */
export interface ITestQueryFilters {
  page?: number;
  limit?: number;
  testType?: TestType;
  grade?: string;
  status?: TestStatus;
  curriculum?: string;
  search?: string;
}

/**
 * Paginated test response
 */
export interface IPaginatedTestResponse {
  data: ITest[];
  total: number;
  page: number;
  totalPages: number;
}

