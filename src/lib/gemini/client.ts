import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface FileData {
  mimeType: string;
  data: string; // base64
}

export async function generateContent(prompt: string, images?: FileData[]) {
  try {
    const parts: any[] = [{ text: prompt }];

    if (images && images.length > 0) {
      images.forEach((image) => {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function generateContentWithFunctions(
  prompt: string,
  functions: any[],
  images?: FileData[]
) {
  try {
    const parts: any[] = [{ text: prompt }];

    if (images && images.length > 0) {
      images.forEach((image) => {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        tools: [
          {
            functionDeclarations: functions,
          },
        ],
      },
    });

    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
