const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

function load(f,d){try{if(fs.existsSync(f))return JSON.parse(fs.readFileSync(f));}catch(e){}return d;}
function save(f,d){fs.writeFileSync(f,JSON.stringify(d));}
let agents=load('./agents.json',[{name:"umar saleh",phone:"07031387033",loc:"JIGAWA",price:"2800"}]);
let jobs=load('./jobs.json',[]);
let balance=load('./balance.json',0);

// CUSTOMER ORDER PAGE - THIS IS YOUR GNT-PERSONALIZE FRONTEND!
app.get('/',(req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width"><title>GNT Personalize</title>
<style>body{font-family:sans-serif;padding:15px;background:#fff7ed}.card{background:white;padding:20px;border-radius:12px;max-width:400px;margin:auto;box-shadow:0 4px 10px #0001} input,select,button{padding:12px;margin:6px 0;width:95%;border-radius:8px;border:1px solid #ccc} button{background:#ff6a00;color:white;font-weight:bold;font-size:16px} h2{color:#ff6a00}</style>
</head><body>
<div class="card">
<h2>🎁 GNT Personalize Order</h2>
<p>Order your custom gift - we deliver via our agents!</p>
<input id="cust" placeholder="Your Name">
<input id="phone" placeholder="Your Phone">
<select id="loc"><option>Abuja</option><option>JIGAWA</option><option>Kano</option><option>Lagos</option><option>Kaduna</option><option>Other</option></select>
<input id="gift" placeholder="Gift Type e.g Mug, Frame">
<button onclick="order()">Place Order - ₦3000</button>
<p id="msg"></p>
<hr>
<small><a href="/admin">Super Admin Login</a> | <a href="/agent">Agent Login</a></small>
</div>
<script>
async function order(){
 let b={customer:document.getElementById('cust').value, phone:document.getElementById('phone').value, location:document.getElementById('loc').value, gift:document.getElementById('gift').value};
 if(!b.customer||!b.phone){alert('Fill name & phone');return;}
 document.getElementById('msg').innerText='Placing...';
 let r=await fetch('/api/personalize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
 let d=await r.json();
 document.getElementById('msg').innerHTML='✅ Order Success! ID: '+d.id+'<br>Assigned to: '+d.assignedTo+'<br>Agent will call you soon!';
}
</script>
</body></html>
`);
});

app.get('/admin',(req,res)=>{res.send(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:sans-serif;padding:15px;background:#f5f5f5}.card{background:white;padding:15px;border-radius:10px;margin-bottom:15px}input,button,select{padding:10px;margin:5px;width:92%;border-radius:8px;border:1px solid #ccc}button{background:green;color:white;font-weight:bold}</style></head><body><h2>🟢 Mini-Super Admin PERMANENT</h2><div class="card"><b>Agents:</b> ${agents.length} | <b>Jobs:</b> ${jobs.length} | <b>Profit:</b> ₦${balance}</div><div class="card"><h3>Add Agent</h3><input id="name" placeholder="Name"><input id="phone" placeholder="Phone"><input id="loc" placeholder="Loc"><input id="price" value="2800"><button onclick="addAgent()">Add</button></div><div class="card"><h3>Assign Job</h3><select id="agn">${agents.map(a=>`<option value="${a.phone}">${a.name}-${a.loc}</option>`).join('')}</select><input id="cust" placeholder="Cust Name"><input id="cphone" placeholder="Cust Phone"><button onclick="addJob()">Assign</button></div><div class="card"><h3>Agents</h3>${agents.map((a,i)=>`<p>${i+1}. ${a.name}-${a.phone}-${a.loc}</p>`).join('')}</div><div class="card"><h3>All Jobs</h3>${jobs.map(j=>`<p>To:${j.agentName}|${j.customer}(${j.cphone})-${j.location||''}-${j.date}-${j.status}</p>`).join('')||'No jobs'}</div><script>async function addAgent(){let d={name:name.value,phone:phone.value,loc:loc.value,price:price.value};await fetch('/api/agents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}async function addJob(){let d={agentPhone:agn.value,customer:cust.value,cphone:cphone.value};await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});location.reload();}</script></body></html>`);});

app.get('/agent',(req,res)=>{res.send(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:sans-serif;padding:20px;background:#e8f5e9;text-align:center}.card{background:white;padding:20px;border-radius:12px;max-width:350px;margin:auto}input,button{padding:12px;margin:8px;width:90%;border-radius:8px;border:1px solid #ccc}button{background:#2e7d32;color:white}</style></head><body><div class="card"><h2>Agent Login</h2><input id="phone" placeholder="07031387033"><button onclick="login()">Login</button></div><script>function login(){location.href='/agent/dashboard?phone='+phone.value;}</script></body></html>`);});
app.get('/agent/dashboard',(req,res)=>{let phone=req.query.phone;let agent=agents.find(a=>a.phone===phone);if(!agent)return res.send(`Not found <a href="/agent">Back</a>`);let myJobs=jobs.filter(j=>j.agentPhone===phone);res.send(`<html><head><meta name="viewport" content="width=device-width"><style>body{font-family:sans-serif;padding:15px;background:#f0f0f0}.card{background:white;padding:15px;border-radius:10px}.badge{padding:4px 8px;border-radius:6px;color:white}.pending{background:orange}.done{background:green}button{padding:8px;border-radius:6px;border:none;background:green;color:white}</style></head><body><h2>Welcome ${agent.name}</h2><div class="card"><h3>My Jobs (${myJobs.length})</h3>${myJobs.map((j,i)=>`<div style="border-bottom:1px solid #ddd;padding:8px 0"><b>${i+1}. ${j.customer}</b>-${j.cphone}-${j.location||''}<br>${j.date}<br><span class="badge ${j.status==='done'?'done':'pending'}">${j.status}</span> ${j.status!=='done'?`<button onclick="done('${j.id}')">Mark Done</button>`:''}</div>`).join('')||'No jobs'}</div><a href="/agent">Logout</a><script>async function done(id){await fetch('/api/jobs/'+id+'/done',{method:'POST'});location.reload();}</script></body></html>`);});

app.post('/api/agents',(req,res)=>{agents.push(req.body);save('./agents.json',agents);res.json({ok:true});});
app.get('/api/agents',(req,res)=>res.json(agents));
app.post('/api/jobs',(req,res)=>{let ag=agents.find(a=>a.phone===req.body.agentPhone);let job={id:Date.now().toString(),agentPhone:req.body.agentPhone,agentName:ag?ag.name:'',customer:req.body.customer,cphone:req.body.cphone,date:new Date().toLocaleString(),status:'pending',location:req.body.location||''};jobs.push(job);balance+=200;save('./jobs.json',jobs);save('./balance.json',balance);res.json({ok:true});});
app.post('/api/jobs/:id/done',(req,res)=>{let j=jobs.find(x=>x.id===req.params.id);if(j){j.status='done';save('./jobs.json',jobs);}res.json({ok:true});});
app.post('/api/personalize',(req,res)=>{let ag=agents[0];if(req.body.location){let f=agents.find(a=>a.loc.toLowerCase().includes(req.body.location.toLowerCase()));if(f)ag=f;}let job={id:'GNT-'+Date.now(),agentPhone:ag?ag.phone:'',agentName:ag?ag.name:'',customer:req.body.customer||'Online',cphone:req.body.phone||'',date:new Date().toLocaleString(),status:'pending',location:req.body.location||'',gift:req.body.gift||''};jobs.push(job);balance+=200;save('./jobs.json',jobs);save('./balance.json',balance);res.json({success:true,id:job.id,assignedTo:ag?ag.name:''});});

app.listen(process.env.PORT||10000,()=>console.log('Full GNT System Running'));
