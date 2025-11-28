const templates = [
      {id:1,title:'Marketing Landing Page', tag:'Web', desc:'High-converting layout for product launches and campaigns.'},
      {id:2,title:'Internal Report Dashboard', tag:'Dashboard', desc:'Executive-ready reporting layout for internal stakeholders.'},
      {id:3,title:'Customer Onboarding Flow', tag:'Journey', desc:'Guided experience optimized for new user activation.'},
      {id:4,title:'Quarterly Board Pack', tag:'Presentation', desc:'Polished, board-ready presentation structure with metrics.'},
      {id:5,title:'Feature Release Email', tag:'Email', desc:'Clear, high-open email template for announcing features.'}
    ];

    const list = document.getElementById('templateList');
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
      })
    }

    render();

    
    list.addEventListener('click', e=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if(btn.classList.contains('btn-use')){
        alert('Template "'+templates.find(x=>x.id===id).title+'" selected for use.');
      } else if(action === 'edit'){
        const t = templates.find(x=>x.id===id);
        const newTitle = prompt('Edit template title', t.title);
        if(newTitle) { t.title = newTitle; render(); }
      } else if(action === 'preview'){
        openPreview(id);
      } else if(action === 'delete'){
        if(confirm('Delete this template?')){
          const idx = templates.findIndex(x=>x.id===id);
          templates.splice(idx,1);
          render();
          document.querySelector('.chip').textContent = templates.length+ ' templates';
        }
      }
    })

    document.getElementById('newTemplate').addEventListener('click', ()=>{
      const title = prompt('New template name');
      if(!title) return;
      const tag = prompt('Tag (e.g. Web, Dashboard)', 'Web') || 'Web';
      const desc = prompt('Short description', '') || '';
      templates.push({id:Date.now(),title,tag,desc});
      render();
      document.querySelector('.chip').textContent = templates.length+ ' templates';
    })

    function openPreview(id){
      const t = templates.find(x=>x.id===id);
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
              <div style="margin-top:12px;background:#fafafa;padding:12px;border-radius:8px;border:1px dashed #e6edf3">
                <strong>${t.title}</strong>
                <p style="margin:8px 0;color:#6b7280">${t.desc}</p>
                <button class="btn btn-primary">Use this template</button>
                
                <div id="successMsg" style="display:none; color: green;">
                Success! Your action was completed.
                </div>

                <div id="errorMsg" style="display:none; color: red;">
                 Something went wrong. Please try again.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('closeModal').addEventListener('click', ()=> root.innerHTML='');
      root.querySelector('.modal-backdrop').addEventListener('click', (ev)=>{ if(ev.target.classList.contains('modal-backdrop')) root.innerHTML=''; })
    }