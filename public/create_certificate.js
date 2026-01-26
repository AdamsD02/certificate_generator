 /* -------- CHECK LOGIN ----------- */

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

// GLOBAL STATE
let t_id = null;
let t_name = '';
let html_code = '';
let bg_img = '';
let orientation = 'landscape';
let opacity = '100%';

// Default certificate template
const default_html_code = `<!DOCTYPE html>
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

window.addEventListener("load", () => {
  // DOM ELEMENTS
  const recipientInput = document.getElementById('recipientName');
  const courseInput = document.getElementById('courseName');
  const dateInput = document.getElementById('issueDate');
  const purposeInput = document.getElementById('purposeText');
  const templateNameInput = document.getElementById('t_name');
  const placeholderContainer = document.getElementById('placeholderContainer');
  const previewBtn = document.getElementById('previewBtn');
  const resetBtn = document.getElementById('resetBtn');
  const certSubmitBtn = document.getElementById('certSubmit');
  const cancelBtn = document.getElementById('cancel');
  const certWrapper = document.getElementById('cert-wrapper');

  // IFRAME SETUP
  const iframeElement = document.createElement('iframe');
  iframeElement.id = 'certificate-iframe';
  iframeElement.style.width = "100%";
  iframeElement.style.height = "100%";
  iframeElement.style.boxShadow = '0 2px 5px #555';
  iframeElement.setAttribute("frameborder", "0");
  certWrapper.appendChild(iframeElement);

  let placeholderCount = 0;

  // ADD PLACEHOLDER INPUT
  function addPlaceholderInput(initialName = '') {
    placeholderCount++;
    const wrapper = document.createElement('div');
    wrapper.className = 'field pldr-field';

    const label = document.createElement('label');
    label.className = 'pldr-key';
    label.textContent = initialName || ('placeholder_' + placeholderCount);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pldr-val';
    input.placeholder = 'Enter value for ' + label.textContent;
    input.addEventListener('input', updateIframeContent);

    label.appendChild(input);
    wrapper.appendChild(label);
    placeholderContainer.appendChild(wrapper);
  }

  // LOAD PLACEHOLDERS FROM TEMPLATE HTML
  function loadPlaceholdersFromHtml() {
    placeholderContainer.innerHTML = "";
    placeholderCount = 0;
    const markup = html_code && html_code.trim().length > 0 ? html_code : default_html_code;
    const regex = /{{s*([A-Za-z0-9_]+)s*}}/g;
    let match;
    const placeholdersSet = new Set();
    
    while ((match = regex.exec(markup)) !== null) {
      placeholdersSet.add(match[1]);
    }
    
    placeholdersSet.forEach(name => {
      addPlaceholderInput(name);
    });
  }

  // UPDATE IFRAME PREVIEW
  function updateIframeContent() {
    let tempHtml = html_code && html_code.trim().length > 0 ? html_code : default_html_code;

    // Map form fields to common placeholders
    const baseReplacements = {
      student_name: recipientInput.value || 'Student Name',
      workshop_name: courseInput.value || 'Course / Workshop',
      certified_on: dateInput.value || 'Issue Date',
      duration: purposeInput.value || '',
      certified_by: 'Your Organization'
    };

    Object.keys(baseReplacements).forEach(key => {
      const val = baseReplacements[key];
      const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      tempHtml = tempHtml.replace(reg, val);
    });

    // Custom placeholder replacements
    document.querySelectorAll(".pldr-field").forEach(row => {
      const keyNode = row.querySelector(".pldr-key").childNodes[0];
      const key = keyNode ? keyNode.nodeValue.trim() : '';
      const val = row.querySelector(".pldr-val").value.trim();
      if (key) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        tempHtml = tempHtml.replace(regex, val || key);
      }
    });

    iframeElement.srcdoc = tempHtml;

    // SCALE IFRAME TO FIT
    iframeElement.onload = () => {
      try {
        const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) return;
        
        const contentWidth = iframeDoc.body.scrollWidth;
        const wrapperWidth = certWrapper.offsetWidth || 800;
        const scale = Math.min(1, wrapperWidth / contentWidth);
        
        iframeDoc.body.style.transform = `scale(${scale})`;
        iframeDoc.body.style.transformOrigin = "top left";
        iframeDoc.body.style.width = contentWidth + "px";
        iframeDoc.body.style.margin = "0";
      } catch (e) {
        console.warn("Iframe scaling failed:", e);
      }
    };
  }

  // AUTH CHECK
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

  // LOAD TEMPLATE DATA
  fetch("../backend/api/templates.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=id_selected"
  })
  .then(res => res.json())
  .then(data => {
    console.log('load templ-data msg: ', data.message);
    if (data.status === "success") {
      const template = data.data;
      t_id = template.t_id;
      t_name = template.tname;
      html_code = template.html_code || '';
      bg_img = template.bg_img || '';
      opacity = template.opacity || '100%';
      orientation = template.orientation || 'landscape';

      templateNameInput.value = t_name;
      document.getElementById('t_id').value = t_id;

      loadPlaceholdersFromHtml();
      updateIframeContent();
    } else {
      // Fallback to default template
      html_code = default_html_code;
      loadPlaceholdersFromHtml();
      updateIframeContent();
    }
  })
  .catch(() => {
    // Fallback to default template on error
    html_code = default_html_code;
    loadPlaceholdersFromHtml();
    updateIframeContent();
  });

  // EVENT LISTENERS
  previewBtn.addEventListener('click', updateIframeContent);

  resetBtn.addEventListener('click', () => {
    recipientInput.value = '';
    courseInput.value = '';
    dateInput.value = '';
    purposeInput.value = '';
    document.querySelectorAll(".pldr-field .pldr-val").forEach(inp => inp.value = '');
    updateIframeContent();
  });
// SAVE CERTIFICATE
certSubmitBtn.addEventListener("click", () => {
  const r_name = recipientInput.value.trim();
  const course = courseInput.value.trim();
  const issueDate = dateInput.value;
  const purpose = purposeInput.value.trim();

  if (!t_name.trim()) return alert("Certificate template name missing.");
  if (!html_code.trim()) html_code = default_html_code;
  if (!r_name) return alert("Recipient name required.");
  if (!course) return alert("Course name required.");
  if (!issueDate) return alert("Issue date required.");

  // Collect placeholders
  const placeholders = {};
  document.querySelectorAll(".pldr-field").forEach(row => {
    const keyNode = row.querySelector(".pldr-key").childNodes[0];
    const key = keyNode ? keyNode.nodeValue.trim() : '';
    const val = row.querySelector(".pldr-val").value.trim();
    if (key) placeholders[key] = val;
  });

  const formData = new FormData();
  formData.append("action", "create");
  formData.append("t_id", t_id || '');
  formData.append("tname", t_name);
  formData.append("orientation", orientation);
  formData.append("html_code", html_code);
  formData.append("bg_img", bg_img);
  formData.append("opacity", opacity);
  formData.append("r_name", r_name);
  formData.append("course", course);
  formData.append("issue_date", issueDate);
  formData.append("purpose", purpose);

  // Add placeholders
  Object.keys(placeholders).forEach(k => {
    formData.append(`pldrs[${k}]`, placeholders[k]);
  });

  // FETCH TO SAVE
  fetch("../backend/api/certificate.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("Certificate successfully saved ✅");

      const c_id = data.data?.c_id;
      if (!c_id) {
        console.warn("Certificate saved but c_id not returned from server.");
        return;
      }

      const certForm = new FormData();
      certForm.append("action", "create");
      certForm.append("c_id", c_id);

      fetch("../backend/api/export.php", {
        method: "POST",
        body: certForm
      })
      .then(res2 => res2.json())
      .then(data2 => console.log("Export Success: " + data2.message))
      .catch(err => console.error("Export error:", err));

      setTimeout(() => {
        window.location.href = "./certificate.html";
      }, 2000);

    } else {
      alert("Error saving certificate: " + data.message);
    }
  })
  .catch(err => alert("Server error: " + err.message));
});

// CANCEL BUTTON LISTENER (OUTSIDE)
cancelBtn.addEventListener('click', () => {
  fetch("../backend/api/templates.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=unuse"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.status === "success") {
      window.location.href = "./dashboard.html";
    }
  })
  .catch(err => alert("Server error: " + err.message));
});
});