document.addEventListener("DOMContentLoaded", () => {
    const form  = document.getElementById("loginForm");
    const erMsg = document.getElementById("errorMsg");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        erMsg.textContent = "";

        // Use URLSearchParams for x-www-form-urlencoded
        const formData = new URLSearchParams({
            action: "login",
            email: document.getElementById("email").value,
            pswd: document.getElementById("pswd").value
        });

        // Use absolute path from localhost root
        fetch("/certificate_generator/backend/api/auth.php", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: formData.toString()
        })
        .then(res => res.json()) // directly parse JSON
        .then(data => {
            if (data.status === "success") {
                window.location.href = "/certificate_generator/public/dashboard.html";
            } else {
                erMsg.style.display = "block";
                erMsg.textContent = data.message || "Login failed";
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            erMsg.style.display = "block";
            erMsg.textContent = "Server error";
        });
    });
});
