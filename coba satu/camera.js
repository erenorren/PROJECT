// camera.js

// --- 1. Deklarasi Variabel & Elemen
// ... (kode deklarasi Anda)
const video = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');
const mirrorBtn = document.getElementById('mirrorBtn');
const nextBtn = document.getElementById('nextBtn');
const retakeBtn = document.getElementById('retakeBtn');
const slotsWrap = document.getElementById('slots');
const filterButtons = document.querySelectorAll('.filter-controls button');

// ... (kode state Anda)
let isMirror = true;
let photos = JSON.parse(localStorage.getItem('photos') || '[]');
let selectedSlot = null;
let currentFilter = 'none';

// --- 2. Fungsionalitas Layout & Slots
// ... (kode fungsi applySlotsGrid, renderSlots, updateNextVisibility Anda)
applySlotsGrid(layoutKey);
renderSlots();

// --- 3. Akses Kamera & Fungsionalitas Utama
window.addEventListener('load', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            alert('Kamera tidak bisa diakses: ' + err);
            console.error(err);
        });
});

// --- 4. Event Listener untuk Kontrol
// Filter
filterButtons.forEach(button => {
    // Tambahkan event listener di sini
    button.addEventListener('click', () => {
        // Hapus SEMUA kelas filter yang mungkin ada
        video.classList.remove('grayscale', 'sepia', 'invert', 'low-res'); 

        const newFilter = button.dataset.filter;
        if (newFilter !== 'none') {
            video.classList.add(newFilter);
        }
        currentFilter = newFilter;
    });
});


// Mirror
function setMirrorUI() {
    video.style.transform = isMirror ? 'scaleX(-1)' : 'scaleX(1)';
    mirrorBtn.textContent = `Mirror: ${isMirror ? 'ON' : 'OFF'}`;
    mirrorBtn.classList.toggle('off', !isMirror);
}
setMirrorUI();

mirrorBtn.addEventListener('click', () => {
    isMirror = !isMirror;
    setMirrorUI();
});

// Foto
function captureFrameFromVideo() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (isMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

captureBtn.addEventListener('click', () => {
    if (selectedSlot !== null) {
        photos[selectedSlot] = captureFrameFromVideo();
        selectedSlot = null;
        retakeBtn.style.display = 'none';
    } else {
        const idx = photos.findIndex(v => !v);
        const targetIndex = idx === -1 ? photos.length : idx;
        if (targetIndex >= slotCount) {
            alert('Semua slot sudah terisi. Pilih slot untuk retake, atau lanjut.');
            return;
        }
        photos[targetIndex] = captureFrameFromVideo();
    }
    localStorage.setItem('photos', JSON.stringify(photos));
    renderSlots();
});

// Tombol lain
retakeBtn.addEventListener('click', () => {
    if (selectedSlot === null) {
        alert('Klik slot yang mau diulang dulu ya');
    } else {
        alert('Arahkan kamera & klik "Ambil Foto" untuk mengganti slot terpilih.');
    }
});

nextBtn.addEventListener('click', () => {
    const filled = photos.filter(Boolean).length;
    if (filled !== slotCount) {
        alert('Isi semua slot dulu ya.');
        return;
    }
    window.location.href = 'frame.html';
});