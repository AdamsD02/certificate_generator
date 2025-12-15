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
iframeElement.style.width="100%";
iframeElement.style.height="100%";
iframeElement.style.boxShadow = '0 2px 5px #555';
certWrapper.appendChild(iframeElement);

// Dynamic Placeholder Block
let placeholderCount = 0;

// Add placeholder input dynamically
function addPlaceholderInput(initialName='') {
    placeholderCount++;
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const label = document.createElement('label');
    label.textContent = 'Placeholder ' + placeholderCount;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = initialName;
    input.placeholder = 'Type placeholder text to replace';
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

    placeholdersSet.forEach(name => {
        addPlaceholderInput(name);
    });
}

// Update iframe content dynamically
function updateIframeContent() {
    let tempHtml = html_code;

    const placeholders = placeholderContainer.querySelectorAll('input');
    placeholders.forEach(input => {
        const key = input.id || input.value.replace(/\s/g,'_');
        const val = input.value || key;
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        tempHtml = tempHtml.replace(regex, val);
    });

    iframeElement.srcdoc = tempHtml;

    iframeElement.onload = () => {
        const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        const contentWidth = iframeDoc.body.scrollWidth;
        const wrapperWidth = certWrapper.offsetWidth;
        const scale = wrapperWidth / contentWidth;
        iframeDoc.body.style.transform = `scale(${scale})`;
        iframeDoc.body.style.transformOrigin = "top left";
        iframeDoc.body.style.width = contentWidth + "px";
        iframeDoc.body.style.margin = 0;
    };
}

// Event listeners

previewBtn.addEventListener('click', updateIframeContent);
const cancelBtn = document.getElementById('cancelBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Cancel button event
cancelBtn.addEventListener('click', () => {
    
    placeholderContainer.querySelectorAll('input').forEach(inp => inp.value='');
    recipientInput.value = '';
    courseInput.value = '';
    dateInput.value = '';
    purposeInput.value = '';
    updateIframeContent(); // preview refresh
});

// Logout button event
logoutBtn.addEventListener('click', () => {
    window.location.href = '/logout'; 
});


// Initial setup
templateName.value = 'Workshop Template';
loadPlaceholder();
updateIframeContent(); 
