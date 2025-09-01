// camera.js

// --- Deklarasi Variabel & Elemen
const video = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');
const mirrorBtn = document.getElementById('mirrorBtn');
const nextBtn = document.getElementById('nextBtn');
const retakeBtn = document.getElementById('retakeBtn');
const slotsWrap = document.getElementById('slots');
const filterButtons = document.querySelectorAll('.filter-controls button');

const layoutKey = localStorage.getItem('layoutKey') || '2-h';
const slotCount = parseInt(localStorage.getItem('slotCount') || '2', 10);

let isMirror = true;
let photos = JSON.parse(localStorage.getItem('photos') || '[]'); // dataURL per slot
let selectedSlot = null; // index slot untuk retake
let currentFilter = 'none';

// --- Fungsionalitas Layout & Slots
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
            // Tambahkan filter ke foto yang sudah diambil
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

// --- Fungsionalitas Kamera & Filter
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert('Kamera tidak bisa diakses: ' + err); });

// Mirror toggle (preview live)
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

// Mengaplikasikan filter ke video preview
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

// camera.js

// --- Tambahkan variabel baru di bagian atas
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');

let mediaRecorder;
let recordedChunks = []; // Array untuk menyimpan potongan data video

// --- Event Listeners untuk Video
recordBtn.addEventListener('click', () => {
    // Sembunyikan tombol foto, tampilkan tombol berhenti
    captureBtn.style.display = 'none';
    recordBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';

    // Buat MediaRecorder dari stream kamera
    mediaRecorder = new MediaRecorder(video.srcObject);

    // Kumpulkan potongan data video saat tersedia
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    // Saat perekaman berhenti, gabungkan dan buat video
    mediaRecorder.onstop = () => {
        const superBlob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const videoURL = window.URL.createObjectURL(superBlob);

        // Tampilkan tombol unduh dan atur link-nya
        downloadBtn.href = videoURL;
        downloadBtn.download = 'photobooth-video.webm';
        downloadBtn.style.display = 'inline-block';

        // Bersihkan data
        recordedChunks = [];
    };

    // Mulai perekaman
    mediaRecorder.start();
});

stopBtn.addEventListener('click', () => {
    // Hentikan perekaman
    mediaRecorder.stop();

    // Tampilkan tombol foto lagi
    captureBtn.style.display = 'inline-block';
    recordBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
});

// Ambil frame dari video → dataURL
function captureFrameFromVideo() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Menerapkan efek mirror ke canvas sebelum menggambar
    if (isMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

// --- Event Listener Tombol
// Capture/Retake
captureBtn.addEventListener('click', () => {
    if (selectedSlot !== null) {
        // Retake slot terpilih
        photos[selectedSlot] = captureFrameFromVideo();
        selectedSlot = null;
        retakeBtn.style.display = 'none';
    } else {
        // Isi slot berikutnya yang kosong
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

// Tombol retake (kalau user udah pilih slot)
retakeBtn.addEventListener('click', () => {
    if (selectedSlot === null) {
        alert('Klik slot yang mau diulang dulu ya');
    } else {
        alert('Arahkan kamera & klik "Ambil Foto" untuk mengganti slot terpilih.');
    }
});

// Lanjut ke pilih frame
nextBtn.addEventListener('click', () => {
    const filled = photos.filter(Boolean).length;
    if (filled !== slotCount) {
        alert('Isi semua slot dulu ya.');
        return;
    }
    window.location.href = 'frame.html';
});