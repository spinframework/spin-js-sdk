import { ResponseBuilder, Variables } from '@fermyon/spin-sdk';

export async function handler(_req: Request, res: ResponseBuilder) {
  let val = Variables.get('my_variable');
  if (!val) {
    res.status(404);
    res.send();
    return;
  }
  res.send(val);
}
