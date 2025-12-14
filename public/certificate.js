document.addEventListener("DOMContentLoaded", () => {

    // EMAIL CERTIFICATE BUTTON
    document.querySelectorAll(".email-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // redirect to email editor page
            window.location.href = "email_editor.html";
        });
    });

});

// EDIT CERTIFICATE
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = "edit_certificate.html";
        });
    });




// ========================================
//              LOGOUT (AJAX)
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
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
                    // Redirect to login page after successful logout
                    window.location.href = "index.html";
                } else {
                    alert("Logout failed");
                }
            })
            .catch(err => {
                console.error("Logout error:", err);
                alert("Server error");
            });
        });
    }

});
