function e(e){if(!e)return e;let t=String(e).replace(/\r\n?/g,`
`).split(`
`);return t.map((e,n)=>{let r=t[n+1];return!e.trim()||r===void 0||!r.trim()||e.endsWith(`  `)?e:`${e}  `}).join(`
`)}export{e as t};