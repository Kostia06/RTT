import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export const geminiVisionModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export interface FileData {
  mimeType: string;
  data: string; // base64
}

type Part = 
  | { text: string }  // TextPart
  | { inlineData: FileData }; // InlineDataPart

export async function generateContent(prompt: string, images?: FileData[]) {
  try {
    const parts: Part[] = [{ text: prompt }];

    if (images && images.length > 0) {
      images.forEach((image) => {
        parts.push({ inlineData: image });
      });
    }

    const result = await geminiVisionModel.generateContent(parts);
    const response = await result.response;
    return response.text();
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
    const parts: Part[] = [{ text: prompt }];

    if (images && images.length > 0) {
      images.forEach((image) => {
        parts.push({ inlineData: image });
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ functionDeclarations: functions }],
    });

    const result = await model.generateContent(parts);
    const response = await result.response;

    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
