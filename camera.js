const video = document.getElementById("camera");
const captureBtn = document.getElementById("capture");
const mirrorBtn = document.getElementById("mirrorBtn");
const preview = document.getElementById("preview");
const ctx = preview.getContext("2d");

let isMirror = true; // default mirror aktif

// aktifkan kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Kamera tidak bisa diakses: " + err));

// toggle mirror saat klik tombol
mirrorBtn.addEventListener("click", () => {
  isMirror = !isMirror;
  mirrorBtn.textContent = `Mirror: ${isMirror ? "ON" : "OFF"}`;
  video.style.transform = isMirror ? "scaleX(-1)" : "scaleX(1)";
});

// capture foto
captureBtn.addEventListener("click", () => {
  preview.width = video.videoWidth;
  preview.height = video.videoHeight;

  if (isMirror) {
    ctx.translate(preview.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0, preview.width, preview.height);

  // reset transform biar ga kacau
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // simpan hasil foto
  let photos = JSON.parse(localStorage.getItem("photos")) || [];
  photos.push(preview.toDataURL("image/png"));
  localStorage.setItem("photos", JSON.stringify(photos));
});

function lanjutFrame() {
  window.location.href = "frame.html";
}
