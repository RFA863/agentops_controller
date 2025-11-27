import 'dotenv/config'
import { GoogleGenAI } from "@google/genai";

import LogHelper from './log.helper.js';

class AiHelper {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.logs = LogHelper;
  }

  async generate(modelName, systemInstruction, userInput, temperature) {
    try {
      const response = await this.ai.models.generateContent({
        model: modelName || "gemini-2.0-flash-001",
        config: {
          systemInstruction: systemInstruction,
          temperature: temperature ?? 0.7,
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: userInput }
            ]
          }
        ]
      });

      if (typeof response.text === 'function') {
        return response.text();
      }
      return response.text;

    } catch (error) {
      this.logs("AI Error: " + error);
      return -1;
    }
  }
}

export default AiHelper;