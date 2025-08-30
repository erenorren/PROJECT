// Simpan pilihan layout & jumlah slot ke localStorage → lanjut ke kamera
function pilihTemplate(layoutKey) {
  const slotCountMap = { '2-h': 2, '2-v': 2, '3-grid': 3, '4-grid': 4 };
  localStorage.setItem('layoutKey', layoutKey);
  localStorage.setItem('slotCount', String(slotCountMap[layoutKey] || 2));
  // Reset data sesi lama
  localStorage.removeItem('photos');
  localStorage.removeItem('selectedFrame');
  window.location.href = 'camera.html';
}
