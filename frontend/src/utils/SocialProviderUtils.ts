import { SocialProvider } from '@aws-amplify/ui';

export const validateSocialProvider = (
  provider: string
): provider is SocialProvider =>
  ['google', 'facebook', 'amazon', 'apple'].includes(provider);
