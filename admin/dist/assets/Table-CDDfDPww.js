import{r as x,j as e}from"./index-CKmNYwFX.js";import{c as y}from"./createLucideIcon-BTb7dXNF.js";const f=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],j=y("printer",f);function v({columns:i,data:l,keyExtractor:h,footer:r,rowClassName:m,printEnable:p=!1,printHeader:c}){const d=x.useRef(null),b=()=>{const n=d.current;if(!n)return;let s="";document.querySelectorAll("link[rel='stylesheet'], style").forEach(u=>{s+=u.outerHTML});const a=`
      <html>
        <head>
          <title>Print</title>
          ${s}
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
              * { background: white !important; background-color: white !important; box-shadow: none !important; }
              #no-print, .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${n.innerHTML}
        </body>
      </html>
    `,t=document.createElement("iframe");t.style.position="absolute",t.style.width="0",t.style.height="0",t.style.border="none",document.body.appendChild(t);const o=t.contentDocument||t.contentWindow?.document;o&&(o.open(),o.write(a),o.close(),t.onload=()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},500)})};return e.jsxs("div",{className:"overflow-x-auto w-full",children:[p&&e.jsx("div",{className:"flex justify-end mb-2 no-print",children:e.jsxs("button",{onClick:b,className:"global_button flex items-center gap-1",children:[e.jsx(j,{size:14}),e.jsx("span",{children:"Print"})]})}),e.jsxs("div",{ref:d,children:[c&&e.jsx("div",{className:"mb-3",children:c}),e.jsxs("table",{className:"global_table",children:[e.jsx("thead",{className:"global_thead",children:e.jsx("tr",{children:i.map((n,s)=>e.jsx("th",{className:`global_th ${n.printHide?"no-print":""} ${n.headerClassName??n.className??""}`,children:n.header},s))})}),e.jsx("tbody",{className:"global_tbody",children:l.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:i.length,className:"text-center py-6 text-sm opacity-50",children:"No data found"})}):l.map((n,s)=>e.jsxs("tr",{className:`global_tr ${m?.(n)??""}`,children:[" ",i.map((a,t)=>e.jsx("td",{className:`global_td ${a.printHide?"no-print":""} ${a.className??""}`,children:typeof a.accessor=="function"?a.accessor(n,s):n[a.accessor]},t))]},h(n,s)))}),r&&r(i.length)]})]})]})}export{v as T};
