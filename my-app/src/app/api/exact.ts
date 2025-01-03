import { NextResponse } from 'next/server';
import { llama31 } from './models';

export async function GET(request: Request) {
    try {
        // Parse the payload from the request body
        const { prompt, expectedRes } = await request.json();

        // Validate required fields
        if (!prompt || !expectedRes) {
            return NextResponse.json(
                { error: 'Missing required fields: prompt or expectedRes' },
                { status: 400 }
            );
        }

        const startTime = Date.now();

        // Call the model (assume llama31 for now)
        const modelRes = await llama31([{ role: 'user', content: prompt }]);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Evaluate the response (simple exact match check for now)
        const passFail = modelRes.trim() === expectedRes.trim() ? 'pass' : 'fail';

        // Return the response in the required format
        return NextResponse.json({
            model_res: modelRes,
            response_time: responseTime,
            pass_fail: passFail,
        });
    } catch (error) {
        console.error('Error in GET handler:', error);

        // Return an error response if something goes wrong
        return NextResponse.json(
            { error: 'Failed to process the request', details: error.message },
            { status: 500 }
        );
    }
}
