import { NextResponse } from 'next/server';
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, amount, currency = 'CAD', orderId, customerEmail } = body;

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId, amount' },
        { status: 400 }
      );
    }

    // Create payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Convert to cents
        currency,
      },
      locationId: SQUARE_LOCATION_ID,
      idempotencyKey: randomUUID(),
      referenceId: orderId,
      note: `Order payment for ${orderId || 'guest order'}`,
      buyerEmailAddress: customerEmail,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: result.payment?.id,
        status: result.payment?.status,
        amountMoney: result.payment?.amountMoney,
        orderId: result.payment?.referenceId,
        receiptUrl: result.payment?.receiptUrl,
      },
    });
  } catch (error: any) {
    console.error('Square payment error:', error);

    // Handle Square API errors
    if (error.errors) {
      const squareErrors = error.errors.map((e: any) => ({
        code: e.code,
        detail: e.detail,
        field: e.field,
      }));

      return NextResponse.json(
        {
          error: 'Payment failed',
          details: squareErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
