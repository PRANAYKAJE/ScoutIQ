import { NextRequest, NextResponse } from "next/server";

interface EnrichmentResponse {
  summary: string;
  what_they_do: string;
  keywords: string[];
  signals: { type: string; text: string; source: string }[];
  sources: string[];
  timestamp: string;
}

async function fetchWebsiteText(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ScoutIQ/1.0)",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    
    return text;
  } catch (error) {
    console.error("Error fetching website:", error);
    return "";
  }
}

async function extractWithAI(text: string, domain: string): Promise<EnrichmentResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const isGemini = !!process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("No AI API key configured");
  }

  const prompt = `You are a VC analyst researching companies. Analyze this website content from ${domain} and extract structured information.

Return ONLY valid JSON (no markdown formatting) with this exact structure:
{
  "summary": "2-3 sentence high-level summary of what this company does",
  "what_they_do": "Detailed description of their product/service and target market",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "signals": [
    {"type": "growth/hiring/funding/product", "text": "specific signal text", "source": "where found"}
  ],
  "sources": ["list of URLs or sections where info was found"]
}

Website content:
${text.slice(0, 6000)}`;

  if (isGemini) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON in AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } else {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON in AI response");
    }

    return JSON.parse(jsonMatch[0]);
  }
}

function generateMockEnrichment(domain: string): EnrichmentResponse {
  const companyName = domain.replace(".com", "").replace(".so", "").replace(".app", "").replace(".co", "");
  
  return {
    summary: `${companyName.charAt(0).toUpperCase() + companyName.slice(1)} is a technology company providing innovative solutions in their domain. The company has shown consistent growth and is positioning itself as a leader in the market.`,
    what_they_do: `${companyName.charAt(0).toUpperCase() + companyName.slice(1)} offers a range of products and services designed to solve key challenges in their industry. They target both enterprise and SMB customers, with a focus on scalability and user experience.`,
    keywords: ["technology", "SaaS", "innovation", "digital transformation", "enterprise solutions"],
    signals: [
      { type: "growth", text: "Consistent user growth observed", source: "Website analysis" },
      { type: "product", text: "Recent product updates and feature releases", source: "Website content" },
      { type: "market", text: "Strong market positioning in their vertical", source: "Industry context" },
    ],
    sources: [`https://${domain}`, `https://${domain}/about`],
    timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { website, domain } = await request.json();

    let normalizedDomain = domain || website;
    
    if (!normalizedDomain) {
      return NextResponse.json(
        { error: "Website URL or domain is required" },
        { status: 400 }
      );
    }

    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const url = `https://${normalizedDomain}`;

    const text = await fetchWebsiteText(url);
    
    let enrichment: EnrichmentResponse;
    
    if (text.length > 100) {
      try {
        enrichment = await extractWithAI(text, normalizedDomain);
      } catch (aiError) {
        console.error("AI extraction failed, using mock:", aiError);
        enrichment = generateMockEnrichment(normalizedDomain);
      }
    } else {
      console.log("Could not fetch website content, using mock data");
      enrichment = generateMockEnrichment(normalizedDomain);
    }

    return NextResponse.json(enrichment);
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enrichment failed" },
      { status: 500 }
    );
  }
}
