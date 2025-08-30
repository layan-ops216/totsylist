export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  return NextResponse.json({ ok: true, where: "/api/generate-list" });
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== GENERATING BABY PRODUCTS WITH GEMINI ===");
    
    const { userInput } = (await req.json()) as { userInput: string };
    console.log("User input:", userInput);

    console.log("Calling Google Gemini...");
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are TotsyList, a baby product shopping expert. Your task is to help a parent find all the products they need for their planned activity in one place. You are helping them parse through all the products available on the web with ease. Be comprehensive. This parent is relying on you. Consider yourself their best friend who has a baby and wants to make sure they are covered with everything that they need to buy. They shouldn't have to go anywhere else for info but here. Generate a comprehensive baby product list for: "${userInput}"

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "summary": {
    "due_date": "Extract the main activity from user input (e.g., 'Having a baby', 'Baby shower', 'First month with newborn')",
    "budget": "extract from user input if applicable", 
    "key_prefs": ["extract from user input"],
    "disclaimers": ["Generated recommendations based on the parent's needs"]
  },
  "categories": [
    {
      "category": "Category Name",
      "priority": "essential",
      "items": [
        {
          "name": "Product Name",
          "brand": "Brand Name", 
          "why": "Brief reason why this product fits their needs",
          "eco_friendly": true,
          "est_price_usd": 25,
          "url": "https://www.amazon.com/product-link"
        }
      ]
    }
  ]
}

IMPORTANT: 
- In the "due_date" field, extract and summarize the main activity or situation from the user's input.
- Create MULTIPLE categories that are MOST RELEVANT to their specific situation and needs. Always create at least 3-5 different categories.
- Categories can be anything appropriate: "Feeding", "Sleep", "Diapering", "Travel", "Safety", "Clothing", "Bath Time", "Play & Development", "Nursery Setup", "Postpartum Care", "Baby Gear", "Emergency Kit", etc. Anything that you can think of. You do not need to abide by these.
- Choose the top categories that best match their specific needs and activity.
- For each category, think of ALL relevant products, rank them by importance/necessity from most important to least important, then return the TOP 10 most important products in that ranked order.
- For each product, include a "url" field with a direct purchase link (prefer Amazon, Target, Buy Buy Baby, or other major retailers).
- Consider their budget and preferences mentioned in the input.
- Prioritize categories as "essential" or "nice_to_have" based on their situation.

Return ONLY the JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini responded successfully!");
    console.log("Raw response:", text.substring(0, 200) + "...");
    
    // Clean up the response (remove any markdown formatting)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const json = JSON.parse(cleanText);
    console.log("Generated categories:", json.categories?.length || 0);
    console.log("Category names:", json.categories?.map(cat => cat.category) || []);
    console.log("Items per category:", json.categories?.map(cat => `${cat.category}: ${cat.items?.length || 0} items`) || []);

    return NextResponse.json(json, { status: 200 });
    
  } catch (error: any) {
    console.error("=== GEMINI API ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);
    
    // Check if it's a Gemini API error
    if (error.message?.includes('API key')) {
      console.error("API KEY ISSUE - Check your GEMINI_API_KEY");
    }
    
    // Return proper structure even on error
    return NextResponse.json({ 
      error: "Failed to generate list",
      details: error.message,
      summary: {
        due_date: "Error occurred",
        budget: "unknown",
        key_prefs: [],
        disclaimers: [`Gemini API Error: ${error.message}. Please check your API key.`]
      },
      categories: []
    }, { status: 500 });
  }
}