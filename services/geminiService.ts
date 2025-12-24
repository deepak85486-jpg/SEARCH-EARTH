
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Message, CurrentAffair } from '../types';

export const geminiService = {
  // AI Teacher
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

  // Quiz Generation
  async generateQuiz(topic: string, count: number = 20, lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a high-quality competitive exam level multiple choice quiz about "${topic}" with ${count} questions. Provide JSON format. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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

  // Study Planner
  async generateStudyPlan(exam: string, days: number, lang: Language) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a very detailed ${days}-day study schedule for the ${exam} exam. Format as JSON. Language: ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
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
    return JSON.parse(response.text || '{}');
  },

  // Daily Current Affairs - Fixed for Grounding Search
  async getDailyCurrentAffairs(lang: Language) {
    // Creating fresh instance as per mandatory key selection guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use gemini-3-pro-image-preview for high-quality real-time info using googleSearch tool
    const model = 'gemini-3-pro-image-preview';
    const today = new Date().toLocaleDateString('en-GB');
    
    // We don't use responseMimeType: "application/json" with search grounding 
    // because grounding chunks often conflict with strict JSON formatting.
    // Instead, we get text and parse or present it.
    const response = await ai.models.generateContent({
      model,
      contents: `Perform a search and provide the top 10 most important current affairs updates for today (${today}) relevant to Indian competitive exams (UPSC, SSC, BPSC, Banking). 
      Format your response as a numbered list. For each item, include a Category, a Title, and a brief 2-sentence Summary. 
      Use ${lang === Language.HINDI ? 'Hindi' : 'English'}.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || "";
    
    // Extract sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      ?.filter((web: any) => web && web.uri)
      || [];

    // Simple parser for the text response into CurrentAffair objects
    // Since search grounding can be unpredictable, we'll return the parsed list
    const newsItems: CurrentAffair[] = [];
    const lines = textOutput.split('\n').filter(l => l.trim().length > 5);
    
    let currentItem: Partial<CurrentAffair> = {};
    lines.forEach(line => {
      if (/^\d+\./.test(line)) {
        if (currentItem.title) newsItems.push(currentItem as CurrentAffair);
        currentItem = { title: line.replace(/^\d+\.\s*/, ''), date: today, category: 'General' };
      } else if (currentItem.title && !currentItem.summary) {
        currentItem.summary = line;
      }
    });
    if (currentItem.title) newsItems.push(currentItem as CurrentAffair);

    return {
      news: newsItems.length > 0 ? newsItems : [{ title: "Daily Updates", summary: textOutput, category: "Live Feed", date: today }],
      sources: sources as { title: string, uri: string }[]
    };
  }
};
