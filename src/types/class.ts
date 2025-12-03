export interface IClass {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  grade: string;
  term?: string;
  schoolYear?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    fullName: string;
    email: string;
  };
  students?: IStudent[];
  studentCount?: number;
}

export interface IStudent {
  id: string;
  username: string;
  email: string;
  fullName: string;
  grade?: string;
  isActive: boolean;
}

export interface ICreateClassDto {
  name: string;
  description?: string;
  grade: string;
  term?: string;
  schoolYear?: string;
  isActive?: boolean;
}

export interface IUpdateClassDto extends Partial<ICreateClassDto> {}

export interface IClassQueryParams {
  page?: number;
  limit?: number;
  grade?: string;
  term?: string;
  isActive?: boolean;
  search?: string;
}

export interface IPaginatedClassResponse {
  data: IClass[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IClassStatistics {
  totalStudents: number;
  activeStudents: number;
  grade: string;
  term?: string;
}

