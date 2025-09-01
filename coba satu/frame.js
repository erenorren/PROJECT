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
const currentFilter = localStorage.getItem('currentFilter') || 'none';

// --- 3. Available Frame Layouts ---
const frames = [
    { name: 'Photo Strip', key: 'strip', image: 'https://placehold.co/400x1000/cccccc/000000?text=Photo+Strip' },
    { name: 'Grid', key: 'grid', image: 'https://placehold.co/1000x1000/cccccc/000000?text=Grid' }
];

// --- 4. Core Functionality ---
// Function to draw a single image proportionally on the canvas
function drawProportionalImage(ctx, img, x, y, width, height) {
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let drawX = x;
    let drawY = y;

    if (imgAspect > canvasAspect) {
        drawHeight = width / imgAspect;
        drawY = y + (height - drawHeight) / 2;
    } else {
        drawWidth = height * imgAspect;
        drawX = x + (width - drawWidth) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Function to apply filters to an image dataURL
function applyFilterToDataURL(dataURL, filterName) {
    return new Promise(resolve => {
        if (filterName === 'none') {
            resolve(dataURL);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set the CSS filter on the temporary canvas context
            if (filterName === 'grayscale') {
                tempCtx.filter = 'grayscale(100%)';
            } else if (filterName === 'sepia') {
                tempCtx.filter = 'sepia(100%)';
            } else if (filterName === 'invert') {
                tempCtx.filter = 'invert(100%)';
            } else if (filterName === 'low-res') {
                tempCtx.filter = 'blur(0.5px) saturate(50%) brightness(80%) contrast(120%)';
            }
            
            tempCtx.drawImage(img, 0, 0);
            resolve(tempCanvas.toDataURL());
        };
        img.src = dataURL;
    });
}

// Function to draw all photos onto the canvas
async function drawPhotos() {
    // Apply filters to each photo before drawing
    const filteredPhotosPromises = photos.map(photo => applyFilterToDataURL(photo, currentFilter));
    const filteredPhotosData = await Promise.all(filteredPhotosPromises);

    const photoImages = filteredPhotosData.map(dataURL => {
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
        
        // --- Logic to draw based on layoutKey ---
        if (slotCount === 2 && layoutKey === '2-h') {
            const photoWidth = finalCanvas.width / 2;
            const photoHeight = finalCanvas.height;
            loadedImages.forEach((img, i) => {
                drawProportionalImage(ctx, img, i * photoWidth, 0, photoWidth, photoHeight);
            });
        } else if (slotCount === 2 && layoutKey === '2-v') {
            const photoWidth = finalCanvas.width;
            const photoHeight = finalCanvas.height / 2;
            loadedImages.forEach((img, i) => {
                drawProportionalImage(ctx, img, 0, i * photoHeight, photoWidth, photoHeight);
            });
        } else if (slotCount === 3) {
            const photoWidth = finalCanvas.width;
            const photoHeight = finalCanvas.height / 3;
            loadedImages.forEach((img, i) => {
                drawProportionalImage(ctx, img, 0, i * photoHeight, photoWidth, photoHeight);
            });
        } else if (slotCount === 4) {
            const photoWidth = finalCanvas.width / 2;
            const photoHeight = finalCanvas.height / 2;
            loadedImages.forEach((img, i) => {
                const x = (i % 2) * photoWidth;
                const y = Math.floor(i / 2) * photoHeight;
                drawProportionalImage(ctx, img, x, y, photoWidth, photoHeight);
            });
        }
    });
}

// Function to render frame options in the grid
function renderFrames() {
    frameGrid.innerHTML = '';
    frames.forEach(frame => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <img src="${frame.image}" alt="Bingkai ${frame.name}" data-key="${frame.key}">
            <div class="title">${frame.name}</div>
        `;
        frameGrid.appendChild(card);
    });
}

// Initial calls
drawPhotos();
renderFrames();

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
