export declare enum InferencingModels {
    Llama2Chat = "llama2-chat",
    CodellamaInstruct = "codellama-instruct"
}
export declare enum EmbeddingModels {
    AllMiniLmL6V2 = "all-minilm-l6-v2"
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
export declare function infer(model: InferencingModels | string, prompt: string, options?: InferencingOptions): InferenceResult;
export declare const generateEmbeddings: (model: EmbeddingModels | string, text: Array<string>) => EmbeddingResult;
