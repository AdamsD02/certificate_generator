document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginForm");
    const msg  = document.getElementById("successMsg");
    const erMsg  = document.getElementById("errorMsg");

    form.addEventListener("submit", function(e) {
        e.preventDefault(); // stop normal form submit

        const formData = new URLSearchParams();
        formData.append("action", "login");
        formData.append("email", document.getElementById("email").value);
        formData.append("pswd", document.getElementById("pswd").value);

        fetch("../backend/api/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                msg.textContent = "Login successful! Redirecting...";

                // short delay to show message before redirect
                setTimeout(() => {
                    window.location.href = "./dashboard.html";
                }, 500);

            } else {
                erMsg.textContent = data.message || "Invalid credentials";
            }
        })
        .catch(err => {
            console.error("Error caught at login-submit ", err.message);
            erMsg.textContent = "rror caught at login-submit.";

        });
    });
});

