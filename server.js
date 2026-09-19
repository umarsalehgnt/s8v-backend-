require('dotenv').config();
const express=require('express');
const axios=require('axios');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json());
const TOKEN=process.env.S8V_TOKEN;
const BASE="https://www.s8v.ng/api";
app.get('/',(req,res)=>res.send('S8V Proxy Running'));
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
app.listen(process.env.PORT||3000,()=>console.log("Running"));
