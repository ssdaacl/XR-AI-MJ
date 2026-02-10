
import { GoogleGenAI, Type } from "@google/genai";

export const refinePrompt = async (basePrompt: string, userIntent: string) => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    console.error("API Key is missing. Refinement disabled.");
    return "Error: API Key not configured.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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

    return response.text || "No response text generated.";
  } catch (err) {
    console.error("Gemini refinePrompt error:", err);
    throw err;
  }
};

export const generateHotspots = async (title: string, description: string, prompts: any) => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    console.warn("API Key is missing. Hotspot generation skipped.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, idx: number) => ({
      ...item,
      id: `generated-${Date.now()}-${idx}`
    }));
  } catch (e) {
    console.error("Failed to generate/parse hotspots", e);
    return [];
  }
};
