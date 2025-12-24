
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message } from '../types';

const safeParseJson = (text: string) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parsing Error:", e, "Original text:", text);
    throw new Error("Format Error: AI returned invalid JSON. Please try again.");
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  // AI Teacher
  async chatWithTeacher(prompt: string, history: Message[], lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    
    const formattedHistory = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are "EARTH GURU", the lead AI educator for SEARCH EARTH. 
        Focus: Indian Competitive Exams (UPSC, SSC, Railway) and K-12. 
        Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.
        Response Style: Concise, point-wise, encouraging.`,
      },
    });

    return response.text;
  },

  // Photo Question Solver
  async solvePhotoQuestion(base64Image: string, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Strictly analyze the educational question in this image. Solve it step-by-step. Use ${lang === Language.HINDI ? 'Hindi' : 'English'}.` }
        ]
      },
    });
    return response.text;
  },

  // Quiz Generator
  async generateQuiz(topic: string, count: number = 5, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a ${count} question quiz about "${topic}" for competitive exams. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return safeParseJson(response.text || '[]');
  },

  // Study Planner
  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a ${days}-day rigorous study plan for ${exam}. Break it down into specific hourly slots. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exam: { type: Type.STRING },
            duration: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  slots: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        activity: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    return safeParseJson(response.text || '{}');
  },

  // Current Affairs with Search
  async getDailyCurrentAffairs(lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const today = new Date().toDateString();
    const response = await ai.models.generateContent({
      model,
      contents: `List the top 5 most critical current affairs for today (${today}) relevant to Indian government exams. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "";
    // Simplified parsing
    return [{ title: "Today's Headlines", summary: text, category: "National", date: today }];
  }
};
