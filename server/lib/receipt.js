import { HttpError } from "./http.js";
import { generateText, parseJsonResponse } from "./gemini.js";

const PROMPT = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

// scanReceipt(file)  - `file` is the multer file ({ buffer, mimetype })
export async function scanReceiptImage(file) {
  let text;
  try {
    text = await generateText([
      {
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype,
        },
      },
      { text: PROMPT },
    ]);
  } catch (error) {
    if (error instanceof HttpError) throw error; // e.g. missing API key
    console.error("Error scanning receipt:", error);
    throw new HttpError(502, "Failed to scan receipt");
  }

  let data;
  try {
    data = parseJsonResponse(text);
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    throw new HttpError(502, "Invalid response format from Gemini");
  }

  const amount = parseFloat(data?.amount);
  if (!Number.isFinite(amount)) {
    // model returned {} -> "not a receipt"
    throw new HttpError(422, "Could not read a receipt from this image");
  }

  const date = new Date(data.date);

  return {
    amount,
    date: Number.isNaN(date.getTime()) ? new Date() : date,
    description: data.description,
    category: data.category,
    merchantName: data.merchantName,
  };
}
