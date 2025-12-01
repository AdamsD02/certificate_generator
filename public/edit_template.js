// ------------------------------
// FORM ELEMENTS
// ------------------------------
const form = document.getElementById("templateForm");
const nameInput = document.getElementById("t_name");
const htmlInput = document.getElementById("html_code");
const orientationInputs = document.querySelectorAll('input[name="orientation"]');
const bgInput = document.getElementById("bg_img");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const descInput = document.getElementById("description");
const tagsInput = document.getElementById("tags");
const placeholdersList = document.getElementById("placeholdersList");
const submitStatus = document.getElementById("submitStatus");

// ------------------------------
// PREVIEW ELEMENTS
// ------------------------------
const previewCanvas = document.getElementById("previewCanvas");
let previewIframe = document.createElement("iframe");
previewIframe.style.width = "100%";
previewIframe.style.height = "100%";
previewIframe.style.border = "0";
previewCanvas.appendChild(previewIframe);

// ------------------------------
// ERROR FIELDS
// ------------------------------
const errName = document.getElementById("err_name");
const errHtml = document.getElementById("err_html");
const errOrientation = document.getElementById("err_orientation");
const errBg = document.getElementById("err_bg");
const errDesc = document.getElementById("err_description");
const errTags = document.getElementById("err_tags");

// ------------------------------
// REGEX FOR {{placeholders}}
// ------------------------------
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// ------------------------------
// LOAD EXISTING TEMPLATE DATA
// (You will replace this with DB data later)
// ------------------------------
function loadExistingTemplate(data) {
  nameInput.value = data.t_name || "";
  htmlInput.value = data.html_code || "";
  descInput.value = data.description || "";
  tagsInput.value = data.tags || "";

  // Orientation
  orientationInputs.forEach(o => {
    o.checked = o.value === data.orientation;
  });

  // Opacity
  opacityInput.value = data.opacity || 35;
  opacityValue.textContent = opacityInput.value + "%";

  refreshPlaceholders();
  applyOrientation();
}

// ------------------------------
// PLACEHOLDER DETECTION
// ------------------------------
function refreshPlaceholders() {
  const text = htmlInput.value;
  const matches = [...text.matchAll(PLACEHOLDER_REGEX)];

  if (!matches.length) {
    placeholdersList.textContent = "No placeholders found.";
    placeholdersList.className = "status-ok";
    return;
  }

  placeholdersList.innerHTML = "";
  matches.forEach(m => {
    const chip = document.createElement("span");
    chip.className = "placeholder-chip";
    chip.textContent = "{{" + m[1].trim() + "}}";
    placeholdersList.appendChild(chip);
  });
}

// ------------------------------
// UPDATE IFRAME LIVE PREVIEW
// ------------------------------
function updateIframeContent() {
  const t_name = nameInput.value.trim() || "Untitled Template";
  const orientation = getOrientation() || "portrait";
  const tags = tagsInput.value.trim() || "No tags";
  const html_code =
    htmlInput.value.trim() ||
    "<p>Start typing your HTML template to see a live preview.</p>";
  const bgFile = bgInput.files[0];
  const opacity = (parseInt(opacityInput.value, 10) || 35) / 100;

  // Show template details
  const temp_details = document.getElementById("temp_data");
  temp_details.style.width = "100%";
  temp_details.style.textAlign = "center";
  temp_details.innerHTML = `
    <h2 style="margin-top: 0;">${t_name}</h2>
    <p>${orientation.charAt(0).toUpperCase() + orientation.slice(1)} | ${tags}</p>
  `;

  // Write into iframe
  const doc =
    previewIframe.contentDocument || previewIframe.contentWindow.document;

  if (bgFile) {
    const reader = new FileReader();
    reader.onload = e => {
      doc.body.innerHTML = "";

      // Content container
      const container = document.createElement("div");
      container.style.position = "relative";
      container.style.zIndex = "100";
      container.innerHTML = `
        <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">
          <div>${html_code}</div>
        </div>
      `;

      // Background image
      const bg_img = doc.createElement("img");
      bg_img.src = e.target.result;
      bg_img.style.position = "absolute";
      bg_img.style.top = 0;
      bg_img.style.left = 0;
      bg_img.style.width = "100%";
      bg_img.style.height = "100%";
      bg_img.style.objectFit = "cover";
      bg_img.style.filter = `opacity(${opacity})`;
      bg_img.style.zIndex = "0";
      bg_img.style.pointerEvents = "none";

      doc.body.appendChild(bg_img);
      doc.body.appendChild(container);
    };
    reader.readAsDataURL(bgFile);
  } else {
    doc.body.innerHTML = `
      <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">
        <div>${html_code}</div>
      </div>
    `;
  }

  doc.body.style.margin = "0";
  doc.body.style.height = "100%";
  doc.body.style.fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
}

// ------------------------------
// ORIENTATION SWITCH
// ------------------------------
function getOrientation() {
  const checked = document.querySelector(
    'input[name="orientation"]:checked'
  );
  return checked ? checked.value : "";
}

function applyOrientation() {
  const orientation = getOrientation();
  previewCanvas.style.aspectRatio =
    orientation === "landscape" ? "4 / 3" : "3 / 4";
  updateIframeContent();
}

// ------------------------------
// EVENT LISTENERS
// ------------------------------
nameInput.addEventListener("input", updateIframeContent);
htmlInput.addEventListener("input", () => {
  refreshPlaceholders();
  updateIframeContent();
});
orientationInputs.forEach(r => r.addEventListener("change", applyOrientation));
tagsInput.addEventListener("input", updateIframeContent);
opacityInput.addEventListener("input", updateIframeContent);
bgInput.addEventListener("change", updateIframeContent);

// ------------------------------
// NO RESET BUTTON IN EDIT PAGE
// ------------------------------

// ------------------------------
// INITIAL LOAD
// ------------------------------
applyOrientation();
updateIframeContent();

// Example of loading data (replace with your backend data)
loadExistingTemplate({
  t_name: "My Old Template",
  html_code: "<h1>{{name}}</h1><p>{{course}}</p>",
  orientation: "landscape",
  opacity: 45,
  description: "Old template description",
  tags: "certificate,old"
});
