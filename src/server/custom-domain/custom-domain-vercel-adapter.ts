import { Vercel } from '@vercel/sdk';
import { CustomDomainAdapter, VerifyResult } from './custom-domain-adapter';

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

export class VercelCustomDomainAdapter implements CustomDomainAdapter {
  async add(domain: string) {
    const { projectId, teamId } = this.requireEnv();
    await vercel.projects.addProjectDomain({
      idOrName: projectId,
      teamId: teamId,
      requestBody: {
        name: domain,
      },
    });
  }

  async verify(domain: string): Promise<VerifyResult> {
    const { projectId, teamId } = this.requireEnv();
    const [checkConfiguration, verify] = await Promise.all([
      vercel.domains.getDomainConfig({
        projectIdOrName: projectId,
        teamId,
        domain,
      }),
      vercel.projects.verifyProjectDomain({
        idOrName: projectId,
        teamId,
        domain,
      }),
    ]);

    console.log(checkConfiguration);
    console.log(verify);

    const verified = Boolean(verify.verified);
    const configured = Boolean(!checkConfiguration.misconfigured);
    const instructions = checkConfiguration.recommendedCNAME;
    return { verified, configured, instructions };
  }

  async remove(domain: string): Promise<void> {
    const { projectId, teamId } = this.requireEnv();
    await Promise.all([
      vercel.projects.removeProjectDomain({
        idOrName: projectId,
        teamId,
        domain,
      }),
      vercel.domains.deleteDomain({
        teamId,
        domain,
      }),
    ]);
  }

  private requireEnv() {
    if (!process.env.VERCEL_TOKEN) throw new Error('VERCEL_TOKEN not set');
    if (!process.env.VERCEL_PROJECT_ID)
      throw new Error('VERCEL_PROJECT_ID not set');
    if (!process.env.VERCEL_TEAM_ID) throw new Error('VERCEL_TEAM_ID not set');
    return {
      projectId: process.env.VERCEL_PROJECT_ID as string,
      teamId: process.env.VERCEL_TEAM_ID as string,
    };
  }
}
