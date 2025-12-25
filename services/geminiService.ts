
import { GoogleGenAI, Type } from "@google/genai";
import { CellColor, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeExcelImage(base64Image: string): Promise<AnalysisResult> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this Excel screenshot. Identify all cells that are filled with RED or GREEN background colors.
    For each colored cell, return its bounding box coordinates as percentages (0-100) relative to the image dimensions.
    Include the color of the cell (either 'red' or 'green').
    
    Return the result as a JSON array of objects.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cells: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                x: { type: Type.NUMBER, description: "Left position in percentage (0-100)" },
                y: { type: Type.NUMBER, description: "Top position in percentage (0-100)" },
                width: { type: Type.NUMBER, description: "Width in percentage" },
                height: { type: Type.NUMBER, description: "Height in percentage" },
                color: { type: Type.STRING, description: "Must be 'red' or 'green'" }
              },
              required: ["id", "x", "y", "width", "height", "color"]
            }
          }
        },
        required: ["cells"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{"cells": []}');
    return data as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return { cells: [] };
  }
}
