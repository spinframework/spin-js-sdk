import { Llm, ResponseBuilder } from '@fermyon/spin-sdk';

export async function handler(_req: Request, res: ResponseBuilder) {
  let result = Llm.infer(Llm.InferencingModels.Llama2Chat, 'tell me a joke');

  res.send(JSON.stringify(result));
}
