const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let agents = [];
let jobs = [];
let balance = 0;

app.get('/', (req,res)=>{
  res.send('S8V Mini-Super Backend - Umar GNT Running ✅ | <a href="/admin">Go to Admin</a>');
});

// MINI-SUPER ADMIN PANEL
app.get('/admin',(req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width"><style>
body{font-family:sans-serif;padding:15px;background:#f5f5f5}
.card{background:white;padding:15px;border-radius:10px;margin-bottom:15px;box-shadow:0 2px 5px #0001}
input,button{padding:10px;margin:5px;width:90%;border-radius:8px;border:1px solid #ccc}
button{background:green;color:white;font-weight:bold}
</style></head><body>
<h2>🟢 GNT Mini-Super Admin</h2>
<div class="card">
<b>Total Agents:</b> ${agents.length} | <b>Total Jobs:</b> ${jobs.length} | <b>Profit:</b> ₦${balance}
</div>
<div class="card">
<h3>Add New Agent</h3>
<input id="name" placeholder="Agent Full Name">
<input id="phone" placeholder="Phone e.g 0803...">
<input id="loc" placeholder="Location e.g Abuja">
<input id="price" value="2800" placeholder="Price for agent">
<button onclick="addAgent()">Add Agent</button>
</div>
<div class="card">
<h3>Your Agents</h3>
${agents.map((a,i)=>`<p><b>${i+1}. ${a.name}</b> - ${a.phone} - ${a.loc} - Price: ₦${a.price}</p>`).join('') || 'No agents yet'}
</div>
<div class="card">
<h3>All Jobs</h3>
${jobs.map(j=>`<p>${j.agent} - ${j.customer} - ${j.date}</p>`).join('') || 'No jobs yet'}
</div>
<script>
async function addAgent(){
let data={name:document.getElementById('name').value, phone:document.getElementById('phone').value, loc:document.getElementById('loc').value, price:document.getElementById('price').value}
let r=await fetch('/api/agents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
alert('Agent Added!');
location.reload();
}
</script>
</body></html>
`);
});

// API
app.post('/api/agents',(req,res)=>{
agents.push(req.body);
res.json({ok:true});
});
app.get('/api/agents',(req,res)=>res.json(agents));

app.post('/api/personalize',(req,res)=>{
jobs.push({...req.body, date:new Date().toLocaleString()});
balance+=300;
res.json({success:true, id:'GNT-'+Date.now()});
});

const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('Mini-Super running'));