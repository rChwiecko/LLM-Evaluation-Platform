export interface LLMModel {
    id: string;
    name: string;
    version: string;
    description: string;
    parameters: {
        maxTokens: number;
        temperature: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };
}

export const llmModels: LLMModel[] = [
    {
        id: 'gpt-3',
        name: 'GPT-3',
        version: '3.0',
        description: 'Generative Pre-trained Transformer 3',
        parameters: {
            maxTokens: 4096,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.0,
            presencePenalty: 0.6,
        },
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        version: '4.0',
        description: 'Generative Pre-trained Transformer 4',
        parameters: {
            maxTokens: 8192,
            temperature: 0.7,
            topP: 0.9,
            frequencyPenalty: 0.0,
            presencePenalty: 0.6,
        },
    },
    // Add more models as needed
];