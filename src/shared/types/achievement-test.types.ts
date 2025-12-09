// ✅ Only Elementary grades
export enum GradeLevel {
  E4 = "E4",
  E5 = "E5",
  E6 = "E6",
}

export enum ExamType {
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
}

export enum DifficultyLevel {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SHORT_ANSWER = "SHORT_ANSWER",
}

export interface TestSetupData {
  testId?: string;
  testCode?: string;
  // ✅ curriculum is always "2015개정" (not in form)
  grade: GradeLevel;
  semester: number;
  examType: ExamType;
  level: DifficultyLevel;
  testNumber: string;
  totalQuestions: number;
  selectedUnits?: CurriculumUnit[];
  questions?: QuestionConfig[];
  answers?: AnswerEntry[];
  statistics?: TestStatistics;
}

export interface CurriculumUnit {
  id: string;
  unitName: string;
  displayOrder: number;
}

export interface QuestionConfig {
  questionNo: number;
  type: QuestionType;
  unitId: string;
  unitName?: string;
  score: number;
}

export interface AnswerEntry {
  questionNo: number;
  correctAnswer: string;
}

export interface TestStatistics {
  nationalAverage: number; // ✅ REQUIRED
  maxScore: number; // ✅ REQUIRED
  totalApplicants: number; // ✅ REQUIRED
}

export interface AchievementTest {
  id: string;
  testCode: string;
  grade: string;
  semester: string;
  examType: string;
  level: string;
  testNumber: string;
  totalQuestions: number;
  totalScore: number;
  nationalAverage: number;
  maxScore: number;
  totalApplicants: number;
  status: string;
  createdAt: string;
  questions?: QuestionDetail[];
}

export interface QuestionDetail {
  questionNo: number;
  type: string;
  unitName: string;
  correctAnswer: string;
  score: number;
}
