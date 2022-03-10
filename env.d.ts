declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MODE: 'dev' | 'prod';
      API_PASSPHRASE: string;
      API_KEY: string;
      API_SECRET: string;
      SANDBOX_API_SECRET: string;
      SANDBOX_API_KEY: string;
      SANDBOX_API_PASSPHRASE: string;
    }
  }
}

export { };
