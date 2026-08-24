import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function SignaturePad({ value, onChange }: { value?: string | null; onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(value));
  const [uploadError, setUploadError] = useState("");
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(Boolean(value));
    if (!value) return;
    const image = new Image();
    image.onload = () => ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = value;
  }, [value]);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: (event.clientX - rect.left) * (500 / rect.width), y: (event.clientY - rect.top) * (180 / rect.height) }; };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); const ctx = canvasRef.current?.getContext("2d"); const p = point(event); ctx?.beginPath(); ctx?.moveTo(p.x, p.y); };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const ctx = canvasRef.current?.getContext("2d"); const p = point(event); if (!ctx) return; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.strokeStyle = "#0f172a"; ctx.lineTo(p.x, p.y); ctx.stroke(); setHasInk(true); };
  const end = () => { if (!drawing.current) return; drawing.current = false; const data = canvasRef.current?.toDataURL("image/png"); if (data) onChange(data); };
  const clear = () => { const canvas = canvasRef.current; canvas?.getContext("2d")?.clearRect(0, 0, 500, 180); setHasInk(false); onChange(""); };
  const uploadSignature = (file?: File) => {
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) { setUploadError("يرجى اختيار ملف صورة."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("حجم الصورة يجب ألا يتجاوز 5 ميغابايت."); return; }
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      const source = document.createElement("canvas");
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      source.width = Math.max(1, Math.round(image.naturalWidth * scale));
      source.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const sourceContext = source.getContext("2d", { willReadFrequently: true });
      if (!sourceContext) return;
      sourceContext.imageSmoothingEnabled = true;
      sourceContext.imageSmoothingQuality = "high";
      sourceContext.drawImage(image, 0, 0, source.width, source.height);
      const pixels = sourceContext.getImageData(0, 0, source.width, source.height);
      let borderRedTotal = 0; let borderGreenTotal = 0; let borderBlueTotal = 0; let borderBrightnessCount = 0;
      const borderSize = Math.max(2, Math.round(Math.min(source.width, source.height) * 0.03));
      for (let y = 0; y < source.height; y += 1) {
        for (let x = 0; x < source.width; x += 1) {
          if (x >= borderSize && x < source.width - borderSize && y >= borderSize && y < source.height - borderSize) continue;
          const index = (y * source.width + x) * 4;
          if (pixels.data[index + 3] <= 20) continue;
          borderRedTotal += pixels.data[index];
          borderGreenTotal += pixels.data[index + 1];
          borderBlueTotal += pixels.data[index + 2];
          borderBrightnessCount += 1;
        }
      }
      const paperRed = borderBrightnessCount ? borderRedTotal / borderBrightnessCount : 255;
      const paperGreen = borderBrightnessCount ? borderGreenTotal / borderBrightnessCount : 255;
      const paperBlue = borderBrightnessCount ? borderBlueTotal / borderBrightnessCount : 255;
      const borderBrightness = (paperRed + paperGreen + paperBlue) / 3;
      let darkPixels = 0; let darkLeft = source.width; let darkTop = source.height; let darkRight = -1; let darkBottom = -1;
      for (let index = 0; index < pixels.data.length; index += 4) {
        const brightness = (pixels.data[index] + pixels.data[index + 1] + pixels.data[index + 2]) / 3;
        if (pixels.data[index + 3] > 20 && brightness < 150) {
          darkPixels += 1;
          const x = (index / 4) % source.width;
          const y = Math.floor(index / 4 / source.width);
          darkLeft = Math.min(darkLeft, x); darkTop = Math.min(darkTop, y); darkRight = Math.max(darkRight, x); darkBottom = Math.max(darkBottom, y);
        }
      }
      // Some scanners export a light signature on a dark strip. When a large
      // dark block is detected, use that strip as the background and retain
      // only its lighter signature strokes.
      const darkBlockArea = darkRight >= darkLeft && darkBottom >= darkTop
        ? (darkRight - darkLeft + 1) * (darkBottom - darkTop + 1)
        : 0;
      const hasDarkBackground = darkBlockArea > source.width * source.height * 0.03
        && darkPixels / darkBlockArea > 0.55;
      let left = source.width; let top = source.height; let right = -1; let bottom = -1;
      for (let index = 0; index < pixels.data.length; index += 4) {
        const brightness = (pixels.data[index] + pixels.data[index + 1] + pixels.data[index + 2]) / 3;
        const x = (index / 4) % source.width;
        const y = Math.floor(index / 4 / source.width);
        const redDifference = pixels.data[index] - paperRed;
        const greenDifference = pixels.data[index + 1] - paperGreen;
        const blueDifference = pixels.data[index + 2] - paperBlue;
        const colourDistance = Math.sqrt(redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2);
        // Colour distance retains blue-pen signatures, while brightness
        // contrast retains black ink. A proportional alpha preserves the
        // anti-aliased edge pixels instead of turning uploaded strokes jagged.
        const inkStrength = Math.max(borderBrightness - brightness, colourDistance * 0.72);
        const visibleInk = hasDarkBackground
          ? x >= darkLeft && x <= darkRight && y >= darkTop && y <= darkBottom && pixels.data[index + 3] > 20 && brightness > 80
          : pixels.data[index + 3] > 20 && inkStrength > 16;
        if (!visibleInk) { pixels.data[index + 3] = 0; continue; }
        // Preserve a strong, legible signature stroke after removing the scan background.
        pixels.data[index] = 15; pixels.data[index + 1] = 23; pixels.data[index + 2] = 42;
        pixels.data[index + 3] = hasDarkBackground
          ? Math.max(48, Math.min(255, Math.round((brightness - 70) * 2.2)))
          : Math.max(36, Math.min(255, Math.round((inkStrength - 10) * 4.5)));
        left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
      if (right < left || bottom < top) { setUploadError("لم يتم العثور على توقيع واضح في الصورة."); return; }
      sourceContext.putImageData(pixels, 0, 0);
      const padding = 4;
      const cropWidth = right - left + 1;
      const cropHeight = bottom - top + 1;
      const target = canvasRef.current;
      const targetContext = target?.getContext("2d");
      if (!target || !targetContext) return;
      targetContext.clearRect(0, 0, target.width, target.height);
      targetContext.imageSmoothingEnabled = true;
      targetContext.imageSmoothingQuality = "high";
      const displayScale = Math.min((target.width - padding * 2) / cropWidth, (target.height - padding * 2) / cropHeight);
      const drawWidth = cropWidth * displayScale;
      const drawHeight = cropHeight * displayScale;
      targetContext.drawImage(source, left, top, cropWidth, cropHeight, (target.width - drawWidth) / 2, (target.height - drawHeight) / 2, drawWidth, drawHeight);
      setHasInk(true);
      onChange(target.toDataURL("image/png"));
    };
    image.onerror = () => { URL.revokeObjectURL(url); setUploadError("تعذر قراءة ملف الصورة."); };
    image.src = url;
  };
  return <div className="space-y-2"><canvas ref={canvasRef} width={500} height={180} className="h-44 w-full touch-none rounded-md border bg-white" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} /><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { uploadSignature(event.target.files?.[0]); event.currentTarget.value = ""; }} /><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{hasInk ? "تم حفظ التوقيع" : "ارسم توقيعك أو ارفع صورة له"}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>رفع صورة التوقيع</Button><Button type="button" variant="outline" size="sm" onClick={clear}>مسح</Button></div></div><p className="text-xs text-muted-foreground">تُزال الخلفية البيضاء ويُقتص التوقيع تلقائياً. يفضّل أن تكون الصورة للتوقيع فقط.</p>{uploadError && <p className="text-xs text-destructive">{uploadError}</p>}</div>;
}
