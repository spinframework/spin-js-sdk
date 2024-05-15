//@ts-ignore
import {
  infer as llmInfer,
  generateEmbeddings as llmGenerateEmbeddings,
} from 'fermyon:spin/llm@2.0.0';

export enum InferencingModels {
  Llama2Chat = 'llama2-chat',
  CodellamaInstruct = 'codellama-instruct',
}

export enum EmbeddingModels {
  AllMiniLmL6V2 = 'all-minilm-l6-v2',
}

export interface InferencingOptions {
  maxTokens?: number;
  repeatPenalty?: number;
  repeatPenaltyLastNTokenCount?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface InternalInferencingOptions {
  maxTokens?: number;
  repeatPenalty?: number;
  repeatPenaltyLastNTokenCount?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface InferenceUsage {
  promptTokenCount: number;
  generatedTokenCount: number;
}
export interface InferenceResult {
  text: string;
  usage: InferenceUsage;
}

export interface EmbeddingUsage {
  promptTokenCount: number;
}

export interface EmbeddingResult {
  embeddings: Array<Array<number>>;
  usage: EmbeddingUsage;
}

export function infer(
  model: InferencingModels | string,
  prompt: string,
  options?: InferencingOptions,
): InferenceResult {
  let inference_options: InternalInferencingOptions = {
    maxTokens: options?.maxTokens || 100,
    repeatPenalty: options?.repeatPenalty || 1.1,
    repeatPenaltyLastNTokenCount: options?.repeatPenaltyLastNTokenCount || 64,
    temperature: options?.temperature || 0.8,
    topK: options?.topK || 40,
    topP: options?.topP || 0.9,
  };
  return llmInfer(model, prompt, inference_options);
}

export const generateEmbeddings = (
  model: EmbeddingModels | string,
  text: Array<string>,
): EmbeddingResult => {
  return llmGenerateEmbeddings(model, text);
};
