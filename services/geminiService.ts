
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Removed local constant and now using process.env.API_KEY directly as per guidelines.
export const refinePrompt = async (basePrompt: string, userIntent: string) => {
  // Create a new instance right before making the call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a world-class interior photographer and AI prompt engineer, refine the following base prompt based on the user's intent. 
    Base: ${basePrompt}
    User Intent: ${userIntent}
    
    Format the response as a high-quality, structured AI generation prompt focusing on lighting, camera settings, and material realism.`,
    config: {
      temperature: 0.7,
    }
  });

  return response.text;
};

export const generateHotspots = async (title: string, description: string, prompts: any) => {
  // Create a new instance right before making the call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Analyze this interior design project and suggest 3 logical "interactive hotspots" for a high-end visual archive.
  Project: ${title}
  Description: ${description}
  Prompts: ${JSON.stringify(prompts)}
  
  Assign each hotspot a 'label' (e.g., 'Hand-crafted Oak Table'), a professional 'description', and logical 'x' and 'y' percentage coordinates (0-100) where such an item would likely be positioned in a standard architectural composition.
  
  Return exactly a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            description: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
          },
          required: ["label", "description", "x", "y"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => ({
      ...item,
      id: `generated-${Date.now()}-${idx}`
    }));
  } catch (e) {
    console.error("Failed to parse hotspots", e);
    return [];
  }
};
