import sharp from 'sharp';
import { createHash } from 'node:crypto';
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export async function normalizeImage(bytes: Buffer, mime: string) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw Error('Images must be between 1 byte and 3 MiB.');
  const formats: Record<string,string> = { 'image/jpeg':'jpeg', 'image/png':'png', 'image/webp':'webp' };
  if (!formats[mime]) throw Error('Choose a JPEG, PNG or WebP image. SVG is not supported.');
  const image = sharp(bytes, { limitInputPixels: 24000000, failOn: 'warning', animated: false });
  const meta = await image.metadata();
  if (meta.format !== formats[mime] || !meta.width || !meta.height || Math.max(meta.width, meta.height) > 6000 || meta.width * meta.height > 24000000 || (meta.pages ?? 1) > 1) throw Error('Image format or dimensions are not supported.');
  const { data, info } = await image.autoOrient().resize({ width:1200, height:1200, fit:'inside', withoutEnlargement:true }).png().toBuffer({ resolveWithObject:true });
  const thumbnail = await sharp(data).resize({ width:240, height:240, fit:'inside', withoutEnlargement:true }).png().toBuffer();
  return { delivery:data, thumbnail, width:info.width, height:info.height, checksum:createHash('sha256').update(data).digest('hex'), sourceChecksum:createHash('sha256').update(bytes).digest('hex') };
}
