
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Axiom, PDFData, Language } from "./types";
import { ELITE_RESEARCHER_PROMPT } from "./promptEngineering";

export class KnowledgeEngine {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async synthesizeAxioms(pdf: PDFData, lang: Language): Promise<Axiom[]> {
    const langRequest = lang === Language.AR ? "Output the response entirely in Arabic." : "Output the response entirely in English.";
    
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [
        {
          parts: [
            { inlineData: { data: pdf.base64, mimeType: pdf.mimeType } },
            { text: `Analyze this document's structure and author style. Then, identify the most significant titles, headings, and conceptual pillars. Extract exactly 6 profound, axiomatic truths based on these sections. ${langRequest} Output as a JSON array of objects with 'title' and 'definition'.` }
          ]
        }
      ],
      config: {
        systemInstruction: ELITE_RESEARCHER_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              definition: { type: Type.STRING }
            },
            required: ["title", "definition"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse axioms", e);
      return [];
    }
  }

  async startChatSession(pdf: PDFData, lang: Language) {
    this.chat = this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: ELITE_RESEARCHER_PROMPT + `\nTarget Language: ${lang === Language.AR ? 'Arabic' : 'English'}.`,
      }
    });
    
    return this.chat.sendMessage({
      message: `[PROTOCOL INITIATION: DOCUMENT ANALYSIS] Analyze the context, style, and structure of "${pdf.name}". Once understood, provide a high-level scholarly summary of your analytical approach to this specific text.`
    });
  }

  async *sendMessageStream(text: string) {
    if (!this.chat) throw new Error("Chat session not initialized");
    const result = await this.chat.sendMessageStream({ message: text });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  }

  async sendMessage(text: string): Promise<string> {
    if (!this.chat) throw new Error("Chat session not initialized");
    const response = await this.chat.sendMessage({ message: text });
    return response.text || "";
  }
}

export const knowledgeEngine = new KnowledgeEngine();
