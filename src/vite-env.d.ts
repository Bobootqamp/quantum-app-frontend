/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of quantum-app-backend (e.g. http://localhost:8080). Unset = browser-only simulation. */
  readonly VITE_QISKIT_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
