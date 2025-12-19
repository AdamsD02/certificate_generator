// Blue-themed certificate HTML template
let html_code = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Certificate</title></head>
<body style="font-family:Arial,sans-serif;text-align:center;padding:50px;background:#f4f4f4;">
<div style="width:800px;margin:auto;padding:40px;background:white;border:5px solid #555;border-radius:10px;">
<div style="font-size:32px;font-weight:bold;margin-bottom:20px;text-transform:uppercase;">Certificate of Completion</div>
<div style="font-size:20px;margin-bottom:10px;">This is to certify that</div>
<div style="font-size:28px;font-weight:bold;color:#333;margin:20px 0;">{{student_name}}</div>
<div style="font-size:20px;margin-bottom:10px;">has successfully completed the</div>
<div style="font-size:28px;font-weight:bold;color:#333;margin:20px 0;">{{workshop_name}}</div>
<div style="font-size:20px;margin-bottom:10px;">Duration: <strong>{{duration}}</strong></div>
<div style="margin-top:40px;font-size:18px;">Awarded on <strong>{{certified_on}}</strong></div>
<div style="margin-top:40px;font-size:18px;">Certified by: <strong>{{certified_by}}</strong></div>
</div></body></html>`;

// Form elements
const recipientInput = document.getElementById('recipientName');
const courseInput = document.getElementById('courseName');
const dateInput = document.getElementById('issueDate');
const purposeInput = document.getElementById('purposeText');
const templateName = document.getElementById('templateName');
const placeholderContainer = document.getElementById('placeholderContainer');
const previewBtn = document.getElementById('previewBtn');

const certWrapper = document.getElementById('cert-wrapper');
let iframeElement = document.createElement('iframe');
iframeElement.id = 'certificate-iframe';
iframeElement.style.width = "100%";
iframeElement.style.height = "500px"; // fixed height
iframeElement.style.boxShadow = '0 2px 5px #555';
certWrapper.appendChild(iframeElement);

// Add placeholder input dynamically
function addPlaceholderInput(name = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const label = document.createElement('label');
    label.textContent = name || 'Placeholder';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = name;
    input.placeholder = 'Type placeholder text';
    input.value = ''; // default empty
    input.addEventListener('input', updateIframeContent);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    placeholderContainer.appendChild(wrapper);
}

// Load placeholders from template
function loadPlaceholder() {
    placeholderContainer.innerHTML = "";
    const regex = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;
    let match;
    const placeholdersSet = new Set();
    while ((match = regex.exec(html_code)) !== null) {
        placeholdersSet.add(match[1]);
    }

    placeholdersSet.forEach(name => addPlaceholderInput(name));
}

// Update iframe content
function updateIframeContent() {
    let tempHtml = html_code;

    // replace placeholder values
    const inputs = placeholderContainer.querySelectorAll('input');
    inputs.forEach(input => {
        const key = input.id;
        const val = input.value || '';
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        tempHtml = tempHtml.replace(regex, val);
    });

    // set iframe srcdoc
    iframeElement.srcdoc = tempHtml;

    // scale iframe content to wrapper width
    setTimeout(() => { // slight delay to allow render
        const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        iframeDoc.body.style.margin = 0;
        iframeDoc.body.style.transformOrigin = "top left";
        const contentWidth = iframeDoc.body.scrollWidth;
        const wrapperWidth = certWrapper.offsetWidth;
        const scale = wrapperWidth / contentWidth;
        iframeDoc.body.style.transform = `scale(${scale})`;
        iframeDoc.body.style.width = contentWidth + "px";
    }, 50);
}

// Event listeners
previewBtn.addEventListener('click', updateIframeContent);

// Cancel button
const cancelBtn = document.getElementById('cancelBtn');
cancelBtn.addEventListener('click', () => {
    placeholderContainer.querySelectorAll('input').forEach(inp => inp.value = '');
    recipientInput.value = '';
    courseInput.value = '';
    dateInput.value = '';
    purposeInput.value = '';
    updateIframeContent();
});

// Logout button event
const logout = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    if (!confirm("Do you really want to logout?")) return;

    fetch("../backend/api/auth.php", {  // auth.php file path
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=logout"
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            window.location.href = "index.html"; // redirect to login page
        } else {
            alert("Logout failed: " + data.message);
        }
    })
    .catch(err => {
        console.error("Logout error:", err);
        alert("Server error");
    });
});

// Initial load
templateName.value = 'Workshop Template';
loadPlaceholder();
updateIframeContent();
