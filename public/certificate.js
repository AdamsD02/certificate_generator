document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // DOWNLOAD CERTIFICATE
  // =============================
  document.querySelectorAll(".btn-primary").forEach(btn => {
    btn.addEventListener("click", e => {

      // Only Download button
      if (!btn.innerText.includes("Download")) return;

      const row = e.target.closest("tr");
      const certId = row.dataset.id;

      fetch("../backend/export.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=create&id=${certId}`
      })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificate.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert("Download failed"));
    });
  });

  // =============================
  // EMAIL CERTIFICATE
  // =============================
  document.querySelectorAll(".email-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "email_editor.html";
    });
  });

  // =============================
  // EDIT CERTIFICATE
  // =============================
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "edit_certificate.html";
    });
  });

  // =============================
  // DELETE (Frontend only)
  // =============================
  document.querySelectorAll(".btn-danger").forEach(btn => {
    btn.addEventListener("click", e => {
      if (!confirm("Are you sure you want to delete this certificate?")) return;
      e.target.closest("tr").remove();
    });
  });

  // =============================
  // LOGOUT
  // =============================
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    if (!confirm("Do you really want to logout?")) return;

    fetch("../backend/api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=logout"
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        window.location.href = "index.html";
      } else {
        alert("Logout failed");
      }
    });
  });

});
