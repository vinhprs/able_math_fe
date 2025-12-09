import api from "@/lib/api";

export const achievementTestsApi = {
  // Step 1: Create setup
  createSetup: async (data: {
    grade: string;
    semester: number;
    examType: string;
    level: string;
    testNumber: string;
    totalQuestions: number;
  }) => {
    const response = await api.post("/achievement-tests/setup", data);
    return response.data.data || response.data;
  },

  // Step 2: Get units
  getUnits: async (params: { grade: string; semester: string }) => {
    const response = await api.get("/achievement-tests/units", { params });
    return response.data.data || response.data;
  },

  // Step 2: Save selected units
  saveUnits: async (
    testId: string,
    data: {
      selectedUnitIds: string[];
    }
  ) => {
    const response = await api.post(`/achievement-tests/${testId}/units`, data);
    return response.data.data || response.data;
  },

  // Step 3: Configure questions
  configureQuestions: async (
    testId: string,
    data: {
      questions: Array<{
        questionNo: number;
        type: string;
        unitId: string;
        score: number;
      }>;
    }
  ) => {
    const response = await api.post(
      `/achievement-tests/${testId}/questions/config`,
      data
    );
    return response.data.data || response.data;
  },

  // Step 4: Enter answers
  enterAnswers: async (
    testId: string,
    data: {
      answers: Array<{
        questionNo: number;
        correctAnswer: string;
      }>;
    }
  ) => {
    const response = await api.post(
      `/achievement-tests/${testId}/answers`,
      data
    );
    return response.data.data || response.data;
  },

  // Step 5: Finalize
  finalizeTest: async (
    testId: string,
    data: {
      nationalAverage: number;
      maxScore: number;
      totalApplicants: number;
    }
  ) => {
    const response = await api.post(
      `/achievement-tests/${testId}/finalize`,
      data
    );
    return response.data.data || response.data;
  },

  // List tests
  getTestList: async (params?: {
    page?: number;
    limit?: number;
    grade?: string;
    status?: string;
  }) => {
    const response = await api.get("/achievement-tests", { params });
    return response.data.data || response.data;
  },

  // Get test detail
  getTestDetail: async (testId: string) => {
    const response = await api.get(`/achievement-tests/${testId}`);
    return response.data.data || response.data;
  },
};
