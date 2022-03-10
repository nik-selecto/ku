declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PASSPHRASE?: string;
      API_KEY?: string;
      API_SECRET?: string;
    }
  }
}

export { };
