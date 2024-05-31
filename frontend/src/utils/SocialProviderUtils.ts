import { SocialProvider } from '../@types/auth';

export const validateSocialProvider = (
  provider: string
): provider is SocialProvider =>
  ['google', 'facebook', 'amazon', 'apple'].includes(provider);
