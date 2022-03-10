import { config } from 'dotenv';

config();

const { MODE } = process.env;

export const API_KEY = MODE === 'prod'
    ? process.env.API_KEY
    : process.env.SANDBOX_API_KEY;

export const API_SECRET = MODE === 'prod'
    ? process.env.API_SECRET
    : process.env.SANDBOX_API_SECRET;

export const API_PASSPHRASE = MODE === 'prod'
    ? process.env.API_PASSPHRASE
    : process.env.SANDBOX_API_PASSPHRASE;
