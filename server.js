require('dotenv').config();
const express=require('express');
const axios=require('axios');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json());
const TOKEN=process.env.S8V_TOKEN;
const BASE="https://www.s8v.ng/api";

// ADMIN LOGIN - Change these!
const ADMIN_EMAIL="admin@s8v.ng";
const ADMIN_PASS="admin123";

// LOGIN PAGE
app.get('/',(req,res)=>res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>S8V Backend Login</title>
<style>
body{font-family:Arial;background:#0f172a;color:white;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:15px}
.card{background:#1e293b;padding:30px;border-radius:16px;width:100%;max-width:380px;box-shadow:0 20px 40px rgba(0,0,0,.6)}
input{width:100%;padding:13px;margin:8px 0;border-radius:10px;border:1px solid #334155;background:#0f172a;color:white;box-sizing:border-box}
button{width:100%;padding:13px;background:#3b82f6;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;margin-top:12px;font-size:16px}
button:hover{background:#2563eb}
h2{text-align:center;color:#38bdf8;margin:0}
.small{color:#94a3b8;font-size:13px;text-align:center;margin-top:15px}
.status{padding:10px;border-radius:8px;text-align:center;margin:10px 0;background:#334155}
a{color:#38bdf8;text-decoration:none}
</style></head>
<body>
<div class="card">
<h2>🔐 S8V BACKEND</h2>
<p style="text-align:center;color:#94a3b8">Proxy Running</p>
<div class="status">✅ Server: ONLINE<br>API: ${BASE}</div>
<input id="email" placeholder="Email" value="${ADMIN_EMAIL}">
<input id="pass" type="password" placeholder="Password">
<button onclick="login()">Login to Dashboard</button>
<p id="msg" class="small"></p>
<p class="small">Default: admin@s8v.ng / admin123<br><br><a href="/api/personalize" target="_blank">API Docs</a></p>
</div>
<script>
async function login(){
 let e=document.getElementById('email').value;
 let p=document.getElementById('pass').value;
 let m=document.getElementById('msg');
 m.innerText="Checking...";
 try{
  let r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})});
  let d=await r.json();
  if(d.success){m.innerText="✅ Success! Redirecting..."; localStorage.setItem('s8v_admin',d.token); setTimeout(()=>location.href='/dashboard',500)}
  else m.innerText="❌ "+d.message;
 }catch(err){m.innerText="❌ Connection error"}
}
</script></body></html>
`));

app.get('/dashboard',(req,res)=>res.send(`
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dashboard</title>
<style>body{font-family:Arial;background:#0f172a;color:white;padding:20px} .box{background:#1e293b;padding:20px;border-radius:12px;margin:15px 0}
input,select{padding:10px;margin:5px;border-radius:8px;border:none;width:100%;box-sizing:border-box}
button{padding:12px 20px;background:#22c55e;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer}
pre{background:#0f172a;padding:15px;border-radius:8px;overflow:auto;color:#22c55e}</style></head>
<body><h2>✅ S8V Dashboard</h2>
<div class="box"><h3>Personalization API</h3>
<input id="tid" placeholder="Tracking ID e.g. S7Y0OG319000HEM">
<select id="type"><option value="standard">standard</option><option value="info">info</option><option value="premium">premium</option></select>
<button onclick="sendPer()">Send Personalization</button>
<button onclick="checkPer()" style="background:#3b82f6">Check Result</button>
<pre id="out">Result will show here...</pre>
</div>
<script>
async function sendPer(){
 let tid=document.getElementById('tid').value;
 let type=document.getElementById('type').value;
 document.getElementById('out').innerText="Sending...";
 let r=await fetch('/api/personalize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tracking_id:tid,type})});
 let d=await r.json();
 document.getElementById('out').innerText=JSON.stringify(d,null,2);
}
async function checkPer(){
 let tid=document.getElementById('tid').value;
 document.getElementById('out').innerText="Checking...";
 let r=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tracking_id:tid})});
 let d=await r.json();
 document.getElementById('out').innerText=JSON.stringify(d,null,2);
}
</script>
<br><a href="/" style="color:#38bdf8">← Logout</a></body></html>
`));

app.post('/api/login',(req,res)=>{
 if(req.body.email===ADMIN_EMAIL && req.body.password===ADMIN_PASS){
  res.json({success:true,token:"s8v_admin_"+Date.now(),message:"Login successful"});
 } else {
  res.status(401).json({success:false,message:"Invalid email or password"});
 }
});

app.post('/api/personalize',async(req,res)=>{
 try{
  const r=await axios.post(`${BASE}/personalization`,{token:TOKEN,tracking_id:req.body.tracking_id.toUpperCase(),type:req.body.type||"standard"});
  res.json(r.data);
 }catch(e){res.status(500).json(e.response?.data||{error:"fail"})}
});
app.post('/api/check',async(req,res)=>{
 try{
  let p={token:TOKEN};
  if(req.body.id) p.id=req.body.id; else p.tracking_id=req.body.tracking_id.toUpperCase();
  const r=await axios.post(`${BASE}/personalization/check`,p);
  res.json(r.data);
 }catch(e){res.status(500).json(e.response?.data||{error:"fail"})}
});
app.listen(process.env.PORT||3000,()=>console.log('S8V Running'));