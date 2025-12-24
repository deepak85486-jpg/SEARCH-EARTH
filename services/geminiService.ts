
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message } from '../types';

export const geminiService = {
  // AI Teacher with proper history
  async chatWithTeacher(prompt: string, history: Message[], lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        Expert in UPSC, BPSC, SSC, and K-12. 
        Current language preference: ${lang === Language.HINDI ? 'Hindi' : 'English'}.
        Keep answers strictly educational, encouraging, and exam-focused. Use markdown for formatting.`,
      },
    });

    return response.text;
  },

  // Photo Search
  async solvePhotoQuestion(base64Image: string, lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `Identify this educational question from the image and solve it step-by-step. Use ${lang === Language.HINDI ? 'Hindi' : 'English'}. Explain clearly.` }
        ]
      },
    });
    return response.text;
  },

  // Quiz Generation - Updated for 20 questions
  async generateQuiz(topic: string, count: number = 20, lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a high-quality competitive exam level multiple choice quiz about "${topic}" with ${count} questions. Provide JSON format. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}. Ensure questions cover basic to advanced concepts.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of correct option" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  // Study Planner - Updated for detailed hourly schedule
  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a very detailed ${days}-day study schedule for the ${exam} exam. 
      For each day, provide a structured time-table with specific time slots (e.g., 06:00 AM - 08:00 AM). 
      Include breaks, revision time, and subject-specific topics. 
      Format as JSON. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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
                        time: { type: Type.STRING, description: "Time slot like 07:00 AM - 09:00 AM" },
                        activity: { type: Type.STRING, description: "What to study or do" }
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
  },

  // Daily Current Affairs with Search Grounding
  async getDailyCurrentAffairs(lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-pro-image-preview for real-time search tool usage as per guidelines
    const model = 'gemini-3-pro-image-preview';
    const today = new Date().toLocaleDateString('en-GB');
    
    const response = await ai.models.generateContent({
      model,
      contents: `Provide the top 10 most important current affairs updates for today (${today}) specifically relevant for Indian competitive exams (UPSC, SSC, Banking, BPSC). 
      Include news on National events, International relations, Economy, and Science & Tech.
      Output must be in JSON format. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING, description: "National, International, Economy, Sports, etc." },
              date: { type: Type.STRING }
            },
            required: ["title", "summary", "category", "date"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }
};
