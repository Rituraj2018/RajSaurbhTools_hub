import React, { useRef, useEffect, useCallback, useState } from 'react';
import { LoadedCropImage, CropBox, CropState } from '../../utils/imageCropperProcessor';

interface Props {
  image: LoadedCropImage;
  cropState: CropState;
  onCropBoxChange: (box: CropBox) => void;
  onPanChange: (panX: number, panY: number) => void;
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move' | 'pan' | null;

const HANDLE_SIZE = 10; // px in canvas display coords

export const ImageCropperWorkspace: React.FC<Props> = ({
  image,
  cropState,
  onCropBoxChange,
  onPanChange,
}) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag interaction state (refs to avoid re-renders during drag)
  const dragging   = useRef<Handle>(null);
  const dragStart  = useRef<{ px: number; py: number; box: CropBox; panX: number; panY: number } | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────

  /**
   * Compute display layout for the image on the canvas.
   * Returns: { imgLeft, imgTop, displayW, displayH, fitScale }
   * where imgLeft/imgTop is the top-left of the image bounding box (before rotation offset)
   * and displayW/displayH is the bounding box size of the (rotated) image at current zoom.
   */
  const getLayout = useCallback((cW: number, cH: number) => {
    const { rotation, zoom, panX, panY } = cropState;
    const isSwapped = rotation === 90 || rotation === 270;
    const effW = isSwapped ? image.naturalHeight : image.naturalWidth;
    const effH = isSwapped ? image.naturalWidth  : image.naturalHeight;

    const fitScale  = Math.min((cW * 0.9) / effW, (cH * 0.9) / effH);
    const displayW  = effW * fitScale * zoom;
    const displayH  = effH * fitScale * zoom;
    const imgLeft   = (cW - displayW) / 2 + panX;
    const imgTop    = (cH - displayH) / 2 + panY;

    return { imgLeft, imgTop, displayW, displayH, fitScale, effW, effH };
  }, [cropState, image]);

  /**
   * Convert percentage crop box → canvas pixel rect
   */
  const cropToCanvas = useCallback((box: CropBox, layout: ReturnType<typeof getLayout>) => {
    const { imgLeft, imgTop, displayW, displayH } = layout;
    return {
      cx: imgLeft + (box.x / 100) * displayW,
      cy: imgTop  + (box.y / 100) * displayH,
      cw: (box.w / 100) * displayW,
      ch: (box.h / 100) * displayH,
    };
  }, []);

  // ─── Canvas Rendering ─────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW === 0 || cH === 0) return;

    canvas.width  = cW;
    canvas.height = cH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { rotation, flipH, flipV, circleCrop, cropBox } = cropState;
    const layout = getLayout(cW, cH);
    const { imgLeft, imgTop, displayW, displayH } = layout;

    // ── 1. Draw image (rotated + flipped) at display scale ──
    ctx.save();
    ctx.translate(imgLeft + displayW / 2, imgTop + displayH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    ctx.drawImage(image.img, -displayW / 2, -displayH / 2, displayW, displayH);
    ctx.restore();

    // ── 2. Semi-transparent dark overlay ──
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, cW, cH);

    // ── 3. Cut crop area (bright) ──
    const { cx, cy, cw, ch } = cropToCanvas(cropBox, layout);

    ctx.save();
    if (circleCrop) {
      const cx2 = cx + cw / 2;
      const cy2 = cy + ch / 2;
      const r   = Math.min(cw, ch) / 2;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(cx, cy, cw, ch);
      ctx.clip();
    }

    // Re-draw image in bright crop region
    ctx.translate(imgLeft + displayW / 2, imgTop + displayH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    ctx.drawImage(image.img, -displayW / 2, -displayH / 2, displayW, displayH);
    ctx.restore();

    // ── 4. Crop border ──
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    if (circleCrop) {
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch / 2, Math.min(cw, ch) / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cx, cy, cw, ch);
    }

    // ── 5. Rule-of-thirds grid inside crop ──
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1;
    for (let i = 1; i <= 2; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(cx + (cw / 3) * i, cy);
      ctx.lineTo(cx + (cw / 3) * i, cy + ch);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(cx, cy + (ch / 3) * i);
      ctx.lineTo(cx + cw, cy + (ch / 3) * i);
      ctx.stroke();
    }

    // ── 6. Resize handles ──
    if (!circleCrop) {
      const handles = getHandlePositions(cx, cy, cw, ch);
      handles.forEach(({ x, y }) => {
        ctx.fillStyle   = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(x, y, HANDLE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // ── 7. Dimensions label ──
    const { effW, effH } = layout;
    const labelW = Math.round((cropBox.w / 100) * effW);
    const labelH = Math.round((cropBox.h / 100) * effH);
    const label  = `${labelW} × ${labelH} px`;
    ctx.font      = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(cx + 4, cy + ch + 6, ctx.measureText(label).width + 12, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, cx + 10, cy + ch + 20);

  }, [cropState, image, getLayout, cropToCanvas]);

  // Re-render on state changes
  useEffect(() => {
    render();
  }, [render]);

  // Re-render on resize
  useEffect(() => {
    const obs = new ResizeObserver(() => render());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [render]);

  // ─── Mouse / Touch interaction ──────────────────────────────

  function getHandlePositions(cx: number, cy: number, cw: number, ch: number) {
    return [
      { id: 'nw', x: cx,        y: cy },
      { id: 'n',  x: cx + cw/2, y: cy },
      { id: 'ne', x: cx + cw,   y: cy },
      { id: 'e',  x: cx + cw,   y: cy + ch/2 },
      { id: 'se', x: cx + cw,   y: cy + ch },
      { id: 's',  x: cx + cw/2, y: cy + ch },
      { id: 'sw', x: cx,        y: cy + ch },
      { id: 'w',  x: cx,        y: cy + ch/2 },
    ];
  }

  const getCanvasXY = (e: React.MouseEvent | React.TouchEvent): { px: number; py: number } => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      px: ((clientX - rect.left) / rect.width)  * canvas.width,
      py: ((clientY - rect.top)  / rect.height) * canvas.height,
    };
  };

  const hitTestHandle = useCallback((px: number, py: number): Handle => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const layout  = getLayout(canvas.width, canvas.height);
    const { cx, cy, cw, ch } = cropToCanvas(cropState.cropBox, layout);

    if (cropState.circleCrop) {
      const dx = px - (cx + cw / 2);
      const dy = py - (cy + ch / 2);
      const r  = Math.min(cw, ch) / 2;
      if (Math.sqrt(dx * dx + dy * dy) <= r) return 'move';
      return null;
    }

    const handles = getHandlePositions(cx, cy, cw, ch);
    for (const h of handles) {
      const dist = Math.sqrt((px - h.x) ** 2 + (py - h.y) ** 2);
      if (dist <= HANDLE_SIZE + 2) return h.id as Handle;
    }

    // Inside crop box → move
    if (px >= cx && px <= cx + cw && py >= cy && py <= cy + ch) return 'move';

    // Inside image bbox → pan
    const { imgLeft, imgTop, displayW, displayH } = layout;
    if (px >= imgLeft && px <= imgLeft + displayW && py >= imgTop && py <= imgTop + displayH) return 'pan';

    return null;
  }, [cropState, getLayout, cropToCanvas]);

  const getCursorForHandle = (h: Handle): string => {
    switch (h) {
      case 'nw': case 'se': return 'nwse-resize';
      case 'ne': case 'sw': return 'nesw-resize';
      case 'n':  case 's':  return 'ns-resize';
      case 'e':  case 'w':  return 'ew-resize';
      case 'move': return 'move';
      case 'pan':  return 'grab';
      default: return 'default';
    }
  };

  const [cursor, setCursor] = useState('default');

  const onPointerMove = useCallback((px: number, py: number) => {
    if (!dragging.current || !dragStart.current) {
      // Hover cursor
      const h = hitTestHandle(px, py);
      setCursor(getCursorForHandle(h));
      return;
    }

    const { px: startX, py: startY, box, panX: startPanX, panY: startPanY } = dragStart.current;
    const dx = px - startX;
    const dy = py - startY;

    const canvas  = canvasRef.current!;
    const layout  = getLayout(canvas.width, canvas.height);
    const { displayW, displayH } = layout;

    // Convert dx/dy to percentage of image
    const dxPct = (dx / displayW) * 100;
    const dyPct = (dy / displayH) * 100;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const { aspectRatioId } = cropState;

    // Find aspect ratio constraint
    let fixedAspect: number | null = null;
    if (aspectRatioId !== 'free') {
      const preset = [
        { id: '1:1', ratio: 1 }, { id: '4:3', ratio: 4/3 }, { id: '3:2', ratio: 3/2 },
        { id: '16:9', ratio: 16/9 }, { id: '3:4', ratio: 3/4 }, { id: '2:3', ratio: 2/3 },
        { id: '9:16', ratio: 9/16 },
      ].find(p => p.id === aspectRatioId);
      if (preset) {
        // ratio = (w * effW) / (h * effH) → in percentage space, ratio = (dw/100 * effW)/(dh/100 * effH)
        // = (dw * effW) / (dh * effH)
        // effW/effH is the image aspect, so fixedAspect (in pct-space) = ratio * effH / effW
        const { effW, effH } = layout;
        fixedAspect = (preset.ratio * effH) / effW;
      }
    }

    const handle = dragging.current;

    if (handle === 'pan') {
      onPanChange(startPanX + dx, startPanY + dy);
      return;
    }

    if (handle === 'move') {
      const newX = clamp(box.x + dxPct, 0, 100 - box.w);
      const newY = clamp(box.y + dyPct, 0, 100 - box.h);
      onCropBoxChange({ ...box, x: newX, y: newY });
      return;
    }

    // Resize handles
    let { x, y, w, h } = box;

    if (handle === 'e' || handle === 'ne' || handle === 'se') {
      w = clamp(box.w + dxPct, 5, 100 - box.x);
      if (fixedAspect) h = clamp(w / fixedAspect, 5, 100 - box.y);
    }
    if (handle === 'w' || handle === 'nw' || handle === 'sw') {
      const newX  = clamp(box.x + dxPct, 0, box.x + box.w - 5);
      w           = clamp(box.w - (newX - box.x), 5, 100 - newX);
      x           = box.x + box.w - w;
      if (fixedAspect) h = clamp(w / fixedAspect, 5, 100 - y);
    }
    if (handle === 's' || handle === 'se' || handle === 'sw') {
      h = clamp(box.h + dyPct, 5, 100 - box.y);
      if (fixedAspect) w = clamp(h * fixedAspect, 5, 100 - x);
    }
    if (handle === 'n' || handle === 'ne' || handle === 'nw') {
      const newY  = clamp(box.y + dyPct, 0, box.y + box.h - 5);
      h           = clamp(box.h - (newY - box.y), 5, 100 - newY);
      y           = box.y + box.h - h;
      if (fixedAspect) w = clamp(h * fixedAspect, 5, 100 - x);
    }

    // Final clamp
    x = clamp(x, 0, 100 - w);
    y = clamp(y, 0, 100 - h);
    w = clamp(w, 5, 100 - x);
    h = clamp(h, 5, 100 - y);

    onCropBoxChange({
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      w: parseFloat(w.toFixed(2)),
      h: parseFloat(h.toFixed(2)),
    });
  }, [cropState, hitTestHandle, getLayout, onCropBoxChange, onPanChange]);

  const onPointerDown = useCallback((px: number, py: number) => {
    const h = hitTestHandle(px, py);
    if (!h) return;
    dragging.current  = h;
    dragStart.current = {
      px,
      py,
      box: { ...cropState.cropBox },
      panX: cropState.panX,
      panY: cropState.panY,
    };
    setCursor(getCursorForHandle(h));
  }, [hitTestHandle, cropState]);

  const onPointerUp = useCallback(() => {
    dragging.current  = null;
    dragStart.current = null;
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { px, py } = getCanvasXY(e);
    onPointerDown(px, py);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    const { px, py } = getCanvasXY(e);
    onPointerMove(px, py);
  };
  const handleMouseUp = () => onPointerUp();

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const { px, py } = getCanvasXY(e);
    onPointerDown(px, py);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const { px, py } = getCanvasXY(e);
    onPointerMove(px, py);
  };
  const handleTouchEnd = () => onPointerUp();

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800"
      style={{ minHeight: 420, userSelect: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ cursor, touchAction: 'none', display: 'block', width: '100%', height: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Image crop workspace — drag handles to resize the crop area"
        role="img"
      />
    </div>
  );
};
