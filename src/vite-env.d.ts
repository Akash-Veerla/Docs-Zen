/// <reference types="vite/client" />

interface Window {
  ai?: {
    languageModel: {
      capabilities: () => Promise<{
        available: 'readily' | 'after-download' | 'no';
        defaultTopK: number;
        maxTopK: number;
        defaultTemperature: number;
      }>;
      create: (options?: {
        systemPrompt?: string;
        temperature?: number;
        topK?: number;
      }) => Promise<{
        prompt: (input: string) => Promise<string>;
        promptStreaming: (input: string) => AsyncIterable<string>;
        destroy: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clone: () => Promise<any>;
      }>;
    };
  };
}
