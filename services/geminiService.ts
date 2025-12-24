
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message } from '../types';

const safeParseJson = (text: string) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parsing Error:", e, "Original text:", text);
    throw new Error("AI response format error. Please try again.");
  }
};

/**
 * Robustly gets the API key from the environment.
 */
const getApiKey = () => {
  return (window as any).process?.env?.API_KEY || process.env.API_KEY;
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  hasKey() {
    return !!getApiKey();
  },

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
        systemInstruction: `You are "EARTH GURU", a world-class AI teacher for SEARCH EARTH edtech. 
        Focus: Indian Competitive Exams (UPSC, SSC, Railway) and K-12. 
        Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.
        Always encourage students. Use simple but effective terminology.`,
      },
    });

    return response.text;
  },

  async solvePhotoQuestion(base64Image: string, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Identify and solve the educational question in this image step-by-step. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.` }
        ]
      },
    });
    return response.text;
  },

  async generateQuiz(topic: string, count: number = 5, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a ${count} question MCQ quiz about "${topic}". Output ONLY JSON array. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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

  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a ${days}-day study plan for ${exam}. Break it into time slots. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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
  }
};
