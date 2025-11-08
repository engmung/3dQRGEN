import * as QRCode from "qrcode";

/**
 * QR 코드를 비트맵 배열로 변환
 * @param text QR 코드에 인코딩할 텍스트
 * @returns { data: boolean[][], size: number } - 2D 비트맵 배열과 크기
 */
export async function generateQRBitmap(
  text: string
): Promise<{ data: boolean[][]; size: number }> {
  try {
    // QR 코드 모듈 데이터 생성
    const qrData = await QRCode.create(text, { errorCorrectionLevel: "M" });
    const modules = qrData.modules;
    const size = modules.size;

    // 2D 배열로 변환 (true = 검은색, false = 흰색)
    const bitmap: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        row.push(!!modules.get(x, y));
      }
      bitmap.push(row);
    }

    return { data: bitmap, size };
  } catch (error) {
    console.error("QR bitmap generation failed:", error);
    throw error;
  }
}
