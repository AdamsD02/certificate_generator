// Form elements
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

// Preview elements
let previewIframe = document.getElementById('previewFrame');

// Regex for placeholders
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// Check login on page load
document.addEventListener('DOMContentLoaded', () => {
  fetch("../backend/api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=check"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "success") {
        alert("User not logged in.");
        window.location.href = "./index.html";
      }
    })
    .catch(() => {
      alert("Error connecting to server");
      window.location.href = "./index.html";
    });
});

// Helper: Get Orientation
function getOrientation() {
  const checked = document.querySelector('input[name="orientation"]:checked');
  return checked ? checked.value : '';
}

// Detect Placeholder Chips
function refreshPlaceholders() {
  const matches = [...htmlInput.value.matchAll(PLACEHOLDER_REGEX)];

  if (!matches.length) {
    placeholdersList.textContent = "No placeholders found.";
    return;
  }

  placeholdersList.innerHTML = "";
  matches.forEach(m => {
    const chip = document.createElement('span');
    chip.className = 'placeholder-chip';
    chip.textContent = `{{${m[1].trim()}}}`;
    placeholdersList.appendChild(chip);
  });
}

// Update Preview
function updateIframeContent() {
  const doc = previewIframe.contentDocument;
  const html_code = htmlInput.value || "<p>Start typing HTML...</p>";
  const bgFile = bgInput.files[0];
  const opacity = (parseInt(opacityInput.value) || 35) / 100;

  doc.body.innerHTML = "";
  const wrap = document.createElement('div');
  wrap.innerHTML = html_code;
  wrap.style.zIndex = 2;
  wrap.style.position = 'relative';

  if (bgFile) {
    const img = doc.createElement('img');
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.style.position = 'absolute';
      img.style.top = 0;
      img.style.left = 0;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.opacity = opacity;
      img.style.zIndex = 1;
      doc.body.appendChild(img);
      doc.body.appendChild(wrap);
    };
    reader.readAsDataURL(bgFile);
  } else {
    doc.body.appendChild(wrap);
  }
  doc.body.style.margin = 0;
}

function applyOrientation() {
  const previewCanvas = document.getElementById('previewCanvas');
  previewCanvas.style.aspectRatio = (getOrientation() === 'landscape') ? "4/3" : "3/4";
  updateIframeContent();
}

// Validation
function validateForm() {
  if (!nameInput.value.trim()) return alert("Template name is required.");
  if (!htmlInput.value.trim()) return alert("HTML is required.");
  if (!getOrientation()) return alert("Select orientation.");
  if (descInput.value.length > 200) return alert("Description < 200 chars.");
  return true;
}

// Event Listeners
htmlInput.addEventListener("input", () => {
  refreshPlaceholders();
  updateIframeContent();
});
nameInput.addEventListener("input", updateIframeContent);
tagsInput.addEventListener("input", updateIframeContent);
opacityInput.addEventListener("input", () => {
  opacityValue.textContent = opacityInput.value + "%";
  updateIframeContent();
});
orientationInputs.forEach(r => r.addEventListener("change", applyOrientation));
bgInput.addEventListener("change", updateIframeContent);
resetBtn.addEventListener("click", () => {
  form.reset();
  refreshPlaceholders();
  updateIframeContent();
});
cancelBtn.addEventListener("click", () => window.location.href = "dashboard.html");

// Handle Submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const formData = new FormData(form);
  formData.append("action", "create");

  fetch("./../backend/api/templates.php", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.status === "success") window.location.href = "dashboard.html";
    })
    .catch(err => alert("Server Error: " + err.message));
});
