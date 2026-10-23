export interface PhotoPipelineResult {
  dataUrl: string;
  removedRatio: number;
  width: number;
  height: number;
}

/**
 * Smart background removal:
 * estimates background color from border pixels, then flood-fills from
 * edges marking similar pixels transparent with a feathered boundary.
 */
export async function processProductPhoto(file: File): Promise<PhotoPipelineResult> {
  const img = await loadImage(file);
  const MAX = 900;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const W = Math.max(1, Math.round(img.width * scale));
  const H = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);

  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;
  const total = W * H;

  /* --- estimate bg color from border --- */
  let rSum = 0, gSum = 0, bSum = 0, cnt = 0;
  const step = 2;
  for (let x = 0; x < W; x += step) {
    for (const y of [0, H - 1, 1, H - 2]) addPx(x, y);
  }
  for (let y = 0; y < H; y += step) {
    for (const x of [0, W - 1, 1, W - 2]) addPx(x, y);
  }
  function addPx(x: number, y: number) {
    const i = (y * W + x) * 4;
    rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2];
    cnt++;
  }
  const bgR = rSum / cnt, bgG = gSum / cnt, bgB = bSum / cnt;

  /* --- color distance --- */
  const TH = 46; // tolerance
  const FEATHER = 26;
  const dist = (i: number) => {
    const dr = data[i] - bgR, dg = data[i + 1] - bgG, db2 = data[i + 2] - bgB;
    return Math.sqrt(dr * dr + dg * dg + db2 * db2);
  };

  /* --- BFS flood fill from border --- */
  const bg = new Uint8Array(total); // 2 = bg, 1 = edge-feather, 0 = fg
  const stack = new Int32Array(total);
  let sp = 0;
  const push = (x: number, y: number) => {
    const idx = y * W + x;
    if (bg[idx] === 0 && dist(idx * 4) < TH) {
      bg[idx] = 2;
      stack[sp++] = idx;
    }
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  while (sp > 0) {
    const idx = stack[--sp];
    const x = idx % W;
    const y = (idx / W) | 0;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }

  /* --- apply alpha + feather ring around fg --- */
  let minX = W, minY = H, maxX = 0, maxY = 0, removed = 0;
  for (let idx = 0; idx < total; idx++) {
    const i = idx * 4;
    if (bg[idx] === 2) {
      data[i + 3] = 0;
      removed++;
    } else {
      /* near-background similar colors → partial alpha (feather) */
      const d = dist(i);
      if (d < TH + FEATHER) {
        const a = Math.min(255, ((d - TH) / FEATHER) * 255);
        data[i + 3] = Math.min(data[i + 3], a);
      }
      if (data[i + 3] > 12) {
        const x = idx % W, y = (idx / W) | 0;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  /* fallback: if almost everything removed, treat as plain product photo */
  if (removed > total * 0.92) {
    ctx.putImageData(imageData, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, 0, 0, W, H);
    minX = 0; minY = 0; maxX = W; maxY = H;
    removed = 0;
  } else {
    ctx.putImageData(imageData, 0, 0);
  }

  /* --- auto crop with margin --- */
  const margin = Math.round(Math.max(W, H) * 0.05);
  const cx = Math.max(0, minX - margin);
  const cy = Math.max(0, minY - margin);
  const cw = Math.min(W, maxX + margin) - cx;
  const ch = Math.min(H, maxY + margin) - cy;

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d")!;
  octx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

  /* --- subtle enhancement: brighten subject --- */
  const id2 = octx.getImageData(0, 0, cw, ch);
  const d2 = id2.data;
  for (let i = 0; i < d2.length; i += 4) {
    if (d2[i + 3] > 30) {
      d2[i] = Math.min(255, d2[i] * 1.06 + 4);
      d2[i + 1] = Math.min(255, d2[i + 1] * 1.06 + 4);
      d2[i + 2] = Math.min(255, d2[i + 2] * 1.06 + 4);
    }
  }
  octx.putImageData(id2, 0, 0);

  return {
    dataUrl: out.toDataURL("image/webp", 0.9),
    removedRatio: removed / total,
    width: cw,
    height: ch,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export const fmtBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
