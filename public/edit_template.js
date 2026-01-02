// ===============================
// EDIT TEMPLATE JS (Fixed Version)
// ===============================

// Elements
const form = document.getElementById('templateForm');
const nameInput = document.getElementById('t_name');
const htmlInput = document.getElementById('html_code');
const orientationInputs = document.querySelectorAll('input[name="orientation"]');
const bgInput = document.getElementById('bg_img');
const opacityInput = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const descInput = document.getElementById('description');
const tagsInput = document.getElementById('tags');
const placeholdersList = document.getElementById('placeholdersList');

const resetBtn = document.getElementById('resetBtn');
const cancelBtn = document.getElementById('cancelBtn');
const previewCanvas = document.getElementById("previewCanvas");
const previewIframe = document.getElementById("previewFrame");

let templateId = null; // Will store the template ID we're editing

// Regex for placeholders {{name}}
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// ------------------ Helper Functions ------------------

// Get selected orientation
function getOrientation() {
  const checked = document.querySelector('input[name="orientation"]:checked');
  return checked ? checked.value : '';
}

// Refresh detected placeholders
function refreshPlaceholders() {
  const text = htmlInput.value;
  const matches = [...text.matchAll(PLACEHOLDER_REGEX)];
  placeholdersList.innerHTML = matches.length
    ? matches.map(m => `<span class="placeholder-chip">{{${m[1].trim()}}}</span>`).join('')
    : '<span class="status-ok">No placeholders found.</span>';
}

// Update live preview
function updatePreview() {
  const htmlCode = htmlInput.value.trim();
  const doc = previewIframe.contentDocument;

  const bgFile = bgInput.files[0];
  const opacity = (opacityInput.value || 35) / 100;

  doc.body.style.margin = 0;
  doc.body.innerHTML = htmlCode || "<p>Start typing the HTML template...</p>";

  if (bgFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      doc.body.style.backgroundImage = `url(${e.target.result})`;
      doc.body.style.backgroundSize = "cover";
      doc.body.style.opacity = opacity;
    };
    reader.readAsDataURL(bgFile);
  } else {
    doc.body.style.backgroundImage = "none";
  }
}

// Apply orientation to preview
function applyOrientation() {
  previewCanvas.style.aspectRatio = getOrientation() === "landscape" ? "4 / 3" : "3 / 4";
  updatePreview();
}

// ------------------ Event Listeners ------------------
nameInput.addEventListener('input', updatePreview);
htmlInput.addEventListener('input', () => {
  refreshPlaceholders();
  updatePreview();
});
tagsInput.addEventListener('input', updatePreview);
opacityInput.addEventListener('input', () => {
  opacityValue.textContent = opacityInput.value + "%";
  updatePreview();
});
orientationInputs.forEach(r => r.addEventListener('change', applyOrientation));
bgInput.addEventListener('change', updatePreview);

resetBtn.addEventListener('click', () => {
  form.reset();
  opacityInput.value = 35;
  opacityValue.textContent = "35%";
  placeholdersList.innerHTML = "No placeholders found.";
  updatePreview();
});

cancelBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ------------------ Fetch Template Data ------------------
function loadTemplateData() {
  fetch("./../backend/api/templates.php", {
    method: "POST",
    body: new URLSearchParams({ action: "id_selected" })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "success") {
        alert("Failed to load template data: " + data.message);
        return;
      }
      console.log("Template data fetched:", data.data);
      templateId = data.data.t_id;
      nameInput.value = data.data.tname;
      htmlInput.value = data.data.html_code;
      descInput.value = data.data.desc || '';
      tagsInput.value = data.data.tags || '';
      opacityInput.value = data.data.opacity || 35;
      opacityValue.textContent = opacityInput.value + "%";

      // Set orientation radio
      orientationInputs.forEach(r => {
        r.checked = r.value === data.data.orientation;
      });

      updatePreview();
      refreshPlaceholders();
    })
    .catch(err => console.error("Error fetching template data:", err));
}

// ------------------ Form Submit ------------------
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!templateId) {
    alert("Template ID not loaded! Cannot submit.");
    return;
  }

  const tNameVal = nameInput.value.trim();
  const htmlVal = htmlInput.value.trim();
  const orientationVal = getOrientation();
  const bgFile = bgInput.files[0];
  const opacityVal = opacityInput.value;
  const descVal = descInput.value.trim();
  const tagsVal = tagsInput.value.trim();

  // Validation
  if (!tNameVal) return alert("Template name required!");
  if (!htmlVal) return alert("HTML Code required!");
  if (!orientationVal) return alert("Select template orientation!");
  if (bgFile && !["image/png", "image/jpeg", "image/webp"].includes(bgFile.type)) {
    return alert("Only PNG, JPG or WEBP allowed!");
  }

  const formData = new FormData();
  formData.append("action", "edit");
  formData.append("id", templateId);
  formData.append("t_name", tNameVal);
  formData.append("html_code", htmlVal);
  formData.append("orientation", orientationVal);
  formData.append("opacity", opacityVal);
  formData.append("des", descVal);
  formData.append("tags", tagsVal);
  if (bgFile) formData.append("bg_img", bgFile);

  console.log("Submitting form data:", Object.fromEntries(formData.entries()));

  fetch("./../backend/api/templates.php", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      console.log("Response from templates.php:", data);
      if (data.status === "success") {
        window.location.href = "dashboard.html";
      }
    })
    .catch(err => {
      alert("Server error: " + err.message);
      console.error("Server error:", err);
    });
});

// ------------------ On Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
  // Check if user logged in
  fetch("../backend/api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=check"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "success") {
        alert("Please login first.");
        setTimeout(() => window.location.href = "./index.html", 2000);
      } else {
        loadTemplateData();
      }
    })
    .catch(() => alert("Unable to verify login!"));
});
