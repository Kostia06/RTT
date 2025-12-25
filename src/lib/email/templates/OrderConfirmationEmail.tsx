import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fulfillmentType: 'delivery' | 'pickup';
  scheduledDate?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  tax,
  shippingCost,
  total,
  shippingAddress,
  fulfillmentType,
  scheduledDate,
}: OrderConfirmationEmailProps) => {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background-color: #000;
            color: #fff;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 20px;
          }
          .order-number {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
          }
          .greeting {
            margin-bottom: 20px;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            text-align: left;
            padding: 12px 8px;
            border-bottom: 2px solid #000;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .items-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #e5e5e5;
          }
          .item-name {
            font-weight: 600;
          }
          .item-variant {
            font-size: 14px;
            color: #666;
          }
          .totals-table {
            width: 100%;
            margin-top: 20px;
          }
          .totals-table td {
            padding: 8px 0;
          }
          .totals-table .label {
            text-align: right;
            padding-right: 20px;
          }
          .totals-table .amount {
            text-align: right;
            font-weight: 600;
          }
          .total-row {
            border-top: 2px solid #000;
            font-size: 18px;
            font-weight: bold;
          }
          .address-box {
            background-color: #f9f9f9;
            padding: 20px;
            border-left: 4px solid #000;
          }
          .address-box p {
            margin: 5px 0;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            background-color: #000;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #000;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>RESPECT THE TECHNIQUE</h1>
          </div>

          {/* Content */}
          <div className="content">
            <p className="order-number">Order #{orderNumber}</p>
            <p className="greeting">
              Hi {customerName},
            </p>
            <p>
              Thank you for your order! We&apos;ve received your order and will begin
              preparing it shortly.
            </p>

            {/* Order Items */}
            <div className="section">
              <h2 className="section-title">Order Details</h2>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="item-name">{item.productName}</div>
                        {item.variantName && (
                          <div className="item-variant">{item.variantName}</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td className="label">Subtotal:</td>
                    <td className="amount">${subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Tax:</td>
                    <td className="amount">${tax.toFixed(2)}</td>
                  </tr>
                  {shippingCost > 0 && (
                    <tr>
                      <td className="label">Shipping:</td>
                      <td className="amount">${shippingCost.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="total-row">
                    <td className="label">Total:</td>
                    <td className="amount">${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fulfillment Info */}
            <div className="section">
              <h2 className="section-title">
                {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'} Information
              </h2>
              <div className="badge">
                {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}
              </div>
              {scheduledDate && (
                <p style={{ marginTop: '10px' }}>
                  <strong>Scheduled for:</strong> {scheduledDate}
                </p>
              )}
            </div>

            {/* Address */}
            {fulfillmentType === 'delivery' && (
              <div className="section">
                <h2 className="section-title">Delivery Address</h2>
                <div className="address-box">
                  <p>
                    <strong>
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </strong>
                  </p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && (
                    <p>{shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{' '}
                    {shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders/${orderNumber}`}
                className="button"
              >
                View Order Status
              </a>
            </div>

            <p style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
              If you have any questions about your order, please contact us at{' '}
              <a href="mailto:support@respectthetechnique.com" style={{ color: '#000' }}>
                support@respectthetechnique.com
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="footer">
            <p style={{ margin: '0 0 10px 0' }}>
              <strong>Respect The Technique</strong>
            </p>
            <p style={{ margin: '5px 0' }}>Authentic Ramen & Japanese Cuisine</p>
            <p style={{ margin: '5px 0' }}>Edmonton, Alberta, Canada</p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default OrderConfirmationEmail;
