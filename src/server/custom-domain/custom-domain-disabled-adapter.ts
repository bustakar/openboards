import {
  CustomDomainAdapter,
  DomainConfig,
  VerifyResult,
} from './custom-domain-adapter';

export class DisabledCustomDomainAdapter implements CustomDomainAdapter {
  private deny(): never {
    throw new Error('Custom domains are disabled');
  }
  async add(): Promise<void> {
    this.deny();
  }
  async getConfig(): Promise<DomainConfig> {
    this.deny();
  }
  async verify(): Promise<VerifyResult> {
    this.deny();
  }
  async remove(): Promise<void> {
    this.deny();
  }
}
