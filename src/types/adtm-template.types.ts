import { TestStatus, DifficultyLevel } from "@/shared/types/enum";

export interface AdtmTemplate {
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
  isActive: boolean;
  createdAt: Date;
}

export interface AdtmTemplateListResponse {
  templates: AdtmTemplate[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdtmTemplateQuestion {
  id: string;
  questionNumber: number;
  score: number;
  difficulty: DifficultyLevel;
}

export interface AdtmTemplateUnit {
  name: string;
  questionCount: number;
  maxScore: number;
  questions: AdtmTemplateQuestion[];
}

export interface AdtmTemplateSection {
  number: number;
  name: string;
  questionCount: number;
  maxScore: number;
  hasSpecialInputs: boolean;
  questions?: AdtmTemplateQuestion[];
  units?: AdtmTemplateUnit[];
}

export interface AdtmTemplateDetails {
  id: string;
  testCode: string;
  title: string;
  grade: string;
  semester: string;
  totalScore: number;
  isActive: boolean;
  pdfFile: string;
  sections: AdtmTemplateSection[];
}

export interface AdtmTemplateDetailsResponse {
  template: AdtmTemplateDetails;
}

export interface AdtmTemplateStatistics {
  totalSubmissions: number;
  completedSubmissions: number;
  inProgressSubmissions: number;
  averageScore: number;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  sectionAverages: Array<{
    sectionNumber: number;
    sectionName: string;
    averageScore: number;
  }>;
}

export interface AdtmTemplateFilters {
  level?: string;
  status?: TestStatus | "All";
  search?: string;
  page?: number;
  limit?: number;
}
