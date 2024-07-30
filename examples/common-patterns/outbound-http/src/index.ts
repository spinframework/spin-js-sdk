import { ResponseBuilder } from '@fermyon/spin-sdk';

export async function handler(_req: Request, res: ResponseBuilder) {
  let response = await fetch(
    'https://random-data-api.fermyon.app/physics/json',
  );
  let physicsFact = await response.text();

  res.send(physicsFact);
}
