import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
export const alt = `${brand.name} — ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpengraphImage() {
 return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:72,background:"#fafaf7",color:"#12201a"}}>
  <div style={{display:"flex",alignItems:"center",gap:20}}><div style={{width:64,height:64,borderRadius:18,background:"#148062",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><div style={{width:16,height:32,borderRadius:4,background:"#fff"}}/><div style={{width:16,height:32,borderRadius:4,background:"rgba(255,255,255,0.55)"}}/></div><div style={{fontSize:40,fontWeight:700}}>{brand.name}</div></div>
  <div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{fontSize:84,fontWeight:700,lineHeight:1.05,letterSpacing:-2}}>Read the NCERT page.</div><div style={{fontSize:84,fontWeight:700,lineHeight:1.05,letterSpacing:-2,color:"#116750"}}>Practise that same page.</div></div>
  <div style={{fontSize:30,color:"#3b4a43"}}>{`${brand.exam} · Biology first · Opening soon`}</div>
 </div>,size);
}
