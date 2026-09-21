const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let agents = [{name:"umar saleh", phone:"07031387033", loc:"JIGAWA", price:"2800"}];
let jobs = [];
let balance = 0;

app.get('/', (req,res)=>res.send('S8V Running | <a href="/admin">Admin</a> | <a href="/agent">Agent Login</a>'));

// === SUPER ADMIN ===
app.get('/admin',(req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width"><style>
body{font-family:sans-serif;padding:15px;background:#f5f5f5}
.card{background:white;padding:15px;border-radius:10px;margin-bottom:15px}
input,button,select{padding:10px;margin:5px;width:92%;border-radius:8px;border:1px solid #ccc}
button{background:green;color:white;font-weight:bold}
</style></head><body>
<h2>🟢 GNT Mini-Super Admin</h2>
<div class="card"><b>Agents:</b> ${agents.length} | <b>Jobs:</b> ${jobs.length} | <b>Profit:</b> ₦${balance}</div>
<div class="card"><h3>Add Agent</h3>
<input id="name" placeholder="Agent Name"><input id="phone" placeholder="Phone 0703..."><input id="loc" placeholder="Location"><input id="price" value="2800"><button onclick="addAgent()">Add Agent</button></div>
<div class="card"><h3>Assign Job (Manual)</h3>
<select id="agn">${agents.map(a=>`<option value="${a.phone}">${a.name} - ${a.loc}</option>`).join('')}</select>
<input id="cust" placeholder="Customer Name"><input id="cphone" placeholder="Customer Phone">
<button onclick="addJob()">Assign Job</button></div>
<div class="card"><h3>Your Agents</h3>${agents.map((a,i)=>`<p>${i+1}. ${a.name} - ${a.phone} - ${a.loc} - ₦${a.price} - <a href="/agent/dashboard?phone=${a.phone}">View Jobs</a></p>`).join('')}</div>
<div class="card"><h3>All Jobs</h3>${jobs.map(j=>`<p>To: ${j.agentName} | Customer: ${j.customer} (${j.cphone}) - ${j.date} - <b>${j.status}</b></p>`).join('')||'No jobs yet'}</div>
<script>
async function addAgent(){let d={name:name.value,phone:phone.value,loc:loc.value,price:price.value};await fetch('/api/agents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
async function addJob(){let d={agentPhone:document.getElementById('agn').value, customer:cust.value, cphone:cphone.value};await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}
</script>
</body></html>
`);
});

// === AGENT LOGIN ===
app.get('/agent',(req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width"><style>
body{font-family:sans-serif;padding:20px;background:#e8f5e9;text-align:center}
.card{background:white;padding:20px;border-radius:12px;max-width:350px;margin:auto}
input,button{padding:12px;margin:8px;width:90%;border-radius:8px;border:1px solid #ccc}
button{background:#2e7d32;color:white;font-weight:bold}
</style></head><body>
<div class="card">
<h2>Agent Login</h2>
<p>Enter your registered phone</p>
<input id="phone" placeholder="07031387033">
<button onclick="login()">Login</button>
</div>
<script>
function login(){let p=document.getElementById('phone').value; if(!p){alert('Enter phone');return;} location.href='/agent/dashboard?phone='+p;}
</script>
</body></html>
`);
});

app.get('/agent/dashboard',(req,res)=>{
let phone=req.query.phone;
let agent=agents.find(a=>a.phone===phone);
if(!agent) return res.send(`<h3>Agent not found: ${phone}</h3><a href="/agent">Try again</a>`);
let myJobs=jobs.filter(j=>j.agentPhone===phone);
res.send(`
<html><head><meta name="viewport" content="width=device-width"><style>
body{font-family:sans-serif;padding:15px;background:#f0f0f0}
.card{background:white;padding:15px;border-radius:10px;margin-bottom:12px}
.badge{padding:4px 8px;border-radius:6px;color:white}
.pending{background:orange}.done{background:green}
button{padding:8px 12px;border-radius:6px;border:none;background:green;color:white}
</style></head><body>
<h2>Welcome ${agent.name} 👋</h2>
<p>${agent.phone} | ${agent.loc} | Price: ₦${agent.price}</p>
<div class="card"><h3>My Jobs (${myJobs.length})</h3>
${myJobs.map((j,i)=>`<div style="border-bottom:1px solid #ddd;padding:8px 0"><b>${i+1}. ${j.customer}</b> - ${j.cphone}<br> Date: ${j.date}<br>Status: <span class="badge ${j.status==='done'?'done':'pending'}">${j.status}</span> ${j.status!=='done'?`<button onclick="done('${j.id}')">Mark Done</button>`:''}</div>`).join('')||'No jobs yet assigned to you'}
</div>
<a href="/agent">Logout</a>
<script>
async function done(id){await fetch('/api/jobs/'+id+'/done',{method:'POST'});location.reload();}
</script>
</body></html>
`);
});

// APIs
app.post('/api/agents',(req,res)=>{agents.push(req.body);res.json({ok:true});});
app.get('/api/agents',(req,res)=>res.json(agents));
app.post('/api/jobs',(req,res)=>{
let ag=agents.find(a=>a.phone===req.body.agentPhone);
let job={id:Date.now().toString(), agentPhone:req.body.agentPhone, agentName:ag?ag.name:'Unknown', customer:req.body.customer, cphone:req.body.cphone, date:new Date().toLocaleString(), status:'pending'};
jobs.push(job); balance+=200; res.json({ok:true, job});
});
app.post('/api/jobs/:id/done',(req,res)=>{let j=jobs.find(x=>x.id===req.params.id); if(j) j.status='done'; res.json({ok:true});});
app.post('/api/personalize',(req,res)=>{jobs.push({id:Date.now().toString(), agentPhone:agents[0]?.phone||'', agentName:agents[0]?.name||'', customer:req.body.customer||'Customer', cphone:req.body.phone||'', date:new Date().toLocaleString(), status:'pending'}); balance+=200; res.json({success:true});});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('Mini-Super with Login running'));