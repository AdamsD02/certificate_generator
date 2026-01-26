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

// ----------------- EDIT CERTIFICATE JS -----------------
let html_code = '';
let t_id = '';
let t_name = '';
let c_id = '';
let bg_img = '';
let orientation = 'landscape';
let opacity = '100%';
let placeholders = {}; // store placeholder key-values

const recipientInput = document.getElementById('recipientName');
const courseInput = document.getElementById('courseName');
const dateInput = document.getElementById('issueDate');
const purposeInput = document.getElementById('purposeText');
const templateName = document.getElementById('t_name');
const placeholderContainer = document.getElementById('placeholderContainer');
const previewBtn = document.getElementById('previewBtn');
const certWrapper = document.getElementById('cert-wrapper');

let iframeElement = document.createElement('iframe');
iframeElement.id = 'certificate-iframe';
iframeElement.style.width = '100%';
iframeElement.style.height = '500px';
iframeElement.style.boxShadow = '0 2px 5px #555';
certWrapper.appendChild(iframeElement);

// ----------------- HELPERS -----------------
function renderPlaceholders() {
    placeholderContainer.innerHTML = '';
    if (!placeholders || Object.keys(placeholders).length === 0) {
        placeholderContainer.innerHTML = "<p>No placeholders available.</p>";
        return;
    }
    Object.entries(placeholders).forEach(([key, val]) => {
        const row = document.createElement('div');
        row.className = 'pldr-field field';
        row.innerHTML = `<label>${key}
            <input type="text" class="pldr-val" data-pldr="${key}" value="${val}" placeholder="Enter value for ${key}">
        </label>`;
        placeholderContainer.appendChild(row);
    });
}

function updateIframeContent() {
    if (!html_code) return;
    let tempHtml = html_code;

    const coreReplacements = {
        '{{student_name}}': recipientInput.value || '',
        '{{workshop_name}}': courseInput.value || '',
        '{{duration}}': purposeInput.value || '',
        '{{certified_on}}': dateInput.value || '',
        '{{certified_by}}': t_name || ''
    };

    Object.entries(coreReplacements).forEach(([key, val]) => {
        const regex = new RegExp(key, 'g');
        tempHtml = tempHtml.replace(regex, val);
    });

    document.querySelectorAll('.pldr-val').forEach(input => {
        const key = input.dataset.pldr;
        const val = input.value || '';
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        tempHtml = tempHtml.replace(regex, val);
    });

    iframeElement.srcdoc = tempHtml;

    setTimeout(() => {
        const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        iframeDoc.body.style.margin = 0;
        iframeDoc.body.style.transformOrigin = 'top left';
        const contentWidth = iframeDoc.body.scrollWidth;
        const wrapperWidth = certWrapper.offsetWidth;
        const scale = wrapperWidth / contentWidth;
        iframeDoc.body.style.transform = `scale(${scale})`;
        iframeDoc.body.style.width = contentWidth + 'px';
    }, 50);
}

// ----------------- LOAD CERTIFICATE DATA -----------------
window.addEventListener('load', () => {
    fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=check"
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== "success") {
            alert("User not logged in.");
            return window.location.href = "./index.html";
        }

        return fetch("../backend/api/certificate.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=id_selected"
        });
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== "success") {
            alert(data.message || "Certificate not found.");
            return window.location.href = "./dashboard.html";
        }

        const cert = data.data;

        // Template fields
        t_id = cert.t_id;
        t_name = cert.t_name;
        templateName.value = t_name; // ✅ FIXED LINE
        html_code = cert.html_code;
        bg_img = cert.bg_img;
        orientation = cert.orientation;
        opacity = cert.opacity;

        // Certificate fields
        c_id = cert.c_id;
        recipientInput.value = cert.r_name;
        courseInput.value = cert.course;
        dateInput.value = cert.issue_date;
        purposeInput.value = cert.purpose;

        // Placeholders
        placeholders = cert.pldrs || {};
        renderPlaceholders();
        updateIframeContent();
    })
    .catch(err => {
        console.error(err);
        alert("Server error");
        window.location.href = "./dashboard.html";
    });
});

// ----------------- EVENT LISTENERS -----------------
previewBtn.addEventListener('click', updateIframeContent);

document.getElementById("certUpdate").addEventListener("click", () => {
    const r_name_new = recipientInput.value.trim();
    const course_new = courseInput.value.trim();
    const issue_date_new = dateInput.value;
    const purpose_new = purposeInput.value.trim();

    if (!r_name_new) return alert("Recipient name required.");
    if (!course_new) return alert("Course name required.");
    if (!issue_date_new) return alert("Issue date required.");

    let updatedPlaceholders = {};
    document.querySelectorAll('.pldr-val').forEach(input => {
        const key = input.dataset.pldr;
        updatedPlaceholders[key] = input.value.trim();
    });

    const formData = new FormData();
    formData.append("action", "edit");
    formData.append("id", c_id);
    formData.append("tname", t_name);
    formData.append("orientation", orientation);
    formData.append("html_code", html_code);
    formData.append("r_name", r_name_new);
    formData.append("course", course_new);
    formData.append("issue_date", issue_date_new);
    formData.append("purpose", purpose_new);

    Object.entries(updatedPlaceholders).forEach(([key, val]) => {
        formData.append(`pldrs[${key}]`, val);
    });

    fetch("../backend/api/certificate.php", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            setTimeout(() => window.location.href = "./certificate.html", 400);
        }
    })
    .catch(err => alert("Server error: " + err.message));
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    fetch("../backend/api/certificate.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=unuse"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            window.location.href = "./certificate.html";
        }
    })
    .catch(err => alert("Server error: " + err.message));
});
