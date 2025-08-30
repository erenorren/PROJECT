const video = document.getElementById("camera");
const captureBtn = document.getElementById("capture");
const mirrorCheckbox = document.getElementById("mirror");
const preview = document.getElementById("preview");
const ctx = preview.getContext("2d");

const filter = localStorage.getItem("selectedFilter");
const template = localStorage.getItem("selectedTemplate");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => alert("Kamera tidak bisa diakses: " + err));

captureBtn.addEventListener("click", () => {
  preview.width = video.videoWidth;
  preview.height = video.videoHeight;

  if (mirrorCheckbox.checked) {
    ctx.translate(preview.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.filter = filter;
  ctx.drawImage(video, 0, 0, preview.width, preview.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // simpan hasil ke localStorage
  let photos = JSON.parse(localStorage.getItem("photos")) || [];
  photos.push(preview.toDataURL("image/png"));
  localStorage.setItem("photos", JSON.stringify(photos));
});

function lanjutFrame() {
  window.location.href = "frame.html";
}