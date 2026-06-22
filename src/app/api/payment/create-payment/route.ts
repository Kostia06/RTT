import { NextResponse } from 'next/server';
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client';
import { getDb } from '@/lib/db/client';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, orderId, customerEmail, currency = 'CAD' } = body;

    if (!sourceId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId, orderId' },
        { status: 400 }
      );
    }

    // Source of truth for the amount is the stored order total, never the client.
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 409 });
    }

    const amount = Number(order.total);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Order has no payable total' }, { status: 400 });
    }

    // Charge via Square.
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // dollars -> cents
        currency,
      },
      locationId: SQUARE_LOCATION_ID,
      idempotencyKey: randomUUID(),
      referenceId: orderId,
      note: `Order payment for ${order.order_number}`,
      buyerEmailAddress: customerEmail,
    });

    const payment = result.payment;

    // Confirm the order in the same server action (the customer cannot do this —
    // the orders PATCH is employee-guarded — and this proves "paid").
    try {
      await db
        .update(orders)
        .set({
          payment_status: 'paid',
          payment_id: payment?.id ?? null,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));
    } catch (updateError) {
      // Charge succeeded; don't fail the customer. Log for manual reconciliation.
      console.error(
        `Payment ${payment?.id} succeeded but order ${orderId} update failed:`,
        updateError
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      payment: {
        id: payment?.id,
        status: payment?.status,
        receiptUrl: payment?.receiptUrl,
      },
    });
  } catch (error: any) {
    console.error('Square payment error:', error);
    if (error.errors) {
      const squareErrors = error.errors.map((e: any) => ({
        code: e.code,
        detail: e.detail,
        field: e.field,
      }));
      return NextResponse.json({ error: 'Payment failed', details: squareErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
