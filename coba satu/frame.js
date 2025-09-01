// --- 1. Variable & Element Declaration ---
const finalCanvas = document.getElementById('finalCanvas');
const ctx = finalCanvas.getContext('2d');
const frameGrid = document.querySelector('.frame-grid');
const saveBtn = document.getElementById('saveBtn');
const restartBtn = document.getElementById('restartBtn');

// --- 2. State Variables from localStorage ---
const photos = JSON.parse(localStorage.getItem('photos')) || [];
const layoutKey = localStorage.getItem('layoutKey') || '2-h';
const slotCount = parseInt(localStorage.getItem('slotCount'), 10) || 2;

// --- 3. Available Frame Layouts ---
const frames = [
    { name: 'Photo Strip', key: 'strip', path: 'path/to/strip-frame.png' }, // Contoh bingkai
    { name: 'Grid', key: 'grid', path: 'path/to/grid-frame.png' } // Contoh bingkai
];

// --- 4. Core Functionality ---
// Function to apply filters to an image
function applyFilter(image, filterName) {
    if (filterName === 'none') return image;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0);

    // Apply the filter using CSS
    tempCtx.filter = ''; // Reset filter
    if (filterName === 'grayscale') {
        tempCtx.filter = 'grayscale(100%)';
    } else if (filterName === 'sepia') {
        tempCtx.filter = 'sepia(100%)';
    } else if (filterName === 'invert') {
        tempCtx.filter = 'invert(100%)';
    } else if (filterName === 'low-res') {
        tempCtx.filter = 'blur(0.5px) saturate(50%) brightness(80%) contrast(120%)';
    }
    tempCtx.drawImage(image, 0, 0);
    
    return tempCanvas.toDataURL();
}

// Function to draw all photos onto the canvas
function drawPhotos() {
    const photoImages = photos.map(dataURL => {
        const img = new Image();
        img.src = dataURL;
        return img;
    });

    const promises = photoImages.map(img => new Promise(resolve => {
        img.onload = () => resolve(img);
    }));

    Promise.all(promises).then(loadedImages => {
        finalCanvas.width = 900;
        finalCanvas.height = 900;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        let photoWidth, photoHeight;
        let xOffset = 0;
        let yOffset = 0;

        // Apply correct layout based on slot count
        if (slotCount === 2 && layoutKey === '2-h') {
            photoWidth = finalCanvas.width / 2;
            photoHeight = finalCanvas.height;
            loadedImages.forEach((img, i) => {
                ctx.drawImage(img, i * photoWidth, 0, photoWidth, photoHeight);
            });
        } else if (slotCount === 2 && layoutKey === '2-v') {
            photoWidth = finalCanvas.width;
            photoHeight = finalCanvas.height / 2;
            loadedImages.forEach((img, i) => {
                ctx.drawImage(img, 0, i * photoHeight, photoWidth, photoHeight);
            });
        } else if (slotCount === 3) {
            // Misalnya 3 foto vertikal
            photoWidth = finalCanvas.width;
            photoHeight = finalCanvas.height / 3;
            loadedImages.forEach((img, i) => {
                ctx.drawImage(img, 0, i * photoHeight, photoWidth, photoHeight);
            });
        } else if (slotCount === 4) {
            photoWidth = finalCanvas.width / 2;
            photoHeight = finalCanvas.height / 2;
            loadedImages.forEach((img, i) => {
                const x = (i % 2) * photoWidth;
                const y = Math.floor(i / 2) * photoHeight;
                ctx.drawImage(img, x, y, photoWidth, photoHeight);
            });
        }
    });
}

// Draw the initial photos
drawPhotos();

// --- 5. Event Listeners ---
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'photobooth-final.png';
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
});

restartBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});
