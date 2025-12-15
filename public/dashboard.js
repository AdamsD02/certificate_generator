let templates = [];
const list = document.getElementById('templateList');

// ----------------------------
// Sidebar Navigation Handling
// ----------------------------
const sidebarItems = document.querySelectorAll('.sidebar .nav-item');

sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const text = item.querySelector('span:nth-child(2)').textContent.trim();

        // Remove 'active' class from all nav-items
        sidebarItems.forEach(i => i.classList.remove('active'));
        // Set active class to clicked item
        item.classList.add('active');

        if (text === 'Create Templates') {
            window.location.href = 'create_template.html';
        } else if (text === 'Dashboard') {
            window.location.href = 'dashboard.html';
        } else if (text === 'Certificates') {
            window.location.href = 'certificate.html';
        }
    });
});

// ----------------------------
// Fetch templates from server
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
    fetch('/backend/templates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=list'
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success'){
            templates = data.data;  
        } else {
            templates = [];  
            console.warn(data.message);
        }
        render(); 
        document.querySelector('.chip').textContent = templates.length + ' templates';
    })
    .catch(err => console.error('Error fetching templates:', err));
});

// ----------------------------
// Render templates
// ----------------------------
function render(){
    list.innerHTML = '';
    templates.forEach(t => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="left">
            <div style="display:flex;align-items:center">
              <div class="title">${t.title}</div>
              <div class="tag">${t.tag}</div>
            </div>
            <div class="desc">${t.desc}</div>
          </div>
          <div class="right">
            <button class="btn-use" data-id="${t.id}">✓ Use Template</button>
            <button class="btn-ghost" data-action="edit" data-id="${t.id}">✏️ Edit</button>
            <button class="btn-ghost" data-action="preview" data-id="${t.id}">👁️ Preview</button>
            <button class="btn-delete" data-action="delete" data-id="${t.id}">🗑️ Delete</button>
          </div>
        `;
        list.appendChild(card);
    });
}

// ----------------------------
// Template actions
// ----------------------------
list.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if(btn.classList.contains('btn-use')){
        alert('Template "' + templates.find(x => x.id === id).title + '" selected for use.');
    } else if(action === 'edit'){
        const t = templates.find(x => x.id === id);
        const newTitle = prompt('Edit template title', t.title);
        if(newTitle) { t.title = newTitle; render(); }
    } else if(action === 'preview'){
        openPreview(id);
    } else if(action === 'delete'){
        if(confirm('Delete this template?')){
            fetch('/backend/templates.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'action=delete&id=' + id
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success'){
                    templates = templates.filter(t => t.id !== id);
                    render();
                    document.querySelector('.chip').textContent = templates.length + ' templates';
                } else {
                    alert(data.message);
                }
            })
            .catch(err => console.error('Delete error:', err));
        }
    }
});

// ----------------------------
// New Template button
// ----------------------------
document.getElementById('newTemplate').addEventListener('click', () => {
    window.location.href = 'create_template.html';
});

// ----------------------------
// Template preview modal
// ----------------------------
function openPreview(id){
    const t = templates.find(x => x.id === id);
    const root = document.getElementById('modalRoot');
    root.innerHTML = `
        <div class="modal-backdrop">
          <div class="modal">
            <div class="modal-header">
              <div>
                <div style="font-weight:800;font-size:18px">${t.title} <span style="margin-left:10px" class="pill">${t.tag}</span></div>
                <div class="muted-2" style="margin-top:6px">${t.desc}</div>
              </div>
              <div><button class="btn-ghost" id="closeModal">Close</button></div>
            </div>
            <hr style="margin:12px 0 18px;border:none;border-top:1px solid #eef2f8">
            <div style="height:420px;overflow:auto;border-radius:8px;border:1px solid #f1f5f9;padding:14px">
              <h3>Preview area</h3>
              <p style="color:#6b7280">This is a simple preview placeholder showing how the template might look. Replace this with a live preview renderer if needed.</p>
            </div>
          </div>
        </div>
    `;

    document.getElementById('closeModal').addEventListener('click', () => root.innerHTML = '');
    root.querySelector('.modal-backdrop').addEventListener('click', ev => {
        if(ev.target.classList.contains('modal-backdrop')) root.innerHTML = '';
    });
}

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
