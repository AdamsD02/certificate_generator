document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginForm");
    const msg  = document.getElementById("msg");

    form.addEventListener("submit", function(e) {
        e.preventDefault(); // stop normal form submit

        const formData = new URLSearchParams();
        formData.append("action", "login");
        formData.append("email", document.getElementById("email").value);
        formData.append("pswd", document.getElementById("pswd").value);

        fetch("../backend/api/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                msg.textContent = "Login successful! Redirecting...";
                window.location.href = "./dashboard.html";
            } else {
                msg.textContent = data.message || "Invalid credentials";
            }
        })
        .catch(err => {
            msg.textContent = "Error connecting to server";
         
            

        });
    });
});

