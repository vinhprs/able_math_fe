/**
 * A-DTM Template Data Structure
 *
 * This file contains template definitions for all 14 A-DTM test levels.
 * Each template defines the structure of questions, units, and sections.
 *
 * Note: Actual question data should be loaded from backend or complete_adtm_data.json
 */

export interface AdtmQuestion {
  number: number;
  score: number;
  difficulty?: number;
  unit?: string; // Only for sections 2-3
}

export interface AdtmSection {
  id: number; // 1-5
  name: string;
  questionCount: number;
  maxScore: number;
  hasSpecialInputs?: boolean; // Only section 1
  units?: string[]; // Only sections 2-3
  questions: AdtmQuestion[];
}

export interface AdtmTemplate {
  testId: number;
  testCode: string; // 'E3-1', 'E4-2', etc.
  testName: string; // 'A-DTM E3-1'
  grade: string; // 'Elementary 3', 'Middle 1', etc.
  sections: AdtmSection[];
}

/**
 * Helper function to create Section 1 questions (30 questions, varying scores)
 */
function createSection1Questions(): AdtmQuestion[] {
  return Array.from({ length: 30 }, (_, i) => ({
    number: i + 1,
    score: 3 + (i % 3), // Varies: 3, 4, 5
    difficulty: Math.floor(i / 10) + 1, // 1, 2, 3
  }));
}

/**
 * Helper function to create Section 4/5 questions (4 questions, 10 points each)
 */
function createSection4Or5Questions(): AdtmQuestion[] {
  return Array.from({ length: 4 }, (_, i) => ({
    number: i + 1,
    score: 10,
    difficulty: 4,
  }));
}

/**
 * E3-1 Template
 * Units: 덧셈과 뺄셈, 평면도형, 나눗셈, 곱셈, 길이와 시간, 분수와 소수
 */
const ADTM_E3_1: AdtmTemplate = {
  testId: 101,
  testCode: "E3-1",
  testName: "A-DTM E3-1",
  grade: "Elementary 3",
  sections: [
    {
      id: 1,
      name: "Calculation Ability",
      questionCount: 30,
      maxScore: 100,
      hasSpecialInputs: true,
      questions: createSection1Questions(),
    },
    {
      id: 2,
      name: "Conceptual Understanding",
      questionCount: 10,
      maxScore: 100,
      units: [
        "1.덧셈과 뺄셈",
        "2.평면도형",
        "3.나눗셈",
        "4.곱셈",
        "5.길이와 시간",
        "6.분수와 소수",
      ],
      questions: [
        { number: 1, score: 8, unit: "1.덧셈과 뺄셈", difficulty: 1 },
        { number: 2, score: 10, unit: "2.평면도형", difficulty: 2 },
        { number: 3, score: 8, unit: "3.나눗셈", difficulty: 3 },
        { number: 4, score: 12, unit: "3.나눗셈", difficulty: 2 },
        { number: 5, score: 8, unit: "4.곱셈", difficulty: 2 },
        { number: 6, score: 10, unit: "4.곱셈", difficulty: 2 },
        { number: 7, score: 10, unit: "5.길이와 시간", difficulty: 2 },
        { number: 8, score: 10, unit: "6.분수와 소수", difficulty: 2 },
        { number: 9, score: 12, unit: "6.분수와 소수", difficulty: 3 },
        { number: 10, score: 12, unit: "6.분수와 소수", difficulty: 3 },
      ],
    },
    {
      id: 3,
      name: "Conceptual Application",
      questionCount: 15,
      maxScore: 100,
      units: [
        "1.덧셈과 뺄셈",
        "2.평면도형",
        "3.나눗셈",
        "4.곱셈",
        "5.길이와 시간",
        "6.분수와 소수",
      ],
      questions: Array.from({ length: 15 }, (_, i) => ({
        number: i + 1,
        score: 6 + (i % 3), // Varies: 6, 7, 8
        unit: `1.덧셈과 뺄셈`, // Simplified - should be distributed across units
        difficulty: Math.floor(i / 5) + 1,
      })),
    },
    {
      id: 4,
      name: "Reasoning Ability",
      questionCount: 4,
      maxScore: 40,
      questions: createSection4Or5Questions(),
    },
    {
      id: 5,
      name: "Problem-Solving Ability",
      questionCount: 4,
      maxScore: 40,
      questions: createSection4Or5Questions(),
    },
  ],
};

/**
 * Placeholder templates for other levels
 * In production, these should be populated with actual data from complete_adtm_data.json
 */
const createTemplate = (
  testCode: string,
  testId: number,
  grade: string,
  units: string[]
): AdtmTemplate => ({
  testId,
  testCode,
  testName: `A-DTM ${testCode}`,
  grade,
  sections: [
    {
      id: 1,
      name: "Calculation Ability",
      questionCount: 30,
      maxScore: 100,
      hasSpecialInputs: true,
      questions: createSection1Questions(),
    },
    {
      id: 2,
      name: "Conceptual Understanding",
      questionCount: 10,
      maxScore: 100,
      units,
      questions: Array.from({ length: 10 }, (_, i) => ({
        number: i + 1,
        score: 8 + (i % 3), // Varies
        unit: units[i % units.length],
        difficulty: Math.floor(i / 3) + 1,
      })),
    },
    {
      id: 3,
      name: "Conceptual Application",
      questionCount: 15,
      maxScore: 100,
      units,
      questions: Array.from({ length: 15 }, (_, i) => ({
        number: i + 1,
        score: 6 + (i % 3),
        unit: units[i % units.length],
        difficulty: Math.floor(i / 5) + 1,
      })),
    },
    {
      id: 4,
      name: "Reasoning Ability",
      questionCount: 4,
      maxScore: 40,
      questions: createSection4Or5Questions(),
    },
    {
      id: 5,
      name: "Problem-Solving Ability",
      questionCount: 4,
      maxScore: 40,
      questions: createSection4Or5Questions(),
    },
  ],
});

// E3-2
const ADTM_E3_2 = createTemplate("E3-2", 102, "Elementary 3", [
  "1.덧셈과 뺄셈",
  "2.평면도형",
  "3.나눗셈",
  "4.곱셈",
  "5.길이와 시간",
  "6.분수와 소수",
]);

// E4-1
const ADTM_E4_1 = createTemplate("E4-1", 103, "Elementary 4", [
  "1.큰수",
  "2.각도",
  "3.곱셈과 나눗셈",
  "4.평면도형의 이동",
  "5.막대그래프",
  "6.규칙찾기",
]);

// E4-2
const ADTM_E4_2 = createTemplate("E4-2", 104, "Elementary 4", [
  "1.큰수",
  "2.각도",
  "3.곱셈과 나눗셈",
  "4.평면도형의 이동",
  "5.막대그래프",
  "6.규칙찾기",
]);

// E5-1
const ADTM_E5_1 = createTemplate("E5-1", 105, "Elementary 5", [
  "1.자연수의 혼합 계산",
  "2.약수와 배수",
  "3.분수의 덧셈과 뺄셈",
  "4.다각형",
  "5.분수의 곱셈",
  "6.소수의 덧셈과 뺄셈",
]);

// E5-2
const ADTM_E5_2 = createTemplate("E5-2", 106, "Elementary 5", [
  "1.자연수의 혼합 계산",
  "2.약수와 배수",
  "3.분수의 덧셈과 뺄셈",
  "4.다각형",
  "5.분수의 곱셈",
  "6.소수의 덧셈과 뺄셈",
]);

// E6-1
const ADTM_E6_1 = createTemplate("E6-1", 107, "Elementary 6", [
  "1.분수의 나눗셈",
  "2.소수의 곱셈과 나눗셈",
  "3.비와 비율",
  "4.원의 넓이",
  "5.직육면체",
  "6.자료의 정리",
]);

// E6-2
const ADTM_E6_2 = createTemplate("E6-2", 108, "Elementary 6", [
  "1.분수의 나눗셈",
  "2.소수의 곱셈과 나눗셈",
  "3.비와 비율",
  "4.원의 넓이",
  "5.직육면체",
  "6.자료의 정리",
]);

// M1-1
const ADTM_M1_1 = createTemplate("M1-1", 109, "Middle 1", [
  "1.소인수분해",
  "2.최대공약수와 최소공배수",
  "3.정수와 유리수",
  "4.유리수의 덧셈과 뺄셈",
  "5.유리수의 곱셈과 나눗셈",
  "6.문자와 식",
]);

// M1-2
const ADTM_M1_2 = createTemplate("M1-2", 110, "Middle 1", [
  "1.소인수분해",
  "2.최대공약수와 최소공배수",
  "3.정수와 유리수",
  "4.유리수의 덧셈과 뺄셈",
  "5.유리수의 곱셈과 나눗셈",
  "6.문자와 식",
]);

// M2-1
const ADTM_M2_1 = createTemplate("M2-1", 111, "Middle 2", [
  "1.유리수와 순환소수",
  "2.단항식의 계산",
  "3.다항식의 계산",
  "4.일차부등식",
  "5.연립일차방정식",
  "6.일차함수",
]);

// M2-2
const ADTM_M2_2 = createTemplate("M2-2", 112, "Middle 2", [
  "1.유리수와 순환소수",
  "2.단항식의 계산",
  "3.다항식의 계산",
  "4.일차부등식",
  "5.연립일차방정식",
  "6.일차함수",
]);

// M3-1
const ADTM_M3_1 = createTemplate("M3-1", 113, "Middle 3", [
  "1.제곱근과 실수",
  "2.인수분해",
  "3.이차방정식",
  "4.이차함수",
  "5.삼각비",
  "6.원의 성질",
]);

// M3-2
const ADTM_M3_2 = createTemplate("M3-2", 114, "Middle 3", [
  "1.제곱근과 실수",
  "2.인수분해",
  "3.이차방정식",
  "4.이차함수",
  "5.삼각비",
  "6.원의 성질",
]);

/**
 * All A-DTM templates
 */
export const ADTM_TEMPLATES: Record<string, AdtmTemplate> = {
  "E3-1": ADTM_E3_1,
  "E3-2": ADTM_E3_2,
  "E4-1": ADTM_E4_1,
  "E4-2": ADTM_E4_2,
  "E5-1": ADTM_E5_1,
  "E5-2": ADTM_E5_2,
  "E6-1": ADTM_E6_1,
  "E6-2": ADTM_E6_2,
  "M1-1": ADTM_M1_1,
  "M1-2": ADTM_M1_2,
  "M2-1": ADTM_M2_1,
  "M2-2": ADTM_M2_2,
  "M3-1": ADTM_M3_1,
  "M3-2": ADTM_M3_2,
};

/**
 * Get A-DTM template by test code
 */
export function getAdtmTemplate(testCode: string): AdtmTemplate | null {
  return ADTM_TEMPLATES[testCode] || null;
}

/**
 * Get all available template codes
 */
export function getAvailableTemplateCodes(): string[] {
  return Object.keys(ADTM_TEMPLATES);
}
