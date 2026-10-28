import { CARD_SIZES, layoutCard, type CardData, type CardFormat, type DrawOp } from '../domain/card/layout';

function draw(ctx: CanvasRenderingContext2D, op: DrawOp): void {
  switch (op.kind) {
    case 'background': {
      const gradient = ctx.createLinearGradient(0, 0, op.width, op.height);
      gradient.addColorStop(0, op.colors[0]);
      gradient.addColorStop(1, op.colors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, op.width, op.height);
      break;
    }
    case 'circle':
      ctx.fillStyle = op.color;
      ctx.beginPath();
      ctx.arc(op.x, op.y, op.r, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'line':
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.width;
      ctx.beginPath();
      ctx.moveTo(op.x1, op.y1);
      ctx.lineTo(op.x2, op.y2);
      ctx.stroke();
      break;
    case 'text':
      ctx.font = op.font;
      ctx.fillStyle = op.color;
      ctx.textAlign = op.align;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(op.text, op.x, op.y);
      break;
  }
}

export async function renderCardPng(data: CardData, format: CardFormat): Promise<Blob> {
  const { width, height } = CARD_SIZES[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');
  const measure = (text: string, font: string) => {
    ctx.font = font;
    return ctx.measureText(text).width;
  };
  for (const op of layoutCard(data, format, measure)) draw(ctx, op);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png');
  });
}
