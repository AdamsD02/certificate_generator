// ===============================
// CHECK USER LOGIN
// ===============================
async function checkLogin() {
    try {
        const res = await fetch("../backend/api/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=check"
        });
        const data = await res.json();

        if (data.status !== "success") {
            alert('User not Logged In, redirecting...');
            window.location.href = "index.html";
        }
    } catch (err) {
        console.error("Error connecting to server", err);
        window.location.href = "index.html";
    }
}

// ===============================
// SIDEBAR NAVIGATION
// ===============================
document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const text = item.querySelector('span:nth-child(2)').innerText.trim();

        document.querySelectorAll('.sidebar .nav-item')
            .forEach(i => i.classList.remove('active'));

        item.classList.add('active');

        if (text === "Dashboard") location.href = "dashboard.html";
        if (text === "Create Templates") location.href = "create_template.html";
        if (text === "Certificates") location.href = "certificate.html";
    });
});


// ===============================
// LOAD TEMPLATE LIST (FIXED)
// ===============================
async function loadTemplateList() {
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    try {
        const res = await fetch("../backend/api/templates.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=list"
        });
        const data = await res.json();

        if (data.status !== "success" || !data.data.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px">No templates found</td></tr>`;
            return;
        }

        data.data.forEach((row, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.t_name}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-pill btn-primary" data-id="${row.t_id}" data-action="use">Use</button>
                        <button class="btn-pill btn-ghost" data-id="${row.t_id}" data-action="edit">Edit</button>
                        <button class="btn-pill btn-danger" data-id="${row.t_id}" data-action="delete">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // ✅ Only after rows are added
        attachActionEvents();

    } catch (err) {
        console.error("Server error:", err);
        alert("Server error. Please try again.");
    }
}


// ===============================
// BUTTON ACTIONS (AJAX)
// ===============================
function downloadTemplate(id) {
    window.location.href = `../backend/api/templates.php?action=download&id=${id}`;
}

function emailTemplate(id) {
    const fd = new URLSearchParams();
    fd.append("action", "use");
    fd.append("id", id);

    fetch("../backend/api/templates.php", { method: "POST", body: fd })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                window.location.href = "email_editor.html";
            } else {
                alert(data.message || "Email failed");
            }
        });
}

function editTemplate(id) {
    const fd = new URLSearchParams();
    fd.append("action", "use");
    fd.append("id", id);

    fetch("../backend/api/templates.php", { method: "POST", body: fd })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                window.location.href = "edit_template.html";
            } else {
                alert(data.message || "Edit failed");
            }
        });
}

function deleteTemplate(id) {
    if (!confirm("Do you really want to delete this template?")) return;

    const fd = new URLSearchParams();
    fd.append("action", "delete");
    fd.append("id", id);

    fetch("../backend/api/templates.php", { method: "POST", body: fd })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") loadDashboardList();
        });
}

// ===============================
// LOGOUT
// ===============================
document.getElementById("logoutBtn").addEventListener("click", () => {
    if (!confirm("Do you really want to logout?")) return;

    fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=logout"
    }).then(() => location.href = "index.html");
});

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
    await checkLogin();      // ✅ check login first
    await loadDashboardList(); // ✅ then load template list
});
