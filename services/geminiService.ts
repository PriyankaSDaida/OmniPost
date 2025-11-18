import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Platform, Tone, ContentResult, GeneratedContent, AspectRatio } from "../types";

// Initialize the client
// NOTE: The API key is injected via process.env.API_KEY automatically.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'imagen-4.0-generate-001';

// Schema for the text generation response
const contentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    linkedin: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The post content for LinkedIn." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
      },
      required: ["text", "imagePrompt"],
    },
    twitter: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The post content for Twitter (X)." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
      },
      required: ["text", "imagePrompt"],
    },
    instagram: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The post content for Instagram, including hashtags." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
      },
      required: ["text", "imagePrompt"],
    },
  },
  required: ["linkedin", "twitter", "instagram"],
};

export const generateTextContent = async (idea: string, tone: Tone, customTone?: string): Promise<Omit<ContentResult, keyof any> & { [key in Platform]: Omit<GeneratedContent, 'imageUrl' | 'isImageLoading'> }> => {
  
  let toneInstruction = tone === Tone.CUSTOM && customTone ? `Custom: ${customTone}` : tone;

  const prompt = `
    You are an expert social media manager. 
    Create tailored social media posts based on the following idea: "${idea}".
    The tone must be: ${toneInstruction}.

    1. LinkedIn: Professional, insightful, structured for readability (long-form).
    2. Twitter/X: Punchy, short, engaging, under 280 chars.
    3. Instagram: Visual-first caption, engaging. CRITICAL: You MUST include a list of 5-10 relevant and trending hashtags at the very end of the caption to increase discoverability.

    Also provide a unique, high-quality image generation prompt for each platform that perfectly matches the vibe of the post and the platform's aesthetics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema,
        systemInstruction: "You are a creative social media assistant. Always return valid JSON.",
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No text returned from Gemini.");

    const data = JSON.parse(rawText);

    // Transform into our internal structure
    return {
      [Platform.LINKEDIN]: { 
        text: data.linkedin.text, 
        imagePrompt: data.linkedin.imagePrompt 
      },
      [Platform.TWITTER]: { 
        text: data.twitter.text, 
        imagePrompt: data.twitter.imagePrompt 
      },
      [Platform.INSTAGRAM]: { 
        text: data.instagram.text, 
        imagePrompt: data.instagram.imagePrompt 
      },
    };
  } catch (error) {
    console.error("Text generation error:", error);
    throw error;
  }
};

export const generateImageForPlatform = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const image = response.generatedImages?.[0]?.image;
    if (!image || !image.imageBytes) {
      throw new Error("No image generated.");
    }

    return `data:image/jpeg;base64,${image.imageBytes}`;
  } catch (error) {
    console.error(`Image generation error (${aspectRatio}):`, error);
    throw error;
  }
};

export const summarizeLongText = async (text: string): Promise<string> => {
  const prompt = `
    Summarize the following text into a concise, engaging paragraph suitable for sharing on social media.
    The summary should capture the main points clearly and be ready to be used as a base for creating specific posts.
    
    Text to summarize:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        // No specific schema needed, just text, defaults are fine
      }
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
};