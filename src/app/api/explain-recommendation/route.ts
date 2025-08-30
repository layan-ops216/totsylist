export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { productName, brand, category, userInput, why } = await req.json();
    
    console.log("Explaining recommendation for:", productName);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are TotsyList, a baby product expert. A user asked: "${userInput}"

You recommended the product "${productName}" by ${brand} in the ${category} category with this brief reason: "${why}"

The user wants to know WHY you specifically chose this exact product for their situation. Explain in 2-3 sentences:

1. What specific aspect of their request (from "${userInput}") made you choose this product
2. What makes this particular product the best fit compared to other options in this category
3. How this product specifically addresses their stated needs, preferences, or situation

Be direct and specific about the connection between their request and your recommendation. Don't give generic product benefits - explain why THIS product for THEIR specific situation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();
    
    return NextResponse.json({ explanation }, { status: 200 });
    
  } catch (error: any) {
    console.error("Explanation API Error:", error);
    return NextResponse.json({ 
      explanation: "I recommended this product based on your specific needs and preferences. It offers good quality and value for your situation." 
    }, { status: 500 });
  }
}
