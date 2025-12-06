const emailForm = document.getElementById('emailForm');
const statusMessage = document.getElementById('statusMessage');
const bodyEditor = document.getElementById('body');
const toolbarButtons = document.querySelectorAll('.toolbar button');
const pdfInput = document.getElementById("pdfFile");
const pdfLabel = document.getElementById("pdfLabel");

// Rich-text toolbar actions
toolbarButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const command = btn.dataset.command;
    document.execCommand(command, false, null);
    bodyEditor.focus();
  });
});

// PDF upload preview text update
pdfInput.addEventListener("change", function () {
  if (pdfInput.files.length > 0) {
    pdfLabel.textContent = "PDF Attached: " + pdfInput.files[0].name;
  } else {
    pdfLabel.textContent = "Attach PDF";
  }
});


emailForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const sender = document.getElementById('sender').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const cc = document.getElementById('cc').value.trim();
  const bcc = document.getElementById('bcc').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const body = bodyEditor.innerHTML.trim();

  if (!sender || !receiver || !subject || !body) {
    statusMessage.textContent = 'Please fill in all required fields.';
    statusMessage.style.color = '#b91c1c';
    return;
  }

  const formData = new FormData();
  formData.append('sender', sender);
  formData.append('receiver', receiver);
  formData.append('cc', cc);
  formData.append('bcc', bcc);
  formData.append('subject', subject);
  formData.append('body', body);

  if (pdfInput.files.length > 0) {
    formData.append('pdfFile', pdfInput.files[0]);
  }

  // ✅ AJAX POST request
  fetch('../backend/send_email.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      statusMessage.textContent = 'Email sent successfully!';
      statusMessage.style.color = '#15803d';
      // Clear form if needed
      emailForm.reset();
      bodyEditor.innerHTML = '';
      pdfLabel.textContent = "Attach PDF";
    } else {
      statusMessage.textContent = data.message || 'Failed to send email.';
      statusMessage.style.color = '#b91c1c';
    }
  })
  .catch(err => {
    console.error('Email send error:', err);
    statusMessage.textContent = 'Error connecting to server.';
    statusMessage.style.color = '#b91c1c';
  });
});
