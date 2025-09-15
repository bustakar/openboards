export type DomainRecommendation = { type: string; value: string };

export type DomainConfig = {
  configuredBy?: 'CNAME' | 'A' | 'ALIAS' | 'ANAME' | 'unknown';
  misconfigured?: boolean;
  recommendations?: DomainRecommendation[];
  records?: DomainRecommendation[];
};

export type VerifyResult = { verified: boolean; raw?: unknown };

export interface CustomDomainAdapter {
  add(domain: string): Promise<void>;
  getConfig(domain: string): Promise<DomainConfig>;
  verify(domain: string): Promise<VerifyResult>;
  remove(domain: string): Promise<void>;
}
