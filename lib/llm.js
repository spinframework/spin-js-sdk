//@ts-ignore
import { infer as llmInfer, generateEmbeddings as llmGenerateEmbeddings } from "fermyon:spin/llm@2.0.0";
export var InferencingModels;
(function (InferencingModels) {
    InferencingModels["Llama2Chat"] = "llama2-chat";
    InferencingModels["CodellamaInstruct"] = "codellama-instruct";
})(InferencingModels || (InferencingModels = {}));
export var EmbeddingModels;
(function (EmbeddingModels) {
    EmbeddingModels["AllMiniLmL6V2"] = "all-minilm-l6-v2";
})(EmbeddingModels || (EmbeddingModels = {}));
export function infer(model, prompt, options) {
    let inference_options = {
        maxTokens: options?.maxTokens || 100,
        repeatPenalty: options?.repeatPenalty || 1.1,
        repeatPenaltyLastNTokenCount: options?.repeatPenaltyLastNTokenCount || 64,
        temperature: options?.temperature || 0.8,
        topK: options?.topK || 40,
        topP: options?.topP || 0.9
    };
    return llmInfer(model, prompt, inference_options);
}
export const generateEmbeddings = (model, text) => {
    return llmGenerateEmbeddings(model, text);
};
