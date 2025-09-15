import { CustomDomainAdapter } from './custom-domain-adapter';
import { DisabledCustomDomainAdapter } from './custom-domain-disabled-adapter';
import { VercelCustomDomainAdapter } from './custom-domain-vercel-adapter';

export function getCustomDomainAdapter(): CustomDomainAdapter {
  const provider = process.env.CUSTOM_DOMAINS_PROVIDER || 'off';
  switch (provider) {
    case 'vercel':
      return new VercelCustomDomainAdapter();
    case 'off':
    default:
      return new DisabledCustomDomainAdapter();
  }
}

export function getCustomDomainProviderName() {
  return process.env.CUSTOM_DOMAINS_PROVIDER || 'off';
}
