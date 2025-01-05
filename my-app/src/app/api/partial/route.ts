import { NextResponse } from "next/server";
import { llama31, Message } from "../models";


function computeLevenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill([])
    .map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      // If characters match, no additional cost
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j],    // deletion
            dp[i][j - 1],    // insertion
            dp[i - 1][j - 1] // substitution
          );
      }
    }
  }

  return dp[a.length][b.length];
}

function calculateSimilarity(expected: string, actual: string): number {
    expected = expected.trim();
    actual = actual.trim();
  
    const expectedTokens = new Set(expected.split(/\s+/));
    const actualTokens = new Set(actual.split(/\s+/));
    const intersection = new Set(
      [...expectedTokens].filter((token) => actualTokens.has(token))
    );
  
    console.log("Expected Tokens:", expectedTokens);
    console.log("Actual Tokens:", actualTokens);
    console.log("Intersection:", intersection);
    console.log("Sizes => Expected:", expectedTokens.size, " Intersection:", intersection.size);
  
    if (expectedTokens.size === 0) {
      return 0;
    }
    return (intersection.size / expectedTokens.size) * 100;
  }
  

export async function POST(request: Request) {
  try {
    // Parse the payload from the request body
    const {
      model,
      prompt,
      responseExpected,
      messages,
    }: {
      model: string;
      prompt: string;
      responseExpected: string;
      messages: Message[];
    } = await request.json();

    // Validate required fields
    if (
      !model ||
      !prompt ||
      !responseExpected ||
      !messages ||
      !Array.isArray(messages)
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: model, prompt, responseExpected, or messages",
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Call your LLM
    const modelRes = await llama31(messages);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 3. Compute the similarity (token overlap %)
    const similarity = calculateSimilarity(responseExpected, modelRes);

    // 4. Compute the edit distance using Levenshtein
    const distance = computeLevenshteinDistance(responseExpected, modelRes);

    // Decide pass/fail based on the similarity threshold
    const threshold = 70; // Define your similarity threshold in percentage
    const passFail = similarity >= threshold ? "pass" : "fail";
    console.log("Distance: ", distance);
    // Return the response in the required format
    return NextResponse.json({
      model_res: modelRes,
      response_time: responseTime,
      // 5. Add 'distance' to your metrics
      metrics: {
        partialScore: similarity,
        distance: distance,
        pass_fail: passFail,
      },
    });
  } catch (error: any) {
    console.error("Error in POST handler for partial match:", error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: "Failed to process the request", details: error.message },
      { status: 500 }
    );
  }
}
