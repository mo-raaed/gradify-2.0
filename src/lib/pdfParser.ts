/**
 * PDF Parser (Client-side)
 * Uses pdfjs-dist to extract text from PDF files in the browser
 * Handles two-column layout of AUIS transcripts
 */

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { parseTranscriptText } from "./transcriptParser";
import type { TranscriptData } from "./gpaCalculator";

// Set up the worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
}

/**
 * Extract text content from a PDF file
 * Handles two-column layout by splitting each page at the midpoint
 * and extracting left column first, then right column (matching pdfplumber behavior)
 */
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  }).promise;

  const leftTextBlocks: string[] = [];
  const rightTextBlocks: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const midX = viewport.width / 2;

    const textContent = await page.getTextContent();

    // Separate items into left and right columns based on x position
    const leftItems: Array<{ str: string; x: number; y: number }> = [];
    const rightItems: Array<{ str: string; x: number; y: number }> = [];

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;

      const textItem = item as TextItem;
      const x = textItem.transform[4]; // x position
      const y = textItem.transform[5]; // y position

      if (x < midX) {
        leftItems.push({ str: textItem.str, x, y });
      } else {
        rightItems.push({ str: textItem.str, x, y });
      }
    }

    // Sort items by y position (descending - top to bottom) then x position
    const sortByPosition = (
      a: { str: string; x: number; y: number },
      b: { str: string; x: number; y: number }
    ) => {
      // Y is inverted in PDF (0 is bottom), so we sort descending for top-to-bottom
      if (Math.abs(a.y - b.y) > 5) {
        return b.y - a.y; // Sort by row (top to bottom)
      }
      return a.x - b.x; // Same row, sort left to right
    };

    leftItems.sort(sortByPosition);
    rightItems.sort(sortByPosition);

    // Group items into lines based on y position
    const groupIntoLines = (
      items: Array<{ str: string; x: number; y: number }>
    ): string => {
      if (items.length === 0) return "";

      const lines: string[][] = [];
      let currentLine: string[] = [];
      let currentY = items[0]?.y ?? 0;

      for (const item of items) {
        // If y position differs significantly, start a new line
        if (Math.abs(item.y - currentY) > 5) {
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
          currentLine = [item.str];
          currentY = item.y;
        } else {
          currentLine.push(item.str);
        }
      }

      // Don't forget the last line
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      return lines.map((line) => line.join(" ")).join("\n");
    };

    const leftText = groupIntoLines(leftItems);
    const rightText = groupIntoLines(rightItems);

    if (leftText) {
      leftTextBlocks.push(leftText);
    }
    if (rightText) {
      rightTextBlocks.push(rightText);
    }
  }

  // Concatenate all left columns first, then all right columns
  // This matches the pdfplumber behavior from the old Python code
  const fullText = [...leftTextBlocks, ...rightTextBlocks].join("\n");

  return fullText;
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
    throw new Error(
      "Could not extract text from PDF. Please ensure it's a valid transcript."
    );
  }

  // Debug: Log the extracted text to console for troubleshooting
  console.log("Extracted PDF text:", rawText);

  // Parse the transcript text
  const transcriptData = parseTranscriptText(rawText);

  if (transcriptData.semesters.length === 0) {
    throw new Error(
      "No semesters found in the transcript. Please ensure you uploaded an AUIS unofficial transcript."
    );
  }

  return transcriptData;
}
