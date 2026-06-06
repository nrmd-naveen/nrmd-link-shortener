import QRCode from "qrcode";

interface QrOptions {
  size?: number;
  darkColor?: string;
  lightColor?: string;
}

/** Returns a data URL (PNG) for the given text */
export async function generateQrDataUrl(
  text: string,
  { size = 300, darkColor = "#000000", lightColor = "#ffffff" }: QrOptions = {}
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    color: { dark: darkColor, light: lightColor },
    errorCorrectionLevel: "M",
  });
}

/** Returns raw SVG string */
export async function generateQrSvg(text: string, { darkColor = "#000000", lightColor = "#ffffff" }: QrOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 2,
    color: { dark: darkColor, light: lightColor },
    errorCorrectionLevel: "M",
  });
}
