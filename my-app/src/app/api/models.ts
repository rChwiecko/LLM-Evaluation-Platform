import Groq from "groq-sdk";

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name: string;
}

export interface ChatCompletionChunk {
    choices: {
        delta: {
            content?: string;
        };
    }[];
}

export async function llama31(messages: Message[]): Promise<string> {

    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-70b-versatile",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null,
    });

    let fullResponse = "";

    for await (const chunk of chatCompletion) {
        const content = chunk.choices[0].delta.content || "";
        fullResponse += content;
    }

    return fullResponse;
}


export async function gpt3(messages: Message[]): Promise<string> {
    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
        stop: null,
    });

    let fullResponse = "";

    for await (const chunk of chatCompletion) {
        const content = chunk.choices[0].delta.content || "";
        fullResponse += content;
    }

    return fullResponse;
}