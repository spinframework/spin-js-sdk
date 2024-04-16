//@ts-ignore
import { infer as llm_infer, llm_generateEmbeddings } from "fermyon:spin/llm@2.0.0";
export var InferencingModels;
(function (InferencingModels) {
    InferencingModels["Llama2Chat"] = "llama2-chat";
    InferencingModels["CodellamaInstruct"] = "codellama-instruct";
})(InferencingModels || (InferencingModels = {}));
export var EmbeddingModels;
(function (EmbeddingModels) {
    EmbeddingModels["AllMiniLmL6V2"] = "all-minilm-l6-v2";
})(EmbeddingModels || (EmbeddingModels = {}));
export const infer = (model, prompt, options) => {
    let inference_options = {
        max_tokens: options?.maxTokens || 100,
        repeat_penalty: options?.repeatPenalty || 1.1,
        repeat_penalty_last_n_token_count: options?.repeatPenaltyLastNTokenCount || 64,
        temperature: options?.temperature || 0.8,
        top_k: options?.topK || 40,
        top_p: options?.topP || 0.9
    };
    return llm_infer(model, prompt, inference_options);
};
export const generateEmbeddings = (model, text) => {
    return llm_generateEmbeddings(model, text);
};
