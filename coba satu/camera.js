// camera.js

// --- 1. Deklarasi Variabel & Elemen
// Variabel untuk elemen HTML
const video = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');
const mirrorBtn = document.getElementById('mirrorBtn');
const nextBtn = document.getElementById('nextBtn');
const retakeBtn = document.getElementById('retakeBtn');
const slotsWrap = document.getElementById('slots');
const filterButtons = document.querySelectorAll('.filter-controls button');
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Variabel untuk state (status) aplikasi
const layoutKey = localStorage.getItem('layoutKey') || '2-h';
const slotCount = parseInt(localStorage.getItem('slotCount') || '2', 10);
let isMirror = true;
let photos = JSON.parse(localStorage.getItem('photos') || '[]'); // dataURL per slot
let selectedSlot = null; // index slot untuk retake
let currentFilter = 'none';

// Variabel untuk fitur video
let mediaRecorder;
let recordedChunks = [];

// --- 2. Fungsionalitas Layout & Slots
// Kode fungsi applySlotsGrid dan renderSlots yang sudah ada di sini.
// ... (Salin kode kamu di bagian ini)
function applySlotsGrid(layout) {
    if (layout === '2-h') {
        slotsWrap.style.gridTemplateColumns = 'repeat(2, 240px)';
    } else if (layout === '2-v') {
        slotsWrap.style.gridTemplateColumns = '240px';
    } else if (layout === '3-grid') {
        slotsWrap.style.gridTemplateColumns = 'repeat(3, 240px)';
    } else if (layout === '4-grid') {
        slotsWrap.style.gridTemplateColumns = 'repeat(2, 240px)';
    }
}
applySlotsGrid(layoutKey);

function renderSlots() {
    slotsWrap.innerHTML = '';
    for (let i = 0; i < slotCount; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot' + (photos[i] ? ' filled' : '');
        slot.dataset.index = String(i);
        slot.textContent = photos[i] ? '' : `Slot ${i + 1}`;

        if (photos[i]) {
            const img = new Image();
            img.src = photos[i];
            img.className = 'preview';
            slot.appendChild(img);
            if (currentFilter !== 'none') {
                slot.classList.add(currentFilter);
            }
        }

        slot.addEventListener('click', () => {
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedSlot = i;
            retakeBtn.style.display = 'inline-block';
        });
        slotsWrap.appendChild(slot);
    }
    updateNextVisibility();
}

function updateNextVisibility() {
    const filled = photos.filter(Boolean).length;
    nextBtn.style.display = filled === slotCount ? 'inline-block' : 'none';
}
renderSlots();


// --- 3. Akses Kamera & Fungsionalitas Video
// Kode ini HARUS dieksekusi setelah halaman selesai dimuat.
// Tambahkan event listener untuk memastikan DOM sudah siap.
window.addEventListener('load', () => {
    // Akses kamera, ini yang membuat kamera hidup
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
    button.addEventListener('click', () => {
        video.classList.remove('grayscale', 'sepia', 'invert');
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

// Perekaman Video
recordBtn.addEventListener('click', () => {
    captureBtn.style.display = 'none';
    recordBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    
    // Pastikan video stream sudah tersedia
    if (!video.srcObject) {
        alert('Kamera belum siap, mohon tunggu sebentar.');
        return;
    }

    mediaRecorder = new MediaRecorder(video.srcObject);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.onstop = () => {
        const superBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoURL = window.URL.createObjectURL(superBlob);
        downloadBtn.href = videoURL;
        downloadBtn.download = 'photobooth-video.webm';
        downloadBtn.style.display = 'inline-block';
        recordedChunks = [];
    };
    mediaRecorder.start();
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    captureBtn.style.display = 'inline-block';
    recordBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
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