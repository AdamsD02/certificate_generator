// ----------------- Format Date -----------------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// ----------------- Download Certificate -----------------
function startDownload(id) {
    if (!id) { alert("Certificate ID missing!"); return; }

    const formData = new FormData();
    formData.append('action', 'download');
    formData.append('c_id', id);

    fetch('../backend/api/export.php', { method: 'POST', body: formData })
        .then(res => {
            const data = (res) => {return res.json();};
            console.log(data.message);
            if (!res.ok) throw new Error("Network response not ok");
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(err => {
            console.log(err);
            alert("Error downloading certificate.");
        });
}

// ----------------- Email Certificate -----------------
function emailProcess(id) {
    if (!id) { alert("Certificate ID missing for email."); return; }

    const formData = new FormData();
    formData.append('action', 'use');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            if (data.status === 'success') {
                console.log('Certificate ID set for email.');
                window.location.href = './email_editor.html';
            } else {
                alert(data.message || 'Certificate-ID not set for email.');
            }
        })
        .catch(err => {
            console.log(err);
            alert("Error connecting to server.");
        });
}

// ----------------- Edit Certificate -----------------
function editProcess(id) {
    if (!id) { alert("Certificate ID missing for edit."); return; }

    const formData = new FormData();
    formData.append('action', 'use');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            if (data.status === 'success') {
                console.log('Certificate ID set for edit.');
                window.location.href = './edit_certificate.html';
            } else {
                alert(data.message || 'Certificate-ID not set for edit.');
            }
        })
        .catch(err => {
            console.log(err);
            alert("Error connecting to server.");
        });
}

// ----------------- Delete Certificate -----------------
function deleteProcess(id) {
    if (!id) { alert("Certificate ID missing for delete."); return; }

    if (!confirm("Do you really want to delete this certificate?")) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            alert(data.message);
            if (data.status === 'success') getCertList();
        })
        .catch(err => {
            console.log(err);
            alert("Error connecting to server.");
        });
}

// ----------------- Attach Button Events -----------------
function attachActionEvents() {
    document.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;

            switch(action) {
                case "download": startDownload(id); break;
                case "email": emailProcess(id); break;
                case "edit": editProcess(id); break;
                case "delete": deleteProcess(id); break;
            }
        });
    });
}

// ----------------- Check Login -----------------
async function checkLogin() {
    try {
        const res = await fetch("../backend/api/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=check"
        });
        const data = await res.json();
        console.log(data.message);
        if (data.status !== "success") {
            alert('User not logged in, redirecting...');
            window.location.href = './index.html';
        }
    } catch (err) {
        console.log(err);
        window.location.href = './index.html';
    }
}

// ----------------- Get Certificate List -----------------
async function getCertList() {
    try {
        const res = await fetch("../backend/api/certificate.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=list"
        });
        const data = await res.json();
        console.log(data.message);

        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";

        if (data.status !== "success") {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:20px;">
                        ${data.message || "No certificates found."} <br>Create certificates from Dashboard Templates.
                    </td>
                </tr>
            `;
            return;
        }

        data.data.forEach(cert => {
            const { c_id, r_name, course, issue_date, purpose, t_name } = cert;
            const initials = r_name.split(" ").map(w => w[0].toUpperCase()).join("").slice(0, 2);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td title="${purpose}">
                    <div class="recipient-cell">
                        <div class="avatar-cell">${initials}</div>
                        <div class="recipient-info">
                            <span class="recipient-name">${r_name}</span>
                            <span class="recipient-id">${c_id ? "ID #" + c_id : ""}</span>
                        </div>
                    </div>
                </td>
                <td title="${purpose}">
                    <div class="course-title">${course}</div>
                    <div class="course-status">Certified</div>
                </td>
                <td title="${purpose}">
                    <div class="issue-date-main">${formatDate(issue_date)}</div>
                    <div class="issue-date-sub">Issued</div>
                </td>
                <td title="Uses ${t_name}">
                    <div class="actions-cell">
                        <button class="btn-pill btn-primary" data-id="${c_id}" data-action="download">Download</button>
                        <button class="btn-pill btn-ghost" data-id="${c_id}" data-action="email">Email</button>
                        <button class="btn-pill btn-ghost" data-id="${c_id}" data-action="edit">Edit</button>
                        <button class="btn-pill btn-danger" data-id="${c_id}" data-action="delete">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        attachActionEvents();
    } catch (err) {
        console.log(err);
        alert("Error connecting to server.");
    }
}

// ----------------- Sidebar Navigation -----------------
document.querySelectorAll('.sidebar .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const text = item.querySelector('span:nth-child(2)')?.innerText.trim();
        document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        switch(text) {
            case "Dashboard": location.href = "dashboard.html"; break;
            case "Create Templates": location.href = "create_template.html"; break;
            case "Certificates": location.href = "certificate.html"; break;
        }
    });
});

// ----------------- Logout -----------------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (!confirm("Do you really want to logout?")) return;

    fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=logout"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.message);
        if (data.status === "success") {
            alert("Logout Successful!");
            window.location.href = './index.html';
        } else {
            alert("Logout Failed!");
        }
    })
    .catch(err => {
        console.log(err);
        window.location.href = './index.html';
    });
});
// ----------------- Search Certificates -----------------
document.addEventListener("input", function (e) {
    if (e.target.matches('input[placeholder="Search certificates..."]')) {
        const searchValue = e.target.value.toLowerCase();
        const rows = document.querySelectorAll("table tbody tr");

        rows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            if (rowText.includes(searchValue)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
});

// ----------------- Init -----------------
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Certificate.js:');
    await checkLogin();
    await getCertList();
});
