import QRCode from 'qrcode';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateClassCheckInQR(
  classId: string,
  sessionDate: string
): Promise<string> {
  const data = JSON.stringify({
    type: 'class_checkin',
    classId,
    sessionDate,
    timestamp: new Date().toISOString(),
  });
  return generateQRCode(data);
}

export async function generateInventoryQR(itemId: string): Promise<string> {
  const data = JSON.stringify({
    type: 'inventory',
    itemId,
    timestamp: new Date().toISOString(),
  });
  return generateQRCode(data);
}

export function parseQRCodeData(qrData: string): {
  type: string;
  classId?: string;
  sessionDate?: string;
  itemId?: string;
  timestamp: string;
} | null {
  try {
    return JSON.parse(qrData);
  } catch {
    return null;
  }
}
