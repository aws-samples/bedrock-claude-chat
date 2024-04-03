/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_ENDPOINT: string;
  readonly VITE_APP_WS_ENDPOINT: string;
  readonly VITE_APP_REGION: string;
  readonly VITE_APP_USER_POOL_ID: string;
  readonly VITE_APP_USER_POOL_CLIENT_ID: string;
  readonly VITE_APP_COGNITO_DOMAIN: string;
  readonly VITE_APP_REDIRECT_SIGNIN_URL: string;
  readonly VITE_APP_REDIRECT_SIGNOUT_URL: string;
  readonly VITE_APP_SOCIAL_PROVIDERS: string;
  readonly VITE_APP_CUSTOM_PROVIDER_ENABLED: string;
  readonly VITE_APP_CUSTOM_PROVIDER_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
