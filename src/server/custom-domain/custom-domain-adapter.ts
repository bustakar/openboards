export type DomainRecommendation = { type: string; value: string };

export type DomainConfig = {
  configuredBy?: 'CNAME' | 'A' | 'ALIAS' | 'ANAME' | 'unknown';
  misconfigured?: boolean;
  recommendations?: DomainRecommendation[];
  records?: DomainRecommendation[];
};

export type VerifyInstruction = { rank: number; value: string };
export type VerifyResult = {
  verified: boolean;
  configured: boolean;
  instructions: VerifyInstruction[];
};

export interface CustomDomainAdapter {
  add(domain: string): Promise<void>;
  verify(domain: string): Promise<VerifyResult>;
  remove(domain: string): Promise<void>;
}
