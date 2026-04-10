/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { QuadrantId } from "../types";

let aiInstance: any = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzeTaskPlacement(taskText: string, quadrant: QuadrantId): Promise<{ isCorrect: boolean; suggestion?: QuadrantId; reasoning: string }> {
  const quadrantDescriptions = {
    do: "Urgente e Importante (Hacer ahora)",
    plan: "No Urgente e Importante (Planificar)",
    delegate: "Urgente y No Importante (Delegar)",
    eliminate: "No Urgente y No Importante (Eliminar)"
  };

  const prompt = `Analiza si la siguiente tarea está bien clasificada en el cuadrante de la Matriz de Eisenhower indicado.
  Tarea: "${taskText}"
  Cuadrante actual: ${quadrantDescriptions[quadrant]}

  Responde en formato JSON con:
  - isCorrect: boolean
  - suggestion: string (uno de: 'do', 'plan', 'delegate', 'eliminate') si no es correcto
  - reasoning: string (una breve explicación en español de por qué debería estar ahí o por qué está bien clasificado)
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            suggestion: { type: Type.STRING, enum: ['do', 'plan', 'delegate', 'eliminate'] },
            reasoning: { type: Type.STRING }
          },
          required: ["isCorrect", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error analyzing task:", error);
    return { isCorrect: true, reasoning: "No se pudo analizar la tarea en este momento. Verifica la configuración de la API Key." };
  }
}
