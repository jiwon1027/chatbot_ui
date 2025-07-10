/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_ENDPOINT: string
  readonly VITE_MODEL_NAME: string
  readonly VITE_TYPING_SPEED: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 