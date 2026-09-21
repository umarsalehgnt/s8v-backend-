const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

// --- PERMANENT STORAGE ---
function load(file, def){ try{ if(fs.existsSync(file)) return JSON.parse(fs.readFileSync(file)); }catch(e){} return def; }
function save(file, data){ fs.writeFileSync(file, JSON.stringify(data)); }
let agents = load('./agents.json', [{name:"umar saleh", phone:"07031387033", loc:"JIGAWA", price:"2800"}]);
let jobs = load('./jobs.json', []);
let balance = load('./balance.json', 0);

app.get('/', (req,res)=>res.send(`GNT Backend Running ✅ | Agents: ${agents.length} | Jobs: ${jobs.length} | <a href="/admin">Admin</a> | <a href="/agent">Agent Login</a>`));

// === ADMIN ===
app.get('/admin',(req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width"><style>
body{font-family:sans-serif;padding:15px;background:#f5f5f5}
.card{background:white;padding:15px;border-radius:10px;margin-bottom:15px}
input,button,select{padding:10px;margin:5px;width:92%;border-radius:8px;border:1px solid #ccc}
button{background:green;color:white;font-weight:bold}
</style></head><body>
<h2>🟢 GNT Mini-Super Admin PERMANENT</h2>
<div class="card"><b>Agents:</b> ${agents.length} | <b>Jobs:</b> ${jobs.length} | <b>Profit:</b> ₦${balance} <br><small>Data saved permanently ✅</small></div>
<div class="card"><h3>Add Agent</h3><input id="name" placeholder="Name"><input id="phone" placeholder="Phone"><input id="loc" placeholder="Location"><input id="price" value="2800"><button onclick="addAgent()">Add Agent</button></div>
<div class="card"><h3>Assign Job</h3><select id="agn">${agents.map(a=>`<option value="${a.phone}">${a.name} - ${a.loc}</option>`).join('')}</select><input id="cust" placeholder="Customer Name"><input id="cphone" placeholder="Customer Phone"><button onclick="addJob()">Assign</button></div>
<div class="card"><h3>Agents</h3>${agents.map((a,i)=>`<p>${i+1}. ${a.name} - ${a.phone} - ${a.loc} - <a href="/agent/dashboard?phone=${a.phone}">Jobs</a></p>`).join('')}</div>
<div class="card"><h3>All Jobs</h3>${jobs.map(j=>`<p>To: ${j.agentName} | ${j.customer} (${j.cphone}) - ${j.date} - <b>${j.status}</b></p>`).join('')||'No jobs'}</div>
<script>
async function addAgent(){let d={name:document.getElementById('name').value,phone:document.getElementById('phone').value,loc:document.getElementById('loc').value,price:document.getElementById('price').value};await fetch('/api/agents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
async function addJob(){let d={agentPhone:document.getElementById('agn').value,customer:document.getElementById('cust').value,cphone:document.getElementById('cphone').value};await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
</script>
</body></html>
`);
});

app.get('/agent',(req,res)=>{res.send(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:sans-serif;padding:20px;background:#e8f5e9;text-align:center}.card{background:white;padding:20px;border-radius:12px;max-width:350px;margin:auto}input,button{padding:12px;margin:8px;width:90%;border-radius:8px;border:1px solid #ccc}button{background:#2e7d32;color:white;font-weight:bold}</style></head><body><div class="card"><h2>Agent Login</h2><input id="phone" placeholder="07031387033"><button onclick="login()">Login</button></div><script>function login(){location.href='/agent/dashboard?phone='+document.getElementById('phone').value;}</script></body></html>`);});

app.get('/agent/dashboard',(req,res)=>{
let phone=req.query.phone; let agent=agents.find(a=>a.phone===phone);
if(!agent) return res.send(`<h3>Not found ${phone}</h3><a href="/agent">Back</a>`);
let myJobs=jobs.filter(j=>j.agentPhone===phone);
res.send(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:sans-serif;padding:15px;background:#f0f0f0}.card{background:white;padding:15px;border-radius:10px;margin-bottom:12px}.badge{padding:4px 8px;border-radius:6px;color:white}.pending{background:orange}.done{background:green}button{padding:8px;border-radius:6px;border:none;background:green;color:white}</style></head><body><h2>Welcome ${agent.name} 👋</h2><p>${agent.phone} | ${agent.loc}</p><div class="card"><h3>My Jobs (${myJobs.length})</h3>${myJobs.map((j,i)=>`<div style="border-bottom:1px solid #ddd;padding:8px 0"><b>${i+1}. ${j.customer}</b> - ${j.cphone}<br>${j.date}<br><span class="badge ${j.status==='done'?'done':'pending'}">${j.status}</span> ${j.status!=='done'?`<button onclick="done('${j.id}')">Mark Done</button>`:''}</div>`).join('')||'No jobs'}</div><a href="/agent">Logout</a><script>async function done(id){await fetch('/api/jobs/'+id+'/done',{method:'POST'});location.reload();}</script></body></html>`);
});

// APIs - WITH SAVE
app.post('/api/agents',(req,res)=>{agents.push(req.body); save('./agents.json', agents); res.json({ok:true});});
app.get('/api/agents',(req,res)=>res.json(agents));
app.post('/api/jobs',(req,res)=>{
let ag=agents.find(a=>a.phone===req.body.agentPhone);
let