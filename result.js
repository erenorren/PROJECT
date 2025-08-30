const canvas = document.getElementById("collage");
const ctx = canvas.getContext("2d");

const photos = JSON.parse(localStorage.getItem("photos")) || [];
const template = localStorage.getItem("selectedTemplate");
const frame = localStorage.getItem("selectedFrame");

canvas.width = 800;
canvas.height = 800;

function drawCollage() {
  photos.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      if (template === "2-grid") {
        ctx.drawImage(img, i * 400, 0, 400, 800);
      } else if (template === "3-grid") {
        ctx.drawImage(img, i * 266, 0, 266, 800);
      } else if (template === "4-grid") {
        ctx.drawImage(img, (i % 2) * 400, Math.floor(i / 2) * 400, 400, 400);
      }
      if (i === photos.length - 1) {
        // setelah semua foto tergambar, tambahkan frame
        const f = new Image();
        f.onload = () => ctx.drawImage(f, 0, 0, canvas.width, canvas.height);
        f.src = frame;
      }
    };
    img.src = src;
  });
}

drawCollage();

document.getElementById("download").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "photobooth.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});