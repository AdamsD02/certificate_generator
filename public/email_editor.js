const emailForm = document.getElementById('emailForm');
const statusMessage = document.getElementById('statusMessage');
const bodyEditor = document.getElementById('body');
const toolbarButtons = document.querySelectorAll('.toolbar button');

// Rich-text toolbar actions
toolbarButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const command = btn.dataset.command;
    document.execCommand(command, false, null);
    bodyEditor.focus();
  });
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

  const emailData = {
    sender,
    receiver,
    cc,
    bcc,
    subject,
    body
  };

  console.log('Email payload:', emailData);

  // Simulate email sending
  statusMessage.textContent = 'Email sent successfully (simulated).';
  statusMessage.style.color = '#15803d';
  // PDF upload preview text update
const pdfInput = document.getElementById("pdfFile");
const pdfLabel = document.getElementById("pdfLabel");

pdfInput.addEventListener("change", function () {
  if (pdfInput.files.length > 0) {
    pdfLabel.textContent = "PDF Attached: " + pdfInput.files[0].name;
  } else {
    pdfLabel.textContent = "Attach PDF";
  }
});

});
