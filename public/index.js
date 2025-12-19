document.addEventListener("DOMContentLoaded", () => {

    const erMsg = document.getElementById("errorMsg");

    // ------------------ check if user already logged in ------------------

    const checkForm = new FormData();
    checkForm.append('action', 'check');

    fetch('./../backend/api/auth.php', {
        method: 'POST',
        body: checkForm
    } )
    .then(res => res.json())
    .then(data => {
        if( data.status === 'success' ) {
            console.log('Index page: user logged in!');
            alert(data.message, ' Redirecting to Dashboard...');
            window.location.href ='./dashboard.html';
        }
        console.info('Index page: User not logged in yet.');
    })
    .catch(err => {
        erMsg.textContent = 'Error At Server, Login May not work.'; 
        console.error('Index page: ', err.message);
    })

    // ------------------ Login form submission ------------------

    const form  = document.getElementById("loginForm");

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
            console.log('Index page: ', data.message);
            if (data.status === "success") {
                alert("Login successful! Redirecting...");

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
