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
let previewIframe = document.createElement('iframe');
previewIframe.style.width = '100%';
previewIframe.style.height = '100%';
previewIframe.style.border = '0';
previewCanvas.appendChild(previewIframe);

// Error elements
const errName = document.getElementById('err_name');
const errHtml = document.getElementById('err_html');
const errOrientation = document.getElementById('err_orientation');
const errBg = document.getElementById('err_bg');
const errDesc = document.getElementById('err_description');
const errTags = document.getElementById('err_tags');

// Regex for {{placeholder_pattern}}
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

function getOrientation() {
  const checked = document.querySelector('input[name="orientation"]:checked');
  return checked ? checked.value : '';
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

function updateIframeContent() {
  // const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;

  const t_name = nameInput.value.trim() || 'Untitled Template';
  const orientation = getOrientation() || 'portrait';
  const tags = tagsInput.value.trim() || 'No tags';
  const html_code = htmlInput.value.trim() || '<p>Start typing your HTML template to see a live preview.</p>';
  const bgFile = bgInput.files[0];
  const opacity = (parseInt(opacityInput.value, 10) || 35) / 100;


  // Show Template details above the Certificate Template
  const temp_details = document.getElementById('temp_data');
  temp_details.style.width = '100%';
  // temp_details.style.padding = '0.5rem';
  temp_details.style.textAlign = 'center';
  temp_details.innerHTML = `
    <h2 style="margin-top: 0;">${t_name}</h2>
    <p>${orientation.charAt(0).toUpperCase() + orientation.slice(1)} | ${tags}</p>
    `;

  // Build HTML for iframe

  // previewIframe.srcdoc = html_code;
  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  
  let bgStyle = '';
  if (bgFile) {
    const reader = new FileReader();
    reader.onload = e => {
      // bgStyle = `background-image: url(${e.target.result}); background-size: cover; background-position: center; opacity: ${opacity};`;
      // doc.body.innerHTML = `
      //   <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; ${bgStyle}"`
      
      // reset the iframe
      doc.body.innerHTML = ``;

      //  for html_code setup
      const container = document.createElement('div');
      // Ensure body can contain positioned layers
      container.style.position = 'relative';
      container.style.zIndex = '100';  // content above background
      container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div>${html_code}</div>
        </div>
      `;

      // Create background img
      const bg_img = doc.createElement('img');
      bg_img.src = e.target.result;
      bg_img.style.position = 'absolute';
      bg_img.style.top = 0;
      bg_img.style.left = 0;
      bg_img.style.width = '100%';
      bg_img.style.height = '100%';
      bg_img.style.objectFit = 'cover';
      bg_img.style.filter = `opacity(${opacity})`;
      bg_img.style.zIndex = '0';
      bg_img.style.pointerEvents = 'none';

      // Append background behind content
      doc.body.appendChild(bg_img);   
      doc.body.appendChild(container);
    };
    reader.readAsDataURL(bgFile);
  } else {
    doc.body.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        
        <div>${html_code}</div>
      </div>
    `;


  }

  doc.body.style.margin = '0';
  doc.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  doc.body.style.height = '100%';
}

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
opacityInput.addEventListener('input', updateIframeContent);

opacityInput.addEventListener("input", () => {
  opacityValue.textContent = opacityInput.value + "%";
});
// ----------------------------
// Back button event listener
// ----------------------------
document.querySelector('.icon-btn[aria-label="Back"]').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});


bgInput.addEventListener('change', updateIframeContent);

// Reset
resetBtn.addEventListener('click', () => {
  form.reset();
  opacityInput.value = 35;
  placeholdersList.textContent = 'No placeholders found yet.';
  updateIframeContent();
});

// Initial render
applyOrientation();
updateIframeContent();
