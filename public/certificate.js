// Attach button click listeners for table rows
document.querySelectorAll('.actions-cell').forEach((cell, index) => {
    const emailBtn = cell.querySelector('button:nth-child(2)');
    const editBtn  = cell.querySelector('button:nth-child(3)');
    const deleteBtn = cell.querySelector('button:nth-child(4)');
    const exportBtn = cell.querySelector('button:nth-child(1)');

    const certId = index + 1; // Replace with real ID from backend if possible

    // ----------------
    // Email Certificate
    // ----------------
    if(emailBtn){
        emailBtn.addEventListener('click', () => {
            // Set session c_id via AJAX
            fetch('backend/certificates.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: `action=set_session&id=${certId}`
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success'){
                    // Load email editor in panel
                    loadPage('email_editor.html');
                } else {
                    alert("Failed to set certificate session: " + data.message);
                }
            })
            .catch(err => console.error(err));
        });
    }

    // ----------------
    // Edit Certificate
    // ----------------
    if(editBtn){
        editBtn.addEventListener('click', () => {
            fetch('backend/certificates.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: `action=set_session&id=${certId}`
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success'){
                    // Load edit certificate page in panel
                    loadPage('edit_certificate.html');
                } else {
                    alert("Failed to set certificate session: " + data.message);
                }
            })
            .catch(err => console.error(err));
        });
    }

    // ----------------
    // Delete Certificate
    // ----------------
    if(deleteBtn){
        deleteBtn.addEventListener('click', () => {
            if(confirm("Delete this certificate?")){
                fetch('backend/certificates.php', {
                    method: 'POST',
                    headers: {'Content-Type':'application/x-www-form-urlencoded'},
                    body: `action=delete&id=${certId}`
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status === 'success'){
                        // Optionally remove row from table
                        cell.closest('tr').remove();
                    } else {
                        alert("Delete failed: " + data.message);
                    }
                })
                .catch(err => console.error(err));
            }
        });
    }

    // ----------------
    // Export / Download
    // ----------------
    if(exportBtn){
        exportBtn.addEventListener('click', () => {
            // Trigger download via AJAX or direct link
            window.location.href = `backend/certificates.php?action=export&id=${certId}`;
        });
    }
});
