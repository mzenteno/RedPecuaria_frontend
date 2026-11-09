/* Compartido por los PDFs que llevan el logo de la empresa: el Kardex
   (`kardex-pdf.ts`) y las liquidaciones de compra/venta
   (`liquidation-pdf.ts`). */

/**
 * Descarga la imagen del logo y la vuelve a dibujar en un `<canvas>` para
 * sacarla como PNG — no porque haga falta convertir el formato (`jsPDF` ya
 * acepta PNG/JPG/WEBP tal cual), sino porque un SVG (uno de los 4 formatos
 * permitidos al subir el logo) NO lo acepta `doc.addImage()` directamente;
 * pasar los 4 formatos por el mismo canvas evita bifurcar el código según
 * el mimetype. Convertir el `Blob` ya descargado a un `blob:` URL (nunca
 * reusar la URL http original como `src` del `<img>`) es lo que evita que
 * el canvas quede "tainted" por CORS: en ese punto la imagen ya está en
 * memoria como bytes propios del navegador, no un recurso remoto.
 *
 * Devuelve `null` ante cualquier error — un logo roto no debe impedir
 * descargar el PDF, solo se lo salta.
 */
export async function loadCompanyLogo(
  url: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar el logo'));
        img.src = objectUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(image, 0, 0);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}
