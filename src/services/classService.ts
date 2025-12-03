import api from '@/lib/api';
import type {
  IClass,
  ICreateClassDto,
  IUpdateClassDto,
  IClassQueryParams,
  IPaginatedClassResponse,
  IClassStatistics,
} from '@/types/class';

/**
 * Class service for API calls
 * All methods use the configured axios instance with auth interceptors
 */
export const classService = {
  /**
   * Get all classes with optional filters
   */
  async getAll(params?: IClassQueryParams): Promise<IPaginatedClassResponse> {
    const response = await api.get<{ success: boolean; data: IPaginatedClassResponse; timestamp: string }>(
      '/classes',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get class by ID
   */
  async getById(id: string): Promise<IClass> {
    const response = await api.get<{ success: boolean; data: IClass; timestamp: string }>(
      `/classes/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new class
   */
  async create(data: ICreateClassDto): Promise<IClass> {
    const response = await api.post<{ success: boolean; data: IClass; timestamp: string }>(
      '/classes',
      data
    );
    return response.data.data;
  },

  /**
   * Update class
   */
  async update(id: string, data: IUpdateClassDto): Promise<IClass> {
    const response = await api.put<{ success: boolean; data: IClass; timestamp: string }>(
      `/classes/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete class
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/classes/${id}`);
  },

  /**
   * Add students to class
   */
  async addStudents(classId: string, studentIds: string[]): Promise<IClass> {
    const response = await api.post<{ success: boolean; data: IClass; timestamp: string }>(
      `/classes/${classId}/students`,
      { studentIds }
    );
    return response.data.data;
  },

  /**
   * Remove student from class
   */
  async removeStudent(classId: string, studentId: string): Promise<IClass> {
    const response = await api.delete<{ success: boolean; data: IClass; timestamp: string }>(
      `/classes/${classId}/students/${studentId}`
    );
    return response.data.data;
  },

  /**
   * Get class statistics
   */
  async getStatistics(classId: string): Promise<IClassStatistics> {
    const response = await api.get<{ success: boolean; data: IClassStatistics; timestamp: string }>(
      `/classes/${classId}/statistics`
    );
    return response.data.data;
  },
};

