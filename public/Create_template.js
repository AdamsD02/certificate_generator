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
const submitStatus = document.getElementById('submitStatus');

// Preview elements
const previewCanvas = document.getElementById('previewCanvas');
let previewIframe = document.getElementById('previewFrame');
previewIframe.style.width = '100%';
previewIframe.style.height = '100%';
previewIframe.style.border = '0';

// Error elements
const errName = document.getElementById('err_name');
const errHtml = document.getElementById('err_html');
const errOrientation = document.getElementById('err_orientation');
const errBg = document.getElementById('err_bg');
const errDesc = document.getElementById('err_description');
const errTags = document.getElementById('err_tags');

// Regex for {{placeholder_pattern}}
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// Get selected orientation
function getOrientation() {
  const checked = document.querySelector('input[name="orientation"]:checked');
  return checked ? checked.value : '';
}

// Detect and refresh placeholders
function refreshPlaceholders() {
  const text = htmlInput.value;
  const matches = [...text.matchAll(PLACEHOLDER_REGEX)];
  if (!matches.length) {
    placeholdersList.textContent = 'No placeholders found.';
    placeholdersList.className = 'status-ok';
    return;
  }
  placeholdersList.innerHTML = '';
  matches.forEach(m => {
    const chip = document.createElement('span');
    chip.className = 'placeholder-chip';
    chip.textContent = '{{' + m[1].trim() + '}}';
    placeholdersList.appendChild(chip);
  });
}

// Update iframe content
function updateIframeBody(doc, html_code, bgSrc, opacity) {
  doc.body.innerHTML = '';
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.zIndex = '100';
  container.innerHTML = `<div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"><div>${html_code}</div></div>`;

  if (bgSrc) {
    const bg_img = doc.createElement('img');
    bg_img.src = bgSrc;
    bg_img.style.position = 'absolute';
    bg_img.style.top = 0;
    bg_img.style.left = 0;
    bg_img.style.width = '100%';
    bg_img.style.height = '100%';
    bg_img.style.objectFit = 'cover';
    bg_img.style.filter = `opacity(${opacity})`;
    bg_img.style.zIndex = '0';
    bg_img.style.pointerEvents = 'none';
    doc.body.appendChild(bg_img);
  }

  doc.body.appendChild(container);
  doc.body.style.margin = '0';
  doc.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  doc.body.style.height = '100%';
}

// Update iframe preview
function updateIframeContent() {
  const t_name = nameInput.value.trim() || 'Untitled Template';
  const orientation = getOrientation() || 'portrait';
  const tags = tagsInput.value.trim() || 'No tags';
  const html_code = htmlInput.value.trim() || '<p>Start typing your HTML template to see a live preview.</p>';
  const bgFile = bgInput.files[0];
  const opacity = (parseInt(opacityInput.value, 10) || 35) / 100;

  const temp_details = document.getElementById('temp_data');
  temp_details.style.width = '100%';
  temp_details.style.textAlign = 'center';
  temp_details.innerHTML = `
    <h2 style="margin-top: 0;">${t_name}</h2>
    <p>${orientation.charAt(0).toUpperCase() + orientation.slice(1)} | ${tags}</p>
  `;

  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;

  if (bgFile) {
    const reader = new FileReader();
    reader.onload = e => {
      updateIframeBody(doc, html_code, e.target.result, opacity);
    };
    reader.readAsDataURL(bgFile);
  } else {
    updateIframeBody(doc, html_code, null, opacity);
  }
}

// Apply orientation
function applyOrientation() {
  const orientation = getOrientation();
  previewCanvas.style.aspectRatio = orientation === 'landscape' ? '4 / 3' : '3 / 4';
  updateIframeContent();
}

// Event listeners
nameInput.addEventListener('input', updateIframeContent);
htmlInput.addEventListener('input', () => {
  refreshPlaceholders();
  updateIframeContent();
});
orientationInputs.forEach(r => r.addEventListener('change', applyOrientation));
tagsInput.addEventListener('input', updateIframeContent);
opacityInput.addEventListener('input', () => {
  opacityValue.textContent = opacityInput.value + "%";
  updateIframeContent();
});
bgInput.addEventListener('change', updateIframeContent);
resetBtn.addEventListener('click', () => {
  form.reset();
  opacityInput.value = 35;
  opacityValue.textContent = "35%";
  placeholdersList.textContent = 'No placeholders found yet.';
  updateIframeContent();
});
cancelBtn.addEventListener('click', () => {
  form.reset();
  placeholdersList.textContent = 'No placeholders found yet.';
  opacityInput.value = 35;
  opacityValue.textContent = "35%";
  window.location.href = 'dashboard.html';
});

// Save template (submit)
form.addEventListener('submit', e => {
  // Initial render
  applyOrientation();
  updateIframeContent();
  refreshPlaceholders();

});

const tNameValidate = () => {
  const t_name = document.getElementById('t_name').value.trim();
  console.log('t_name:', t_name);

  // 1. Not blank
  if (t_name === '') {
    return false;
  }

  // 2. Must start with alphabet, followed by alphabets/numbers/underscore
  const validPattern = /^[A-Za-z][A-Za-z0-9_]*$/;
  if (!validPattern.test(t_name)) {
    return false;
  }

  // 3. Block HTML / JS / PHP / SQL injection-like patterns
  const forbiddenPattern = /(<[^>]*>|script|javascript:|php|sql|select|insert|update|delete|drop|--|;)/i;
  if (forbiddenPattern.test(t_name)) {
    return false;
  }

  // Passed all checks
  return true;
};

// check form submission 
const templateForm = document.getElementById('templateForm');
templateForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!tNameValidate()) {
    alert('Invalid Template name');
    return;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // check user login
  const checkForm = new FormData();
  checkForm.append('action', 'check');
  fetch("../backend/api/auth.php", {
    method: "POST",
    body: checkForm
  })
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
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

const t_nameVal = nameInput.value.trim();
const htmlVal = htmlInput.value.trim();
const orientationVal = getOrientation();
const bgFile = bgInput.files[0];
const opacityVal = opacityInput.value;
const descVal = descInput.value.trim();
const tagsVal = tagsInput.value.trim();

// Validation
if (!t_nameVal) return alert("Template name is required.");
if (!htmlVal) return alert("HTML code is required.");
if (!orientationVal) return alert("Orientation is required.");
if (bgFile && !['image/png', 'image/jpeg', 'image/webp'].includes(bgFile.type)) return alert("Only PNG, JPG or WEBP allowed.");
if (descVal.length > 200) return alert("Description must be less than 200 characters.");
if (tagsVal && !/^[a-zA-Z0-9,\s-]+$/.test(tagsVal)) return alert("Tags must be comma-separated words.");

const formData = new FormData();
formData.append('action', 'create');
formData.append('t_name', t_nameVal);
formData.append('html_code', htmlVal);
formData.append('orientation', orientationVal);
formData.append('opacity', opacityVal);
formData.append('des', descVal);
formData.append('tags', tagsVal);
if (bgFile) formData.append('bg_img', bgFile);

fetch("./../backend/api/templates.php", { method: "POST", body: formData })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      alert(data.message || "Template created successfully!");
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || "Failed to create template.");
    }
  })
  .catch(err => alert("Error connecting to server: " + err.message));
// });
// });
