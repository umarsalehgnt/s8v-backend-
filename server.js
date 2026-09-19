
require('dotenv').config();
const express=require('express');
const axios=require('axios');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json({limit:'10mb'}));
const TOKEN=process.env.S8V_TOKEN;
const BASE="https://www.s8v.ng/api";
const ADMIN_EMAIL="admin@s8v.ng";
const ADMIN_PASS="admin123";

app.get('/',(req,res)=>res.send(`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>S8V Login</title>
<style>
body{font-family:Arial;background:#0f172a;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:15px}
.card{background:#1e293b;padding:30px;border-radius:16px;width:100%;max-width:380px}
input{width:100%;padding:13px;margin:8px 0;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff;box-sizing:border-box}
button{width:100%;padding:13px;background:#3b82f6;border:none;border-radius:10px;color:#fff;font-weight:bold;font-size:16px;cursor:pointer}
h2{text-align:center;color:#38bdf8}
.small{color:#94a3b8;font-size:13px;text-align:center;margin-top:15px}
</style></head><body>
<div class="card"><h2>🔐 S8V BACKEND</h2>
<p style="text-align:center;color:#94a3b8">Admin Access Only</p>
<input id="email" placeholder="Email" value="${ADMIN_EMAIL}">
<input id="pass" type="password" placeholder="Password">
<button onclick="login()">Login</button>
<p id="msg" class="small"></p></div>
<script>
async function login(){
 let e=email.value,p=pass.value;
 msg.innerText="Checking...";
 let r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})});
 let d=await r.json();
 if(d.success){msg.innerText="✅ Success!"; localStorage.setItem('s8v','ok'); location.href='/dashboard'}
 else msg.innerText="❌ "+d.message;
}
</script></body></html>
`));

app.get('/dashboard',(req,res)=>res.send(`
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>S8V Dashboard</title>
<style>
body{font-family:Arial;background:#0f172a;color:#fff;margin:0;padding:15px}
.box{background:#1e293b;padding:20px;border-radius:16px;margin:15px auto;max-width:500px}
input,select{width:100%;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff;box-sizing:border-box}
button{padding:12px 18px;border:none;border-radius:10px;font-weight:bold;cursor:pointer;margin:5px 2px}
.btn-green{background:#22c55e;color:#fff;width:48%}
.btn-blue{background:#3b82f6;color:#fff;width:48%}
.btn-full{width:100%;background:#3b82f6;color:#fff}
label{font-size:13px;color:#94a3b8;margin-top:8px;display:block}
#preview{width:100px;height:100px;border-radius:10px;object-fit:cover;border:2px solid #334155;display:none;margin:10px auto}
pre{background:#0f172a;padding:15px;border-radius:10px;overflow:auto;color:#22c55e;font-size:12px;max-height:300px}
h2{color:#38bdf8;text-align:center}
h3{color:#e2e8f0;margin:10px 0}
</style></head><body>
<h2>✅ S8V Full Dashboard</h2>
<div class="box">
<h3>📝 Personalization Form</h3>
<label>Tracking ID *</label>
<input id="tid" placeholder="S1E9NVQ8BQU0BHK">
<label>Type</label>
<select id="type"><option value="standard">standard</option><option value="info">info</option><option value="premium">premium</option></select>
<label>First Name</label><input id="fn" placeholder="First Name">
<label>Middle Name</label><input id="mn" placeholder="Middle Name">
<label>Last Name</label><input id="ln" placeholder="Last Name">
<label>Date of Birth</label><input id="dob" type="date">
<label>Gender</label><select id="gender"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select>
<label>ID Number</label><input id="idnum" placeholder="ID Number">
<label>Photo (Camera)</label>
<input id="photoInput" type="file" accept="image/*" capture="environment">
<img id="preview">
<button class="btn-full" onclick="sendFull()">🚀 Submit Personalization</button>
<div style="display:flex;justify-content:space-between">
<button class="btn-green" onclick="check()">🔍 Check Status</button>
<button class="btn-blue" onclick="document.getElementById('out').innerText='Cleared'">Clear</button>
</div>
<pre id="out">Result will show here...</pre>
</div>
<a href="/" style="color:#38bdf8;display:block;text-align:center;margin:20px">← Logout</a>
<script>
let photoBase64=null;
photoInput.onchange=e=>{
 let file=e.target.files[0];
 let r=new FileReader();
 r.onload=()=>{
  photoBase64=r.result;
  preview.src=r.result;
  preview.style.display='block';
 };
 r.readAsDataURL(file);
};
async function sendFull(){
 let tid=tidEl.value.trim(); if(!tid){alert('Enter Tracking ID'); return}
 out.innerText="Sending...";
 let payload={
  tracking_id:tid.toUpperCase(),
  type:type.value,
  firstName:fn.value,
  middleName:mn.value,
  lastName:ln.value,
  dateOfBirth:dob.value,
  gender:gender.value,
  idNumber:idnum.value,
  photo:photoBase64
 };
 try{
  let r=await fetch('/api/personalize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  let d=await r.json();
  out.innerText=JSON.stringify(d,null,2);
 }catch(e){out.innerText="Error: "+e}
}
async function check(){
 let tid=document.getElementById('tid').value.trim(); if(!tid){alert('Enter Tracking ID'); return}
 out.innerText="Checking...";
 let r=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tracking_id:tid})});
 let d=await r.json();
 out.innerText=JSON.stringify(d,null,2);
}
const tidEl=document.getElementById('tid');
</script></body></html>
`));

app.post('/api/login',(req,res)=>{
 if(req.body.email===ADMIN_EMAIL && req.body.password===ADMIN_PASS)
  res.json({success:true,token:"s8v_"+Date.now()});
 else res.status(401).json({success:false,message:"Invalid login"});
});

app.post('/api/personalize',async(req,res)=>{
 try{
  const payload={token:TOKEN,tracking_id:req.body.tracking_id.toUpperCase(),type:req.body.type||"standard"};
  if(req.body.firstName) payload.firstName=req.body.firstName;
  if(req.body.middleName) payload.middleName=req.body.middleName;
  if(req.body.lastName) payload.lastName=req.body.lastName;
  if(req.body.dateOfBirth) payload.dateOfBirth=req.body.dateOfBirth;
  if(req.body.gender) payload.gender=req.body.gender;
  if(req.body.idNumber) payload.idNumber=req.body.idNumber;
  if(req.body.photo) payload.photo=req.body.photo;
  const r=await axios.post(BASE+"/personalization",payload);
  res.json(r.data);
 }catch(e){res.status(500).json(e.response?.data||{error:e.message})}
});
app.post('/api/check',async(req,res)=>{
 try{
  let p={token:TOKEN};
  if(req.body.id) p.id=req.body.id; else p.tracking_id=req.body.tracking_id.toUpperCase();
  const r=await axios.post(BASE+"/personalization/check",p);
  res.json(r.data);
 }catch(e){res.status(500).json(e.response?.data||{error:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('S8V Full Running'));