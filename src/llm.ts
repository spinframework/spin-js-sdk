import {
  infer as llmInfer,
  generateEmbeddings as llmGenerateEmbeddings,
  //@ts-ignore
} from 'fermyon:spin/llm@2.0.0';

/**
 * Enum representing the available models for inferencing.
 * @enum {string}
 */
export enum InferencingModels {
  Llama2Chat = 'llama2-chat',
  CodellamaInstruct = 'codellama-instruct',
}

/**
 * Enum representing the available models for generating embeddings.
 * @enum {string}
 */
export enum EmbeddingModels {
  AllMiniLmL6V2 = 'all-minilm-l6-v2',
}

/**
 * Interface representing options for inferencing.
 * @interface InferencingOptions
 */
export interface InferencingOptions {
  maxTokens?: number;
  repeatPenalty?: number;
  repeatPenaltyLastNTokenCount?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

/**
 * Interface representing internal options for inferencing.
 * @interface InternalInferencingOptions
 */
export interface InternalInferencingOptions {
  maxTokens?: number;
  repeatPenalty?: number;
  repeatPenaltyLastNTokenCount?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

/**
 * Interface representing usage statistics for inferencing.
 * @interface InferenceUsage
 */
export interface InferenceUsage {
  promptTokenCount: number;
  generatedTokenCount: number;
}

/**
 * Interface representing the result of an inference.
 * @interface InferenceResult
 */
export interface InferenceResult {
  text: string;
  usage: InferenceUsage;
}

/**
 * Interface representing usage statistics for generating embeddings.
 * @interface EmbeddingUsage
 */

export interface EmbeddingUsage {
  promptTokenCount: number;
}

/**
 * Interface representing the result of generating embeddings.
 * @interface EmbeddingResult
 */
export interface EmbeddingResult {
  embeddings: Array<Array<number>>;
  usage: EmbeddingUsage;
}

/**
 * Performs inferencing using the specified model and prompt, with optional settings.
 * @param {InferencingModels | string} model - The model to use for inferencing.
 * @param {string} prompt - The prompt to use for inferencing.
 * @param {InferencingOptions} [options] - Optional settings for inferencing.
 * @throws {model-not-supported} The specified model is not supported.
 * @throws {runtime-error} A runtime error has occurred.
 * @throws {invalid-input} The provided input is invalid.
 * @returns {InferenceResult} The result of the inference.
 */
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

/**
 * Generates embeddings for the given text using the specified model.
 * @param {EmbeddingModels | string} model - The model to use for generating embeddings.
 * @param {Array<string>} text - The text to generate embeddings for.
 * @throws {@link ErrorModelNotSupported} The specified model is not supported.
 * @throws {@link ErrorRuntimeError} A runtime error has occurred.
 * @throws {@link ErrorInvalidInput} The provided input is invalid.
 * @returns {EmbeddingResult} The result of generating embeddings.
 */
export const generateEmbeddings = (
  model: EmbeddingModels | string,
  text: Array<string>,
): EmbeddingResult => {
  return llmGenerateEmbeddings(model, text);
};

export interface ErrorModelNotSupported {
  tag: 'model-not-supported';
}
export interface ErrorRuntimeError {
  tag: 'runtime-error';
  val: string;
}
export interface ErrorInvalidInput {
  tag: 'invalid-input';
  val: string;
}
