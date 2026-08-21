const l=(n,d={})=>{if(!n?.current){console.error("No element found to print");return}const{title:a="Invoice"}=d,e=n.current.outerHTML;let i="";document.querySelectorAll("link[rel='stylesheet'], style").forEach(r=>{i+=r.outerHTML});const c=`
    <html>
      <head>
        <title>${a}</title>
        ${i}
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            * {
              background: white !important;
              background-color: white !important;
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              color: black !important;
            }
            #no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${e}
      </body>
    </html>
  `,t=document.createElement("iframe");t.style.position="absolute",t.style.width="0",t.style.height="0",t.style.border="none",document.body.appendChild(t);const o=t.contentDocument||t.contentWindow?.document;o&&(o.open(),o.write(c),o.close(),t.onload=()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(t)},500)})},s=(n,d={})=>{if(!n?.current){console.error("No element found to print");return}const{title:a="Receipt",paperWidth:e="58mm"}=d,i=n.current.outerHTML,c=`
    <html>
      <head>
        <title>${a}</title>
        <style>
          * {
            margin: 0;
            padding: 2px;
            box-sizing: border-box;
          }

          body {
            width: ${e};
            max-width: ${e};
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }

          @media print {
            @page {
              size: ${e} auto; /* auto height = continuous/roll paper */
              margin: 0;
            }

            html, body {
              width: ${e};
              margin: 0;
              padding: 0;
            }

            * {
              color: black !important;
              background: white !important;
              background-color: white !important;
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
            }

            #no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${i}
      </body>
    </html>
  `,t=document.createElement("iframe");t.style.position="absolute",t.style.top="-9999px",t.style.left="-9999px",t.style.width=e,t.style.height="0",t.style.border="none",t.style.visibility="hidden",document.body.appendChild(t);const o=t.contentDocument||t.contentWindow?.document;o&&(o.open(),o.write(c),o.close(),t.onload=()=>{t.contentWindow?.focus(),t.contentWindow?.print(),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},1e3)})},p=(n,d={})=>{if(!n?.current){console.error("No elements found to print barcode");return}const{title:a="Barcode-Sticker",paperWidth:e="50mm",paperHeight:i="30mm"}=d,c=n.current.innerHTML,t=`
    <html>
      <head>
        <title>${a}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            width: ${e};
            max-width: ${e};
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
          }

          /* বারকোড র‍্যাপার স্টাইলিং */
          .print-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0px;
          }

          /* প্রতিটি বারকোড কার্ডকে একটি নির্দিষ্ট পেজ ব্রেক হিসেবে গণ্য করা হবে */
          .barcode-card {
            width: ${e};
            height: ${i};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px;
            background: white;
            page-break-after: always; /* প্রতিটি স্টিকারের পর নতুন পেজ বা রোল পুশ হবে */
            break-after: page;
          }

          @media print {
            @page {
              size: ${e} ${i}; /* স্টিকারের নির্দিষ্ট উইডথ এবং হাইট */
              margin: 0;
            }

            html, body {
              width: ${e};
              height: ${i};
              margin: 0;
              padding: 0;
            }

            * {
              color: black !important;
              background: white !important;
              background-color: white !important;
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-wrap">
          ${c}
        </div>
      </body>
    </html>
  `,o=document.createElement("iframe");o.style.position="absolute",o.style.top="-9999px",o.style.left="-9999px",o.style.width=e,o.style.height="0",o.style.border="none",o.style.visibility="hidden",document.body.appendChild(o);const r=o.contentDocument||o.contentWindow?.document;r&&(r.open(),r.write(t),r.close(),o.onload=()=>{setTimeout(()=>{o.contentWindow?.focus(),o.contentWindow?.print(),setTimeout(()=>{document.body.contains(o)&&document.body.removeChild(o)},1e3)},150)})};export{s as a,p as b,l as p};
