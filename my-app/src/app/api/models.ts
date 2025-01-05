import * as dotenv from 'dotenv';
import * as path from 'path';
import Groq from "groq-sdk";
import Anthropic from '@anthropic-ai/sdk';

dotenv.config({ path:  '../../../.env' });
import OpenAI from "openai";


const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


const anthropic = new Anthropic({apiKey: process.env.CLAUDE_API_KEY});

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name: string;
}

interface claudeMessage {
    role: 'assistant' | 'user';
    content: string;
}

export interface ChatCompletionChunk {
    choices: {
        delta: {
            content?: string;
        };
    }[];
}



export function convertAllRolesToUser(messages: Message[]): claudeMessage[] {
    return messages.map((msg) => ({
      role: 'user', // Set all roles to 'user'
      content: msg.content, // Keep the original content
    }));
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



export async function llama33vers(messages: Message[]): Promise<string> {

    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
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

import { ContentBlock } from '@anthropic-ai/sdk/resources/messages/messages';

export async function claudeV1(messages: Message[]): Promise<string> {
    try {
      const chatCompletion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: convertAllRolesToUser(messages),
      });
  
      // Extracting response content
      const content = chatCompletion.content
        ?.map((chunk: ContentBlock) => {
          if ('text' in chunk) {
            return chunk.text || "";
          }
          return "";
        })
        .join("") || "";
  
      // Return the unpacked content
      return content;
    } catch (error) {
      console.error("Error with ClaudeV1 API call:", error);
      throw error;
    }
  }
  


export async function gpt35(messages: Message[]): Promise<string> {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 model
      messages, // Pass the conversation messages
      temperature: 1, // Adjust creativity
      max_tokens: 1024, // Maximum tokens for response
      top_p: 1, // Probability distribution for sampling
      stream: true, // Enable streaming
      stop: null, // No specific stopping condition
    });
  
    let fullResponse = "";
  
    // Process streamed chunks of the response
    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0].delta.content || "";
      fullResponse += content;
    }
  
    return fullResponse;
  }
  