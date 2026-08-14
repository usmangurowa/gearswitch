import type { ModelMessage } from "ai";

/**
 * Re-export ModelMessage from AI SDK for convenience.
 * (In v6, CoreMessage was renamed to ModelMessage)
 */
export type { ModelMessage };

/**
 * Alias for AI SDK message type.
 */
export type AIMessage = ModelMessage;

/**
 * Available Gemini model identifiers.
 */
export type GeminiModelId = "gemini-3-flash" | "gemini-3-pro" | (string & {});

/**
 * Options for creating a Google AI provider instance.
 */
export interface GoogleAIOptions {
  /** API key for Google Generative AI. Defaults to GOOGLE_GENERATIVE_AI_API_KEY env var. */
  apiKey?: string;
  /** Custom base URL for API calls. */
  baseURL?: string;
  /** Custom headers to include in requests. */
  headers?: Record<string, string>;
}

/**
 * Common options for text generation.
 */
export interface GenerateTextOptions {
  /** The prompt to generate text from. */
  prompt: string;
  /** Optional system message. */
  system?: string;
  /** Maximum number of tokens to generate. */
  maxTokens?: number;
  /** Temperature for response randomness (0-2). */
  temperature?: number;
}

/**
 * Common options for chat completion.
 */
export interface ChatOptions {
  /** Array of messages in the conversation. */
  messages: AIMessage[];
  /** Optional system message. */
  system?: string;
  /** Maximum number of tokens to generate. */
  maxTokens?: number;
  /** Temperature for response randomness (0-2). */
  temperature?: number;
}
