"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Plus, Star } from "lucide-react";
import { footerGroups, footerMap } from "./FooterData";

const origin="https://www.grupofreitasrenovacoes.pt";
const whatsapp="https://wa.me/351961455997?text=Ol%C3%A1%20Jorge%20Freitas%2C%20gostaria%20de%20pedir%20um%20or%C3%A7amento%20para%20obras%2Fremodela%C3%A7%C3%A3o%20em%20Aveiro.";

export default function OfficialFooter({asset,reduced,onToggleMotion}:{asset:(path:string)=>string,reduced:boolean,onToggleMotion:()=>void}){
 const [compact,setCompact]=useState(false),[expanded,setExpanded]=useState<boolean[]>([true,true,true]);
 useEffect(()=>{
  const q=window.matchMedia("(max-width:700px)");
  const update=()=>{setCompact(q.matches);setExpanded([!q.matches,!q.matches,!q.matches]);};
  update();q.addEventListener("change",update);return()=>q.removeEventListener("change",update);
 },[]);
 return <footer id="rodape" className="official-footer" data-header="light">
  <div className="of-container">
   <div className="of-hero" id="contacto">
    <div><a className="of-brand" href="#inicio" aria-label="Freitas Renovações — início"><img src={asset("/media/freitas-logo-official.svg")} width="2433" height="562" alt="Freitas Renovações" loading="lazy"/></a><p className="of-claim">Obras, remodelações e reabilitação em Aveiro — com alvará, garantia escrita e o empreiteiro presente em cada obra.</p></div>
    <div className="of-contact"><a className="of-phone" href="tel:+351961455997">961 455 997</a><span className="of-small">Chamada para a rede móvel nacional · +351 961 455 997</span><div className="of-actions"><a className="of-primary" href={whatsapp} target="_blank" rel="noopener noreferrer">Pedir Orçamento <ArrowRight size={16}/></a><a className="of-secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></div></div>
   </div>
   <div className="of-columns">
    <section className="of-contacts" aria-labelledby="of-contacts-heading"><h3 id="of-contacts-heading" className="of-heading">Contactos</h3><ul className="of-list"><li><a href="tel:+351961455997">961 455 997 (+351 961 455 997)</a></li><li><a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp: 961 455 997</a></li><li><a href="mailto:Freitasrenovacoes@gmail.com">Freitasrenovacoes@gmail.com</a></li><li>3800-212 Aveiro, Portugal</li></ul><a className="of-rating" href="https://maps.google.com/?cid=13914443692994943113" target="_blank" rel="noopener noreferrer"><Star size={13} fill="currentColor"/>4.9 no Google Business<ArrowUpRight size={13}/></a><div className="of-map"><iframe title="Freitas Renovações — Google Business Profile Aveiro" src={footerMap} width="100%" height="100%" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div></section>
    {footerGroups.map((group,i)=><section key={group.title} className="of-group" aria-labelledby={`of-heading-${i}`}><h3 className="of-heading" id={`of-heading-${i}`}>{compact?<button type="button" aria-expanded={expanded[i]} aria-controls={`of-links-${i}`} onClick={()=>setExpanded(current=>current.map((open,n)=>n===i?!open:open))}>{group.title}<Plus size={17} className={expanded[i]?"is-open":""}/></button>:group.title}</h3><ul id={`of-links-${i}`} className="of-list" hidden={compact&&!expanded[i]}>{group.links.map(([label,path])=><li key={path}><a href={path.startsWith("/")?origin+path:path} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul></section>)}
   </div>
   <div className="of-legal"><div><p>© {new Date().getFullYear()} Esboço Lisonjeiro, Unipessoal, Lda. — Freitas Renovações · Alvará N.º 124371-PAR (Empreiteiro de Obras Particulares) · NIPC 519 390 270</p><p className="of-insurance">3800-212 Aveiro, Portugal · Seguro de Responsabilidade Civil Ativo (Fidelidade / 150.000 €)</p></div><nav aria-label="Informação legal"><a href={`${origin}/privacidade`} target="_blank" rel="noopener noreferrer">Privacidade &amp; RGPD</a><a href={`${origin}/termos`} target="_blank" rel="noopener noreferrer">Termos e Condições</a></nav></div>
   <div className="of-utilities"><button type="button" onClick={onToggleMotion}>{reduced?"Ativar animações":"Reduzir movimento"}</button><a href="#inicio">Voltar ao início <ArrowUpRight size={15}/></a></div>
  </div>
 </footer>;
}
