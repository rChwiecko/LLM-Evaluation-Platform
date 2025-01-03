export const availableModels = [
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      apiKey: "OPENAI_API_KEY",
    },
    {
      id: "claude-v1",
      name: "Claude v1",
      provider: "Anthropic",
      apiKey: "ANTHROPIC_API_KEY",
    },
    {
      id: "my-custom-model",
      name: "Custom Model",
      provider: "MyServer",
      apiKey: "CUSTOM_API_KEY",
      endpoint: "https://custom-api.com/model",
    },
  ];
  