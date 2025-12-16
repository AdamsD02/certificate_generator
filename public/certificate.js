//------ Format Issue-Date in Table ------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


//------ Download/Export AJAX handler ------ 
function startDownload(id) { }


//------ Email Handler ------ 
function emailProcess(id) {
    const formData = new FormData();
    formData.append('action', 'use');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                alert('Certificate-ID was not passed for email.');
                return;
            }
            console.log('c-id set from cert-list.');
            window.location.href = './email_editor.html';
        })
        .catch(err => {
            console.log('Error connecting to server');
            window.location.href = './index.html';
        });
 }


//------ Delete Certificate Handler ------ 
function deleteProcess(id) {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(err => {
            console.log('Error connecting to server');
            window.location.href = './index.html';
        });
}


//------ Edit Certificate Handler ------ 
function editProcess(id) {
    const formData = new FormData();
    formData.append('action', 'use');
    formData.append('id', id);

    fetch('../backend/api/certificate.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'success') {
                alert('Certificate-ID was not passed for editing.');
                return;
            }
            console.log('c-id set from cert-list.');
            window.location.href = './edit_certificate.html';
        })
        .catch(err => {
            console.log('Error connecting to server');
            window.location.href = './index.html';
        });
}


//------ Button Action Handler ------
function attachActionEvents() {
    document.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;

            if (action === "download") {
                startDownload(id);
            }
            else if (action === "email") {
                emailProcess(id);
            }
            else if (action === "edit") {
                editProcess(id);
            }
            else if (action === "delete") {
                deleteProcess(id);
            }
        });
    });
}


//------ Check User Login ------ 
function checkLogin() {
    return fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=check"  // <-- sending the POST action
    })
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                alert('User not Logged In, redirecting...');
                console.log('Certificate-List: User not logged in.');
                window.location.href = './index.html';
            }
        })
        .catch(err => {
            console.log('Error connecting to server');
            window.location.href = './index.html';
        });
}


//------ Get All Certs in DB ------ 
function getCertList() {
    return fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=list"  // <-- sending the POST action
    })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("table tbody");
            tbody.innerHTML = ""; // clear old rows

            if (data.status !== "success") {
                tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:20px;">
                        ${data.message || 'No Certificates found! <br>Create certificates from Dashboard Templates.'}
                    </td>
                </tr>
            `;
                return;
            }

            const cert_list = data.data;

            cert_list.forEach(cert => {
                const { id, r_name, course, issue_date, purpose, t_name } = cert;

                // Generate initials
                const initials = r_name.split(" ")
                    .map(word => word[0].toUpperCase())
                    .join("")
                    .slice(0, 2);

                // Create row TR
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td title="${purpose}">
                    <div class="recipient-cell">
                        <div class="avatar-cell">${initials}</div>
                        <div class="recipient-info">
                            <span class="recipient-name">${r_name}</span>
                            <span class="recipient-id">${id ? "ID #" + id : ""}</span>
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
                        <button class="btn-pill btn-primary" data-id="${id}" data-action="download">Download</button>
                        <button class="btn-pill btn-ghost" data-id="${id}" data-action="email">Email Certificate</button>
                        <button class="btn-pill btn-ghost" data-id="${id}" data-action="edit">Edit Certificate</button>
                        <button class="btn-pill btn-danger" data-id="${id}" data-action="delete">Delete</button>
                    </div>
                </td>
            `;

                tbody.appendChild(tr);
            });

            attachActionEvents();
        })
        .catch(err => {
            alert('Error connecting to server');
            console.log(err.message);
            window.location.href = './index.html';
        });
}


//------ Logout User Handler ------
function userLogout() {
    fetch("../backend/api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=logout"  // <-- sending the POST action
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert('User Logout Successful!');
                console.log('Certificate-List: User logged out.');
                window.location.href = './index.html';
            }
            else {
                alert('User Logout Failed!');
            }
        })
        .catch(err => {
            console.log('Error connecting to server');
            window.location.href = './index.html';
        });
}


//------ Start/Load ------ 
document.addEventListener('DOMContentLoaded', async () => {
    await checkLogin();
    await getCertList();
})