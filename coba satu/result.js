const canvas = document.getElementById('finalCanvas');
const ctx = canvas.getContext('2d');

const photos = JSON.parse(localStorage.getItem('photos') || '[]');
const layoutKey = localStorage.getItem('layoutKey') || '2-h';
const framePath = localStorage.getItem('selectedFrame') || null;

const CANVAS_W = 1200;
const CANVAS_H = 1600;
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

function getPositions(layout) {
  if (layout === '2-h') {
    return [
      { x:   50, y: 100, w: 540, h: 1400 },
      { x:  610, y: 100, w: 540, h: 1400 },
    ];
  } else if (layout === '2-v') {
    return [
      { x: 100, y:  60, w: 1000, h: 730 },
      { x: 100, y:  810, w: 1000, h: 730 },
    ];
  } else if (layout === '3-grid') {
    return [
      { x:  50, y: 100, w: 360, h: 1400 },
      { x: 420, y: 100, w: 360, h: 1400 },
      { x: 790, y: 100, w: 360, h: 1400 },
    ];
  } else {
    return [
      { x: 100, y: 100, w: 480, h: 660 },
      { x: 620, y: 100, w: 480, h: 660 },
      { x: 100, y: 840, w: 480, h: 660 },
      { x: 620, y: 840, w: 480, h: 660 },
    ];
  }
}

function drawCollage(callback) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const rects = getPositions(layoutKey);
  let loaded = 0;

  photos.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      const r = rects[i];
      const ratio = Math.max(r.w / img.width, r.h / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      const dx = r.x + (r.w - dw) / 2;
      const dy = r.y + (r.h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      loaded++;
      if (loaded === photos.length) callback();
    };
    img.src = src;
  });
}

function overlayFrameAndEnableDownload() {
  if (!framePath) {
    enableDownload();
    return;
  }
  const frameImg = new Image();
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, CANVAS_W, CANVAS_H);
    enableDownload();
  };
  frameImg.src = framePath;
}

function enableDownload() {
  const a = document.getElementById('downloadBtn');
  a.href = canvas.toDataURL('image/png');
}

drawCollage(overlayFrameAndEnableDownload);
