import { UserRole } from "@/shared/types/enum";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  school?: string;
  grade?: string;
  parentName?: string;
  parentContact?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  school?: string;
  grade?: string;
  parentName?: string;
  parentContact?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  role?: UserRole;
  school?: string;
  grade?: string;
  parentName?: string;
  parentContact?: string;
  isActive?: boolean;
}

export interface QueryUserDto {
  role?: string;
  search?: string;
  school?: string;
  grade?: string;
  isActive?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}
