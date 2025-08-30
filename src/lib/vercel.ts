type HttpMethod = 'GET' | 'POST' | 'DELETE';

function getVercelEnv() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID; // optional
  if (!token || !projectId) return null;
  return { token, projectId, teamId };
}

async function vercelFetch<T>(
  path: string,
  method: HttpMethod,
  body?: unknown
): Promise<T> {
  const env = getVercelEnv();
  if (!env) throw new Error('missing_vercel_env');
  const base = 'https://api.vercel.com';
  const url = new URL(base + path);
  if (env.teamId) url.searchParams.set('teamId', env.teamId);
  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${env.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`vercel_error_${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function addDomainToVercelProject(domain: string) {
  const env = getVercelEnv();
  if (!env) return null;
  try {
    return await vercelFetch(`/v10/projects/${env.projectId}/domains`, 'POST', {
      name: domain,
    });
  } catch (error) {
    // Ignore if already added or other non-fatal errors; caller may fallback to DNS checks
    return null;
  }
}

export async function getVercelProjectDomain(domain: string) {
  const env = getVercelEnv();
  if (!env) return null;
  try {
    // v10 domains endpoint
    return await vercelFetch(
      `/v10/projects/${env.projectId}/domains/${encodeURIComponent(domain)}`,
      'GET'
    );
  } catch (error) {
    return null;
  }
}
