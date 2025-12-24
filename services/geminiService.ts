
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message } from '../types';

/**
 * Creates a fresh instance of the AI client with the latest API key.
 * This ensures Vercel/AI Studio bridge works correctly.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  // 1. AI Teacher Chat
  async chatWithTeacher(prompt: string, history: Message[], lang: Language) {
    const ai = getAIInstance();
    const formattedHistory = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...formattedHistory, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are "EARTH GURU", a top-tier Indian educator. Help with UPSC, SSC, Banking, and Schooling. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}. Be precise, structured, and encouraging.`,
      },
    });
    return response.text;
  },

  // 2. Photo Question Solver
  async solvePhotoQuestion(base64Image: string, lang: Language) {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Identify the question in this image and provide a step-by-step solution in ${lang === Language.HINDI ? 'Hindi' : 'English'}.` }
        ]
      },
    });
    return response.text;
  },

  // 3. Current Affairs with Google Search
  async getDailyCurrentAffairs(lang: Language) {
    const ai = getAIInstance();
    const today = new Date().toDateString();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List top 5 current affairs news for today (${today}) relevant to Indian government exams. Include Category and Title. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    
    // Extract sources if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || [];
    return { text: response.text, sources };
  },

  // 4. Quiz Generator (JSON)
  async generateQuiz(topic: string, count: number = 5, lang: Language) {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a ${count} question MCQ quiz on "${topic}". Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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
    return JSON.parse(response.text || '[]');
  },

  // 5. Study Planner (JSON)
  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a ${days}-day study plan for ${exam}. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exam: { type: Type.STRING },
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
    return JSON.parse(response.text || '{}');
  }
};
