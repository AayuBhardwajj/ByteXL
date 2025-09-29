<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Node-Employee CLI — Employee Management</title>
  <style>
    /* Reset + base */
    :root{--bg:#0f1724;--card:#0b1020;--accent:#7c5cff;--muted:#94a3b8;--glass: rgba(255,255,255,0.04)}
    *{box-sizing:border-box}
    body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial;color:#e6eef8;background:linear-gradient(180deg,#071025 0%, #071a2b 60%);-webkit-font-smoothing:antialiased}
    .container{max-width:1100px;margin:28px auto;padding:20px}

    header{display:flex;gap:16px;align-items:center;justify-content:space-between}
    .brand{display:flex;gap:12px;align-items:center}
    .logo{width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#4ad6ff);display:flex;align-items:center;justify-content:center;color:#021125;font-weight:700}
    h1{font-size:20px;margin:0}
    p.lead{margin:0;color:var(--muted);font-size:13px}

    .controls{display:flex;gap:10px;align-items:center}
    input.search{padding:10px 12px;border-radius:10px;border:0;background:var(--glass);color:inherit;outline:none;width:220px}
    .btn{background:linear-gradient(90deg,var(--accent),#4ad6ff);padding:10px 14px;border-radius:10px;border:none;color:#021125;font-weight:700;cursor:pointer}
    .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--muted)}

    main{margin-top:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}

    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));padding:16px;border-radius:12px;backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.03)}
    .card h3{margin:0 0 6px;font-size:16px}
    .meta{font-size:13px;color:var(--muted);margin-bottom:10px}
    .row{display:flex;gap:8px;align-items:center}
    .pill{padding:6px 8px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.02)}

    .card-footer{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px}
    .small{font-size:12px;color:var(--muted)}

    /* modal */
    .modal-backdrop{position:fixed;inset:0;background:rgba(2,6,23,0.6);display:none;align-items:center;justify-content:center}
    .modal{width:100%;max-width:520px;background:linear-gradient(180deg,#081226,#061224);padding:18px;border-radius:12px;border:1px solid rgba(255,255,255,0.03)}
    form .field{display:flex;flex-direction:column;margin-bottom:12px}
    label{font-size:13px;color:var(--muted);margin-bottom:6px}
    input,select{padding:10px;border-radius:8px;border:0;background:transparent;border:1px solid rgba(255,255,255,0.04);color:inherit}

    footer{margin-top:26px;color:var(--muted);font-size:13px;text-align:center}

    /* responsive tweaks */
    @media (max-width:640px){.controls{flex-direction:column;align-items:flex-start}.brand h1{font-size:18px}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="logo">NE</div>
        <div>
          <h1>Node-Employee CLI</h1>
          <p class="lead">Lightweight employee manager — CLI-like quick actions, GUI ease.</p>
        </div>
      </div>

      <div class="controls">
        <input id="q" class="search" placeholder="Search name, role or email..." />
        <select id="sortBy" class="search">
          <option value="">Sort</option>
          <option value="salaryAsc">Salary ↑</option>
          <option value="salaryDesc">Salary ↓</option>
        </select>
        <button id="addBtn" class="btn">+ Add Employee</button>
      </div>
    </header>

    <main>
      <div id="grid" class="grid"></div>
      <div id="empty" style="display:none;margin-top:18px;color:var(--muted);text-align:center">No employees yet. Click "Add Employee" to create one.</div>
    </main>

    <footer>
      Data is stored in your browser (localStorage). Use the buttons to manage employees.
    </footer>
  </div>

  <!-- modal -->
  <div id="modalBg" class="modal-backdrop">
    <div class="modal" role="dialog" aria-modal="true">
      <h2 id="modalTitle">Add Employee</h2>
      <form id="form">
        <input type="hidden" id="empId" />
        <div class="field"><label>Name</label><input id="name" required /></div>
        <div class="field"><label>Role</label><input id="role" /></div>
        <div class="field"><label>Email</label><input id="email" type="email" required /></div>
        <div class="field"><label>Phone</label><input id="phone" /></div>
        <div class="field"><label>Salary</label><input id="salary" type="number" min="0" /></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button type="button" id="cancel" class="btn ghost">Cancel</button>
          <button type="submit" class="btn">Save</button>
        </div>
      </form>
    </div>
  </div>

  <template id="cardT">
    <div class="card">
      <h3 data-name></h3>
      <div class="meta" data-role></div>
      <div class="row"><div class="pill" data-email></div><div class="pill" data-phone></div></div>
      <div class="card-footer"><div class="small" data-salary></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost edit">Edit</button>
          <button class="btn ghost delete">Delete</button>
        </div>
      </div>
    </div>
  </template>

  <script>
    // Frontend JS — using localStorage only
    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const q = document.getElementById('q');
    const sortBy = document.getElementById('sortBy');
    const addBtn = document.getElementById('addBtn');
    const modalBg = document.getElementById('modalBg');
    const form = document.getElementById('form');
    const modalTitle = document.getElementById('modalTitle');

    const fields = ['name','role','email','phone','salary'];
    let employees = [];

    function createCard(emp){
      const t = document.getElementById('cardT');
      const node = t.content.cloneNode(true);
      node.querySelector('[data-name]').textContent = emp.name;
      node.querySelector('[data-role]').textContent = emp.role || '—';
      node.querySelector('[data-email]').textContent = emp.email;
      node.querySelector('[data-phone]').textContent = emp.phone || '—';
      node.querySelector('[data-salary]').textContent = '₹ ' + (emp.salary||0);
      const card = node.querySelector('.card');
      card.querySelector('.edit').addEventListener('click', ()=>openEdit(emp));
      card.querySelector('.delete').addEventListener('click', ()=>doDelete(emp.id));
      return node;
    }

    function render(list){
      grid.innerHTML = '';
      if(!list.length){ empty.style.display='block'; return }
      empty.style.display='none';
      const frag = document.createDocumentFragment();
      list.forEach(e=>frag.appendChild(createCard(e)));
      grid.appendChild(frag);
    }

    function load(){
      const query = q.value.trim().toLowerCase();
      const sort = sortBy.value;
      employees = loadLocal().filter(e=>{
        if(!query) return true;
        return e.name.toLowerCase().includes(query) || (e.role||'').toLowerCase().includes(query) || (e.email||'').toLowerCase().includes(query);
      });
      if(sort==='salaryAsc') employees.sort((a,b)=>a.salary-b.salary);
      if(sort==='salaryDesc') employees.sort((a,b)=>b.salary-a.salary);
      render(employees);
    }

    function loadLocal(){
      try{ return JSON.parse(localStorage.getItem('ne_emps')||'[]') }catch{return []}
    }
    function saveLocal(list){ localStorage.setItem('ne_emps', JSON.stringify(list)); }

    addBtn.addEventListener('click', ()=>openAdd());
    q.addEventListener('input', debounce(load, 300));
    sortBy.addEventListener('change', load);

    function openAdd(){
      modalTitle.textContent='Add Employee';
      form.reset(); document.getElementById('empId').value='';
      showModal();
    }
    function openEdit(emp){
      modalTitle.textContent='Edit Employee';
      document.getElementById('empId').value = emp.id;
      document.getElementById('name').value = emp.name;
      document.getElementById('role').value = emp.role || '';
      document.getElementById('email').value = emp.email;
      document.getElementById('phone').value = emp.phone || '';
      document.getElementById('salary').value = emp.salary || 0;
      showModal();
    }

    document.getElementById('cancel').addEventListener('click', hideModal);
    modalBg.addEventListener('click', (e)=>{ if(e.target===modalBg) hideModal(); });

    function showModal(){ modalBg.style.display='flex'; }
    function hideModal(){ modalBg.style.display='none'; }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const id = document.getElementById('empId').value;
      const payload = {};
      fields.forEach(f=> payload[f]=document.getElementById(f).value);
      payload.salary = Number(payload.salary)||0;
      if(!payload.name || !payload.email){ alert('Name and Email required'); return }

      if(id){
        employees = employees.map(x=> x.id===id ? ({...x,...payload,id}) : x);
      }else{
        payload.id = cryptoRandomId();
        employees.unshift(payload);
      }
      saveLocal(employees); render(employees); hideModal();
    });

    function doDelete(id){
      if(!confirm('Delete this employee?')) return;
      employees = employees.filter(x=>x.id!==id);
      saveLocal(employees); render(employees);
    }

    function cryptoRandomId(){ return 'id-' + Math.random().toString(36).slice(2,9); }
    function debounce(fn, t){ let timer; return (...a)=>{ clearTimeout(timer); timer=setTimeout(()=>fn(...a), t); } }

    (function init(){
      if(!localStorage.getItem('ne_emps')){
        saveLocal([ { id: cryptoRandomId(), name:'Demo User', role:'Developer', email:'demo@example.com', phone:'9000000000', salary:30000 } ]);
      }
      load();
    })();

  </script>
</body>
</html>
