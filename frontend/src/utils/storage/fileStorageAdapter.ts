import type { ImageConfig, ImageConfigStored } from '../../types/design';

/**
 * File → Base64 DataURL 변환
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Base64 DataURL → File 변환
 */
export function dataURLtoFile(dataUrl: string, filename: string, mimeType: string): File {
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
}

/**
 * ImageConfig 배열을 직렬화 (File → Base64)
 */
export async function serializeImages(images: ImageConfig[]): Promise<ImageConfigStored[]> {
  return Promise.all(
    images.map(async (img) => {
      const dataUrl = await fileToDataURL(img.file);
      return {
        id: img.id,
        fileName: img.file.name,
        fileType: img.file.type,
        fileDataUrl: dataUrl,
        size: img.size,
        heightOffset: img.heightOffset,
        horizontalOffset: img.horizontalOffset,
      } as ImageConfigStored;
    })
  );
}

/**
 * ImageConfigStored 배열을 역직렬화 (Base64 → File)
 */
export function deserializeImages(storedImages: ImageConfigStored[]): ImageConfig[] {
  return storedImages.map((img) => ({
    id: img.id,
    file: dataURLtoFile(img.fileDataUrl, img.fileName, img.fileType),
    size: img.size,
    heightOffset: img.heightOffset,
    horizontalOffset: img.horizontalOffset,
  }));
}
