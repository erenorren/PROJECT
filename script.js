// Ambil elemen
const video = document.getElementById("camera");
const captureBtn = document.getElementById("capture");
const mirrorCheckbox = document.getElementById("mirror");
const filterSelect = document.getElementById("filter");
const collageCanvas = document.getElementById("collage");
const ctx = collageCanvas.getContext("2d");

// Aktifkan kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Kamera tidak bisa diakses: " + err);
  });

// Update filter & mirror
function updateStyle() {
  video.style.transform = mirrorCheckbox.checked ? "scaleX(-1)" : "scaleX(1)";
  video.style.filter = filterSelect.value;
}

mirrorCheckbox.addEventListener("change", updateStyle);
filterSelect.addEventListener("change", updateStyle);

// Ambil foto
captureBtn.addEventListener("click", () => {
  collageCanvas.width = video.videoWidth;
  collageCanvas.height = video.videoHeight;

  // Kalau mirror, gambar dibalik
  if (mirrorCheckbox.checked) {
    ctx.translate(collageCanvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.filter = filterSelect.value;
  ctx.drawImage(video, 0, 0, collageCanvas.width, collageCanvas.height);

  // Reset transform biar nggak kebalik semua
  if (mirrorCheckbox.checked) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
});
