/**
 * PDF Parser (Client-side)
 * Uses pdfjs-dist to extract text from PDF files in the browser
 */

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { parseTranscriptText } from "./transcriptParser";
import type { TranscriptData } from "./gpaCalculator";

// Set up the worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text content from a PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    useSystemFonts: true,
  }).promise;
  
  const textParts: string[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Extract text items and join them
    const pageText = textContent.items
      .map((item) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      })
      .join(" ");
    
    textParts.push(pageText);
  }
  
  return textParts.join("\n");
}

/**
 * Parse a PDF transcript file
 * Returns the parsed transcript data
 */
export async function parsePDFTranscript(file: File): Promise<TranscriptData> {
  // Validate file type
  if (file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file");
  }

  // Extract text from PDF
  const rawText = await extractTextFromPDF(file);
  
  if (!rawText.trim()) {
    throw new Error("Could not extract text from PDF. Please ensure it's a valid transcript.");
  }

  // Parse the transcript text
  const transcriptData = parseTranscriptText(rawText);

  if (transcriptData.semesters.length === 0) {
    throw new Error("No semesters found in the transcript. Please ensure you uploaded an AUIS unofficial transcript.");
  }

  return transcriptData;
}

