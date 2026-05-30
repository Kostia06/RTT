import { Client, Environment } from 'square';

let client: Client | null = null;

// Lazily create the Square client on first use. This keeps `next build`
// (which imports route modules without env) from throwing at import time;
// the credential check now runs at call time instead.
function getSquareClient(): Client {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('SQUARE_ACCESS_TOKEN is required');
  }
  if (!process.env.SQUARE_LOCATION_ID) {
    throw new Error('SQUARE_LOCATION_ID is required');
  }
  if (!client) {
    client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? Environment.Production
          : Environment.Sandbox,
    });
  }
  return client;
}

export const squareClient = new Proxy({} as Client, {
  get(_target, prop) {
    const instance = getSquareClient();
    const value = Reflect.get(instance as object, prop);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
export const SQUARE_APPLICATION_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '';
