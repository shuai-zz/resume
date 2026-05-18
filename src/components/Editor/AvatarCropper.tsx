import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface AvatarCropperProps {
  src: string;
  onConfirm: (croppedDataURL: string, aspect: number) => void;
  onCancel: () => void;
}

type AspectMode = 'square' | 'photo1' | 'photo2' | 'free';

const ASPECT_OPTIONS: { id: AspectMode; label: string }[] = [
  { id: 'photo1', label: '1寸照 5:7' },
  { id: 'photo2', label: '2寸照 3.5:4.5' },
  { id: 'square', label: '方形 1:1' },
  { id: 'free', label: '自由' },
];

const CROP_HEIGHT = 360;
const MAX_OUTPUT_WIDTH = 600;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function AvatarCropper({ src, onConfirm, onCancel }: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [aspectMode, setAspectMode] = useState<AspectMode>('photo1');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseOX: number; baseOY: number } | null>(null);

  const aspect = useMemo(() => {
    if (aspectMode === 'square') return 1;
    if (aspectMode === 'photo1') return 5 / 7;
    if (aspectMode === 'photo2') return 35 / 45;
    if (imgSize.w > 0 && imgSize.h > 0) return imgSize.w / imgSize.h;
    return 1;
  }, [aspectMode, imgSize]);

  const CW = CROP_HEIGHT * aspect;
  const CH = CROP_HEIGHT;

  const baseScale = useMemo(() => {
    if (!imgSize.w || !imgSize.h) return 1;
    return Math.max(CW / imgSize.w, CH / imgSize.h);
  }, [imgSize, CW, CH]);

  const S = baseScale * zoom;
  const DW = imgSize.w * S;
  const DH = imgSize.h * S;

  const clampOffset = useCallback(
    (o: { x: number; y: number }) => {
      const maxX = Math.max(0, (DW - CW) / 2);
      const maxY = Math.max(0, (DH - CH) / 2);
      return { x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) };
    },
    [DW, DH, CW, CH],
  );

  // aspect/zoom 变化时重新 clamp（图片加载完成后也走这条路径）
  useEffect(() => {
    setOffset((o) => clampOffset(o));
  }, [clampOffset]);

  const handleImgLoad = () => {
    const el = imgRef.current;
    if (el) setImgSize({ w: el.naturalWidth, h: el.naturalHeight });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseOX: offset.x, baseOY: offset.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      setOffset(clampOffset({ x: d.baseOX + (e.clientX - d.startX), y: d.baseOY + (e.clientY - d.startY) }));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [clampOffset]);

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !imgSize.w || !imgSize.h) return;
    const srcWPx = CW / S;
    const srcHPx = CH / S;
    const srcX = imgSize.w / 2 - offset.x / S - srcWPx / 2;
    const srcY = imgSize.h / 2 - offset.y / S - srcHPx / 2;
    const outW = Math.min(Math.round(srcWPx), MAX_OUTPUT_WIDTH);
    const outH = Math.round(outW / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, srcX, srcY, srcWPx, srcHPx, 0, 0, outW, outH);
    onConfirm(canvas.toDataURL('image/jpeg', 0.9), aspect);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">裁剪头像</h3>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200" title="取消">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAspectMode(opt.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                aspectMode === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-4">
          <div
            className="relative bg-gray-900 overflow-hidden rounded select-none cursor-move"
            style={{ width: CW, height: CH }}
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imgRef}
              src={src}
              alt="待裁剪"
              onLoad={handleImgLoad}
              draggable={false}
              style={{
                position: 'absolute',
                left: `${(CW - DW) / 2 + offset.x}px`,
                top: `${(CH - DH) / 2 + offset.y}px`,
                width: `${DW}px`,
                height: `${DH}px`,
                maxWidth: 'none',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            {/* 中心十字参考线 */}
            <div className="absolute inset-0 pointer-events-none border border-white/20" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gray-500 dark:text-slate-400 w-10">缩放</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-gray-500 dark:text-slate-400 w-10 text-right">{zoom.toFixed(2)}x</span>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
          拖拽图片调整位置，滑块缩放。重新上传可调整裁剪范围。
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!imgSize.w}
            className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
