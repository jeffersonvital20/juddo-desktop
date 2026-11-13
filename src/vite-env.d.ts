/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_ENV_LABEL?: string;
  readonly VITE_DEFAULT_API_URL?: string;
  readonly VITE_DEFAULT_HUB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
