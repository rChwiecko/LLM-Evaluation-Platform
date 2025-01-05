import { NextResponse } from "next/server";
import { llama31, llama33vers, claudeV1, Message } from "../models";

// Helper function to parse the evaluation response
function parseEvaluationResponse(response: string): { score: number; feedback: string } {
  const scoreMatch = response.match(/Score: (\d+)/);
  const feedbackMatch = response.match(/Feedback: (.+)/);
  return {
    score: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : "No feedback provided.",
  };
}

// API handler
export async function POST(request: Request) {
  try {
    // Parse the payload from the request body
    const { model, prompt, responseExpected, messages }: 
    { model: string; prompt: string; responseExpected: string; messages: Message[] } = await request.json();

    // Validate required fields
    if (!model || !prompt || !responseExpected || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing required fields: model, prompt, responseExpected, or messages" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Call the appropriate model to generate the response
    let modelRes = "";
    switch (model) {
      case "llama-3.1-70b-versatile":
        modelRes = await llama31(messages);
        break;
      case "llama-3.3-70b-versatile":
        modelRes = await llama33vers(messages);
        break;
      case "claude-v1":
        modelRes = await claudeV1(messages);
        break;
      default:
        throw new Error(`Unknown model: ${model}`);
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Create evaluation messages for the evaluation assistant
    const evaluationMessages: Message[] = [
      { role: "system", content: "You are an AI evaluation assistant.", name: "system" },
      {
        role: "user",
        content: `Evaluate the following response:\n\nPrompt: ${prompt}\nGenerated Response: ${modelRes}\nExpected Response: ${responseExpected}\n\nScore the response from 0 to 100 and provide feedback. Your response should be of the form 'Score: <score>, Feedback: <feedback>'.`,
        name: "user",
      },
    ];

    // Call the same model to evaluate the generated response
    let evaluationRes = "";
    switch (model) {
      case "llama-3.1-70b-versatile":
        evaluationRes = await llama31(evaluationMessages);
        break;
      case "llama-3.3-70b-versatile":
        evaluationRes = await llama33vers(evaluationMessages);
        break;
      case "claude-v1":
        evaluationRes = await claudeV1(evaluationMessages);
        break;
    }

    // Parse the evaluation response
    const evaluation = parseEvaluationResponse(evaluationRes);

    // Determine pass or fail based on a threshold score of 70
    const passFail = evaluation.score >= 70 ? "pass" : "fail";

    // Return the response in the desired format
    return NextResponse.json({
      model_res: modelRes,
      response_time: responseTime,
      metrics: {
        similarity: evaluation.score,
        reason: evaluation.feedback,
        pass_fail: passFail,
      },
    });
  } catch (error: any) {
    console.error("Error in POST handler for LLM evaluation:", error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { error: "Failed to process the request", details: error.message },
      { status: 500 }
    );
  }
}
