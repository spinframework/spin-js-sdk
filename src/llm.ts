//@ts-ignore
import { infer as llm_infer, llm_generateEmbeddings } from "fermyon:spin/llm@2.0.0"

export enum InferencingModels {
    Llama2Chat = "llama2-chat",
    CodellamaInstruct = "codellama-instruct"
}

export enum EmbeddingModels {
    AllMiniLmL6V2 = "all-minilm-l6-v2"
}

export interface InferencingOptions {
    maxTokens?: number,
    repeatPenalty?: number,
    repeatPenaltyLastNTokenCount?: number,
    temperature?: number,
    topK?: number,
    topP?: number
}

export interface InternalInferencingOptions {
    max_tokens?: number,
    repeat_penalty?: number,
    repeat_penalty_last_n_token_count?: number,
    temperature?: number,
    top_k?: number,
    top_p?: number
}

export interface InferenceUsage {
    promptTokenCount: number,
    generatedTokenCount: number
}
export interface InferenceResult {
    text: string
    usage: InferenceUsage
}

export interface EmbeddingUsage {
    promptTokenCount: number
}

export interface EmbeddingResult {
    embeddings: Array<Array<number>>
    usage: EmbeddingUsage
}

export const infer = (model: InferencingModels | string, prompt: string, options?: InferencingOptions): InferenceResult => {
    let inference_options: InternalInferencingOptions = {
        max_tokens: options?.maxTokens || 100,
        repeat_penalty: options?.repeatPenalty || 1.1,
        repeat_penalty_last_n_token_count: options?.repeatPenaltyLastNTokenCount || 64,
        temperature: options?.temperature || 0.8,
        top_k: options?.topK || 40,
        top_p: options?.topP || 0.9
    }
    return llm_infer(model, prompt, inference_options)
}

export const generateEmbeddings = (model: EmbeddingModels | string, text: Array<string>): EmbeddingResult => {
    return llm_generateEmbeddings(model, text)
}
