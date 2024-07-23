import { ResponseBuilder } from '@fermyon/spin-sdk';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

export async function handler(_req: Request, res: ResponseBuilder) {
  let data = await octokit.rest.repos.listForOrg({
    org: 'fermyon',
    type: 'public',
  });

  res.send(JSON.stringify(data, null, 2));
}
