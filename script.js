function pilihTemplate(template) {
  localStorage.setItem("selectedTemplate", template);
}

function mulaiFoto() {
  const filter = document.getElementById("filter").value;
  localStorage.setItem("selectedFilter", filter);
  window.location.href = "camera.html";
}
