import { NextResponse } from 'next/server';
import { llama31, llama33vers, Message } from '../models';

export async function POST(request: Request) {
    try {
        // Parse the payload from the request body
        const { model, prompt, responseExpected, messages }: 
        { model: string; prompt: string; responseExpected: string; messages: Message[] } = await request.json();

        // Validate required fields
        if (!model || !prompt || !responseExpected || !messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Missing required fields: model, prompt, responseExpected, or messages' },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        let modelRes = "";
        switch(model){
            case "llama-3.1-70b-versatile":
                modelRes = await llama31(messages);
                break;
            case "llama-3.3-70b-versatile":
                modelRes = await llama33vers(messages);
                break;
        }

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Evaluate the response (simple exact match check for now)
        const passFail = modelRes.trim() === responseExpected.trim() ? true : false;

        // Return the response in the required format
        return NextResponse.json({
            model_res: modelRes,
            response_time: responseTime,
            metrics: {
                exactMatch: passFail,
                pass_fail: passFail ? 'pass' : 'fail',
            }
        });
    } catch (error: any) {
        console.error('Error in GET handler:', error);

        return NextResponse.json(
            { error: 'Failed to process the request', details: error.message },
            { status: 500 }
        );
    }
}
