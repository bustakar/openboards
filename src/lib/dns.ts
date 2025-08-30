export interface DnsCheckResult {
  valid: boolean;
  reason?: string;
  details?: unknown;
}

interface DnsAnswerRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface GoogleDnsResponse {
  Status: number;
  Answer?: DnsAnswerRecord[];
}

// Minimal DNS verification via public endpoints. For production, prefer Vercel Domains Verify API.
export async function checkDomainCNAME(
  domain: string,
  expected: string
): Promise<DnsCheckResult> {
  try {
    // Use Google DNS-over-HTTPS
    const url = `https://dns.google/resolve?name=${encodeURIComponent(
      domain
    )}&type=CNAME`;
    const res = await fetch(url);
    const data = (await res.json()) as GoogleDnsResponse;
    if (!data || data.Status !== 0 || !Array.isArray(data.Answer)) {
      return { valid: false, reason: 'no_cname', details: data };
    }
    const matches = data.Answer.some(
      (record) =>
        typeof record.data === 'string' &&
        record.data.replace(/\.$/, '').toLowerCase() === expected.toLowerCase()
    );
    return {
      valid: matches,
      reason: matches ? undefined : 'mismatch',
      details: data,
    };
  } catch (error) {
    return { valid: false, reason: 'dns_error', details: String(error) };
  }
}
