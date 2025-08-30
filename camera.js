const video = document.getElementById("camera");
const captureBtn = document.getElementById("capture");
const mirrorCheckbox = document.getElementById("mirror");
const filterSelect = document.getElementById("filter");
const collageCanvas = document.getElementById("collage");
const ctx = collageCanvas.getContext("2d");

// ambil jumlah slot template dari localStorage
const totalPhotos = parseInt(localStorage.getItem("templateCount")) || 2;
let takenPhotos = 0;
let photoSlots = [];

// aktifkan kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Kamera gagal diakses: " + err);
  });

// update style (mirror & filter)
function updateStyle() {
  video.style.transform = mirrorCheckbox.checked ? "scaleX(-1)" : "scaleX(1)";
  video.style.filter = filterSelect.value;
}
mirrorCheckbox.addEventListener("change", updateStyle);
filterSelect.addEventListener("change", updateStyle);

// ambil foto
captureBtn.addEventListener("click", () => {
  let tempCanvas = document.createElement("canvas");
  let tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;

  if (mirrorCheckbox.checked) {
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
  }

  tempCtx.filter = filterSelect.value;
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

  photoSlots.push(tempCanvas);

  takenPhotos++;
  if (takenPhotos >= totalPhotos) {
    // simpan hasil foto ke localStorage
    let photosData = photoSlots.map(c => c.toDataURL("image/png"));
    localStorage.setItem("photosData", JSON.stringify(photosData));
    // pindah ke halaman frame & download
    window.location.href = "result.html";
  }
});
