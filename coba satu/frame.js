const preview = document.getElementById('previewCanvas');
const pctx = preview.getContext('2d');
const photos = JSON.parse(localStorage.getItem('photos') || '[]');
const layoutKey = localStorage.getItem('layoutKey') || '2-h';

// Kanvas final (ukuran cukup besar, rasio 3:4)
const CANVAS_W = 1200;
const CANVAS_H = 1600;
preview.width = CANVAS_W;
preview.height = CANVAS_H;

// Posisi/ukuran tiap layout (dalam px)
function getPositions(layout) {
  if (layout === '2-h') {
    // 2 sampingan
    return [
      { x:   50, y: 100, w: 540, h: 1400 },
      { x:  610, y: 100, w: 540, h: 1400 },
    ];
  } else if (layout === '2-v') {
    // 2 atas-bawah
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
  } else { // '4-grid'
    return [
      { x: 100, y: 100, w: 480, h: 660 },
      { x: 620, y: 100, w: 480, h: 660 },
      { x: 100, y: 840, w: 480, h: 660 },
      { x: 620, y: 840, w: 480, h: 660 },
    ];
  }
}

function drawCollageNoFrame() {
  pctx.fillStyle = '#ffffff';
  pctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const rects = getPositions(layoutKey);
  let loaded = 0;

  photos.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      const r = rects[i];
      pctx.save();
      // crop & cover (simple)
      const ratio = Math.max(r.w / img.width, r.h / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      const dx = r.x + (r.w - dw) / 2;
      const dy = r.y + (r.h - dh) / 2;
      pctx.drawImage(img, dx, dy, dw, dh);
      pctx.restore();

      loaded++;
    };
    img.src = src;
  });
}

drawCollageNoFrame();

function pilihFrame(path) {
  localStorage.setItem('selectedFrame', path);
  // kasih feedback kecil
  alert('Frame dipilih. Klik "Lanjut ke Preview Final" untuk melihat hasilnya.');
}
