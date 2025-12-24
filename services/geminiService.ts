
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message, CurrentAffair } from '../types';

// Helper to clean AI response and parse JSON safely
const safeParseJson = (text: string) => {
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parsing Error:", e, "Original text:", text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set API_KEY in your environment variables.");
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
    const ai = getAI();
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

  // Quiz Generation - Updated to handle difficulty levels
  async generateQuiz(topic: string, count: number = 20, lang: Language, difficulty: string = 'Medium') {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a high-quality competitive exam level multiple choice quiz about "${topic}" with ${count} questions. 
      Difficulty Level: ${difficulty}. 
      Ensure the complexity, terminology, and depth of questions strictly match the "${difficulty}" level.
      Provide JSON format. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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

  // Study Planner - Prompt refined for hourly slots
  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Create an extremely detailed ${days}-day study schedule for the ${exam} exam. 
      CRITICAL REQUIREMENT: For each day, provide an hourly breakdown using specific time slots (e.g., "06:00 AM - 07:30 AM"). 
      Each 'activity' must be a detailed description of what to study, which sub-topics to cover, and which practice tasks to complete. 
      Do NOT just list general topics. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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
                        time: { type: Type.STRING, description: "Specific time slot like 09:00 AM - 10:30 AM" },
                        activity: { type: Type.STRING, description: "Detailed study instructions and sub-topics" }
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

  // Daily Current Affairs
  async getDailyCurrentAffairs(lang: Language) {
    const ai = getAI();
    const model = 'gemini-3-flash-preview';
    const today = new Date().toLocaleDateString('en-GB');
    
    const response = await ai.models.generateContent({
      model,
      contents: `Search for the top 10 most important current affairs updates for today (${today}) relevant to Indian competitive exams (UPSC, SSC, BPSC, Banking). 
      Format your response as a numbered list. For each item, include a Category, a Title, and a brief Summary. 
      Use ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || "";
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      ?.filter((web: any) => web && web.uri)
      || [];

    const newsItems: CurrentAffair[] = [];
    const sections = textOutput.split(/\n\d+\.\s+/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines.length >= 1 && lines[0].length > 5) {
        newsItems.push({
          title: lines[0].replace(/Title:?\s*/i, '').trim(),
          summary: lines.slice(1).join(' ').replace(/Summary:?\s*/i, '').trim(),
          category: 'General',
          date: today
        });
      }
    });

    return {
      news: newsItems.length > 0 ? newsItems : [{ title: "Daily Updates", summary: textOutput, category: "Live Feed", date: today }],
      sources: sources as { title: string, uri: string }[]
    };
  }
};
