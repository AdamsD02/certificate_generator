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
const submitStatus = document.getElementById('submitStatus');

// Preview elements
const previewCanvas = document.getElementById('previewCanvas');
const previewFrame  = document.getElementById('previewFrame');

// Error elements
const errName = document.getElementById('err_name');
const errHtml = document.getElementById('err_html');
const errOrientation = document.getElementById('err_orientation');
const errBg = document.getElementById('err_bg');
const errDesc = document.getElementById('err_description');
const errTags = document.getElementById('err_tags');

// Regex for {{placeholder_pattern}}
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// A4 width/height ratios
const A4_PORTRAIT  = 210 / 297;   // ~0.707
const A4_LANDSCAPE = 297 / 210;   // ~1.414

function getOrientation() {
  const checked = document.querySelector('input[name="orientation"]:checked');
  return checked ? checked.value : '';
}

function refreshPreviewMetaText() {
  const orientation = getOrientation() || 'portrait';
  const tags = tagsInput.value.trim() || 'No tags';
  const label = orientation.charAt(0).toUpperCase() + orientation.slice(1);
  return label + ' · ' + tags;
}

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

// Build iframe document HTML from current state
function updateIframeContent() {
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;

  const t_name = nameInput.value.trim() || 'Untitled Template';
  const orientation = getOrientation() || 'portrait';
  const tagsMeta = refreshPreviewMetaText();
  const html_code = htmlInput.value.trim() || 'Start typing your HTML template to see a live preview.';
  const description = descInput.value.trim();
  const bgUrl = previewFrame.dataset.bgUrl || '';
  const opacity = (parseInt(opacityInput.value, 10) || 35) / 100;

}