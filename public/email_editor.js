// data fields
const emailForm = document.getElementById('emailForm');  // form 
const email_body = document.getElementById('body'); // div
const sender = document.getElementById('sender'); //input-text
const receiver = document.getElementById('receiver'); //input-text
const subject = document.getElementById('subject');  //input-text
const cc_val = document.getElementById('cc');  //input-text
const bcc_val = document.getElementById('bcc');  //input-text

const pdf_name_span = document.getElementById('pdf_name'); // below body span
const statusMessage = document.getElementById('statusMessage'); // message box
let c_id = '';


//---- Ajax to Check user Login ----

function checkLogin() {
  return fetch("../backend/api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=check"
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.message);
    if (data.status !== "success") {
      alert("User not logged in.");
      window.location.href = "./index.html";
    }
  })
  .catch(() => {
    alert("Error connecting to server");
    window.location.href = "./index.html";
  });
}


//---- Ajax to Get Certificate Data ----

function getData() {
  return fetch("../backend/api/certificate.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=id_selected"
  })
  .then(res => res.json())
  .then(data => {
    console.log(data.message);
    if (data.status !== "success") {
      alert("Failed to get certificate specific data.");
      window.location.href = "./certificate.html";
    }

    const cert_data = data.data;

    const r_name = cert_data.r_name;
    const course = cert_data.course;
    const issue_date = cert_data.issue_date;
    c_id = cert_data.c_id;

    let tmp_body = `<p>Dear ${r_name},</p>
                    <p>Congratulations on successfully completing the <strong>${course}</strong> course. Your certificate was issued on <strong>${issue_date}</strong>. We wish you all the best for your future endeavors! 🎉
                    </p>
                    <p>Best regards,<br>
                    Certificate Team
                    </p>`;
    let pdf_name = "Cert_" + r_name + "_" + course + "_" + issue_date.replace(/-/g, "_") + '.pdf';

    email_body.innerHTML = tmp_body;
    pdf_name_span.textContent = pdf_name;

  })
  .catch(() => {
    alert("Error connecting to server");
    window.location.href = "./dashboard.html";
  });
}


//--- start --- 

document.addEventListener("DOMContentLoaded", async () => {
    await checkLogin();
    await getData();
    
  //---- Form Handler ----
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();

      statusMessage.textContent = "";

      const s_email = document.getElementById('sender').value.trim();
      const s_name = document.getElementById('sender_name').value.trim();
      const r_email = document.getElementById('receiver').value.trim();
      const cc_email = document.getElementById('cc').value.trim();
      const bcc_email = document.getElementById('bcc').value.trim();
      const subject_txt = document.getElementById('subject').value.trim();
      const body_content = document.getElementById('body').innerHTML.trim();

      if (!s_email || !r_email || !subject_txt || !body_content) {
        statusMessage.textContent = 'Please fill in all required fields.';
        statusMessage.style.color = '#b91c1c';
        return;
      }

      const formData = new FormData();
      formData.append('action', 'send');
      formData.append('c_id', c_id);
      formData.append('body', body_content);
      formData.append('from_email', s_email);
      formData.append('from_name', s_name);
      formData.append('to_email', r_email);
      formData.append('subject', subject_txt);
      formData.append('cc_email', cc_email);
      formData.append('bcc_email', bcc_email);

      // AJAX POST request
      fetch('../backend/api/email.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          statusMessage.textContent = 'Email sent successfully!';
          statusMessage.style.color = '#15803d';

          setTimeout( () => { window.location.href = './certificate.html'; }, 500 );

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

    emailForm.addEventListener('reset', () =>{
      setTimeout(() => getData(), 10);
    });


    //---- Cancel Btn ----

    document.getElementById('cancel').addEventListener('click', () => {
      fetch('./../backend/api/certificate.php', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=unuse"
      })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
        if (data.status !== "success") {
          alert("Cert-id still in session");
        }
        window.location.href = "./certificate.html";
      })
      .catch(() => {
        alert("Error connecting to server");
        window.location.href = "./certificate.html";
      });
    });

});

