import {
  CustomDomainAdapter,
  DomainConfig,
  VerifyResult,
} from './custom-domain-adapter';

function buildVercelUrl(path: string) {
  const url = new URL(`https://api.vercel.com${path}`);
  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

async function vercelFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<{ ok: boolean; status: number; data?: T; text?: string }> {
  const { json, ...rest } = init || {};
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
  };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(buildVercelUrl(path), {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: 'no-store',
  });
  const ctype = res.headers.get('content-type') || '';
  const payload = ctype.includes('application/json')
    ? await res.json()
    : await res.text();
  return {
    ok: res.ok,
    status: res.status,
    data: ctype.includes('application/json') ? (payload as T) : undefined,
    text: typeof payload === 'string' ? payload : undefined,
  };
}

export class VercelCustomDomainAdapter implements CustomDomainAdapter {
  private requireEnv() {
    if (!process.env.VERCEL_TOKEN) throw new Error('VERCEL_TOKEN not set');
    if (!process.env.VERCEL_PROJECT_ID)
      throw new Error('VERCEL_PROJECT_ID not set');
  }

  async add(domain: string) {
    this.requireEnv();
    const projectId = process.env.VERCEL_PROJECT_ID as string;
    const res = await vercelFetch(`/v9/projects/${projectId}/domains`, {
      method: 'POST',
      json: { name: domain },
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(
        `Vercel add-domain failed (${res.status}): ${res.text || ''}`
      );
    }
  }

  async getConfig(domain: string): Promise<DomainConfig> {
    this.requireEnv();
    const projectId = process.env.VERCEL_PROJECT_ID as string;

    let res = await vercelFetch<DomainConfig>(
      `/v9/projects/${projectId}/domains/${domain}/config`
    );
    if (!res.ok) {
      res = await vercelFetch<DomainConfig>(`/v6/domains/${domain}/config`);
    }
    if (!res.ok) {
      throw new Error(
        `Vercel domain config failed (${res.status}): ${res.text || ''}`
      );
    }
    return res.data!;
  }

  async verify(domain: string): Promise<VerifyResult> {
    this.requireEnv();
    const res = await vercelFetch<VerifyResult>(
      `/v2/domains/${domain}/verify`,
      {
        method: 'POST',
      }
    );
    if (!res.ok) {
      throw new Error(
        `Vercel domain verify failed (${res.status}): ${res.text || ''}`
      );
    }
    return res.data || { verified: true };
  }

  async remove(domain: string): Promise<void> {
    this.requireEnv();
    const projectId = process.env.VERCEL_PROJECT_ID as string;
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${domain}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok && res.status !== 404) {
      throw new Error(
        `Vercel remove-domain failed (${res.status}): ${res.text || ''}`
      );
    }
  }
}
