// ===============================
// CHECK USER LOGIN
// ===============================
async function checkLogin() {
    try {
        const res = await fetch("../backend/api/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=check"
        });
        const data = await res.json();

        console.log('Dashboard: ', data.message)

        if (data.status !== "success") {
            alert('User not Logged In, redirecting...');
            window.location.href = "index.html";
        }
    } catch (err) {
        console.error("Error connecting to server", err);
        window.location.href = "index.html";
    }
}
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
const cancelBtn = document.getElementById('cancelBtn');

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
// REGEX FOR {{placeholders}}
// ------------------------------
const PLACEHOLDER_REGEX = /{{\s*([^{}]+?)\s*}}/g;

// ------------------------------
// TEMPLATE ID (from PHP session)
// ------------------------------
let templateId = null;

// ------------------------------
// LOAD EXISTING TEMPLATE FROM BACKEND
// ------------------------------
async function loadTemplateFromServer() {
    try {
        const res = await fetch("../backend/api/templates.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=id_selected"
        });

        const data = await res.json();

        if (data.status === "success") {
            templateId = data.data.t_id;

            // Fix undefined tags & description
            data.data.tags = data.data.tags || data.data.tag || "";
            data.data.desc = data.data.desc || "";

            loadExistingTemplate(data.data);
        } else {
            alert("No template selected or session expired. Redirecting to dashboard.");
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        console.error(err);
        alert("Server error while fetching template.");
        window.location.href = "dashboard.html";
    }
}

// ------------------------------
// LOAD TEMPLATE INTO FORM
// ------------------------------
function loadExistingTemplate(data) {
    nameInput.value = data.tname || "";
    htmlInput.value = data.html_code || "";
    descInput.value = data.desc || "";
    tagsInput.value = data.tags || "";

    orientationInputs.forEach(o => {
        o.checked = o.value === data.orientation;
    });

    opacityInput.value = data.opacity || 35;
    opacityValue.textContent = opacityInput.value + "%";

    refreshPlaceholders();
    applyOrientation();
    updateIframeContent();
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
    const html_code = htmlInput.value.trim() || "<p>Start typing your HTML template.</p>";
    const bgFile = bgInput.files[0];
    const opacity = (parseInt(opacityInput.value, 10) || 35) / 100;

    const temp_details = document.getElementById("temp_data");
    if (temp_details) {
        temp_details.style.width = "100%";
        temp_details.style.textAlign = "center";
        temp_details.innerHTML = `
          <h2 style="margin-top: 0;">${t_name}</h2>
          <p>${orientation.charAt(0).toUpperCase() + orientation.slice(1)} | ${tags}</p>
        `;
    }

    const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
    doc.body.innerHTML = "";
    doc.body.style.margin = "0";
    doc.body.style.height = "100%";
    doc.body.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `${html_code}`;

    if (bgFile) {
        const reader = new FileReader();
        reader.onload = e => {
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
        doc.body.appendChild(container);
    }
}

// ------------------------------
// ORIENTATION FUNCTIONS
// ------------------------------
function getOrientation() {
    const checked = document.querySelector('input[name="orientation"]:checked');
    return checked ? checked.value : "";
}

function applyOrientation() {
    const orientation = getOrientation();
    previewCanvas.style.aspectRatio = orientation === "landscape" ? "4 / 3" : "3 / 4";
    updateIframeContent();
}

// ------------------------------
// EVENT LISTENERS
// ------------------------------
document.getElementById("backBtn")?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

nameInput.addEventListener("input", updateIframeContent);
htmlInput.addEventListener("input", () => { refreshPlaceholders(); updateIframeContent(); });
orientationInputs.forEach(r => r.addEventListener("change", applyOrientation));
tagsInput.addEventListener("input", updateIframeContent);
opacityInput.addEventListener("input", () => {
    opacityValue.textContent = opacityInput.value + "%";
    updateIframeContent();
});
bgInput.addEventListener("change", updateIframeContent);

cancelBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// ------------------------------
// FORM SUBMIT (UPDATE TEMPLATE)
// ------------------------------
form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!templateId) {
        alert("Template ID missing. Please select a template from the dashboard first.");
        window.location.href = "dashboard.html";
        return;
    }

    const fd = new FormData();
    fd.append("action", "edit");      // Must match template.php
    fd.append("id", templateId);      // Template ID from session
    fd.append("t_name", nameInput.value.trim());
    fd.append("html_code", htmlInput.value.trim());
    fd.append("orientation", getOrientation());
    fd.append("des", descInput.value.trim());
    fd.append("tags", tagsInput.value.trim());
    fd.append("opacity", opacityInput.value);

    if (bgInput.files[0]) fd.append("bg_img", bgInput.files[0]);

    try {
        const res = await fetch("../backend/api/templates.php", { method: "POST", body: fd });
        const data = await res.json();

        if (data.status === "success") {
            submitStatus.textContent = "Template updated successfully!";
            setTimeout(() => {
                // Reset session template ID
                fetch("../backend/api/templates.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: "action=unuse"
                });
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            submitStatus.textContent = data.message || "Failed to update template.";
        }
    } catch (err) {
        console.error(err);
        alert("Server error while updating template.");
    }
});

// ------------------------------
// INITIAL LOAD
// ------------------------------
loadTemplateFromServer();
