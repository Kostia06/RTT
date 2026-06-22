import { NextResponse } from 'next/server';
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID } from '@/lib/square/client';

// Public, non-secret config the browser Web Payments SDK needs.
// The access token is NEVER returned here. Empty strings signal "card payment
// unavailable" so the client can degrade gracefully.
export async function GET() {
  return NextResponse.json({
    applicationId: SQUARE_APPLICATION_ID || '',
    locationId: SQUARE_LOCATION_ID || '',
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}
