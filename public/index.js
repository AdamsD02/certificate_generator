document.addEventListener("DOMContentLoaded", () => {
    const form  = document.getElementById("loginForm");
    const erMsg = document.getElementById("errorMsg");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        erMsg.textContent = "";

        const emailIn = document.getElementById("email").value;
        const pswdIn = document.getElementById("pswd").value;

        // Use URLSearchParams for x-www-form-urlencoded
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', emailIn);
        formData.append('pswd', pswdIn);

        // Use absolute path from localhost root
        fetch("./../backend/api/auth.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json()) // directly parse JSON
        .then(data => {
            if (data.status === "success") {
                msg.textContent = "Login successful! Redirecting...";

                // short delay to show message before redirect
                setTimeout(() => {
                    window.location.href = "./dashboard.html";
                }, 500);

            } else {
                erMsg.style.display = "block";
                erMsg.textContent = data.message || "Login failed";
            }
        })
        .catch(err => {
            console.error("Error caught at login-submit ", err.message);
            erMsg.textContent = "Error caught at login-submit.";

        });
    });
});
