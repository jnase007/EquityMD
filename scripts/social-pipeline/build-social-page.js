const fs = require('fs');
const md = fs.readFileSync('/Users/dalenase/.openclaw/workspace/equitymd-social-posts.md','utf8');

const lines = md.split('\n');
const articles = [];
let cur = null, mode = null, buf = [];

function flush(){
  if(cur && mode && buf.length){
    while(buf.length && buf[0].trim()==='') buf.shift();
    while(buf.length && buf[buf.length-1].trim()==='') buf.pop();
    cur[mode] = buf.join('\n');
  }
  buf=[]; mode=null;
}
for(const line of lines){
  const art = line.match(/^##\s+(\d+)\.\s+(.*)/);
  if(art){ flush(); if(cur) articles.push(cur); cur={num:art[1],title:art[2],link:'',LinkedIn:'',Facebook:''}; continue; }
  if(!cur) continue;
  const linkM = line.match(/^🔗\s+(\S+)/);
  if(linkM){ cur.link=linkM[1]; continue; }
  if(line.match(/^###\s+LinkedIn/i)){ flush(); mode='LinkedIn'; continue; }
  if(line.match(/^###\s+Facebook/i)){ flush(); mode='Facebook'; continue; }
  if(line.match(/^---\s*$/)){ flush(); continue; }
  if(mode) buf.push(line);
}
flush(); if(cur) articles.push(cur);

// Normalize so a PLAIN copy-paste survives LinkedIn/Facebook newline stripping:
// turn every single newline into a blank-line paragraph break (double newline).
function normalize(t){
  return t.split('\n').map(l=>l.trimEnd()).filter((l,i,a)=>!(l===''&&a[i-1]===''))
    .join('\n')                       // collapse
    .replace(/\n{2,}/g,'\u0000')      // protect existing blank-line breaks
    .replace(/\n/g,'\n\n')            // expand single breaks to blank-line breaks
    .replace(/\u0000/g,'\n\n');       // restore protected ones (already blank-line)
}
articles.forEach(a=>{ a.LinkedIn=normalize(a.LinkedIn); a.Facebook=normalize(a.Facebook); });

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const POSTS=[];
function card(plat,cls,a){
  const text = a[plat];
  if(!text) return '';
  const id = POSTS.length; POSTS.push(text);
  return `<div class="post ${cls}">
    <div class="phead"><span class="num">${a.num}</span><span class="ttl">${esc(a.title)}</span>
      <button class="copy" data-id="${id}" onclick="cp(this)">📋 Copy</button></div>
    <pre class="ptext">${esc(text)}</pre>
  </div>`;
}

const liCards = articles.map(a=>card('LinkedIn','in',a)).join('\n');
const fbCards = articles.map(a=>card('Facebook','fb',a)).join('\n');

const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EquityMD — Social Posts</title>
<style>
:root{--blue:#2563EB;--ink:#0a1426;--fb:#7C3AED;--in:#0A66C2;}
*{box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;margin:0;background:#eef2f8;color:var(--ink);padding-bottom:60px;}
header{background:linear-gradient(135deg,#0a1426,#1B3A78);color:#fff;padding:24px 18px;text-align:center;}
header h1{margin:0 0 6px;font-size:22px;}
header p{margin:0;font-size:13px;opacity:.85;}
.wrap{max-width:760px;margin:0 auto;padding:14px;}
.section{font-size:20px;font-weight:800;color:#fff;padding:14px 18px;border-radius:12px;margin:24px 0 6px;display:flex;align-items:center;gap:10px;}
.section.in{background:var(--in);}
.section.fb{background:var(--fb);}
.section .small{font-size:13px;font-weight:500;opacity:.9;}
.post{background:#fff;border-radius:13px;margin:14px 0;box-shadow:0 2px 10px rgba(13,30,60,.08);overflow:hidden;}
.post.in{border-left:5px solid var(--in);}
.post.fb{border-left:5px solid var(--fb);}
.phead{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#f6f9fe;}
.num{background:var(--blue);color:#fff;border-radius:7px;min-width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex:0 0 auto;}
.ttl{font-size:14px;font-weight:700;color:var(--ink);flex:1;line-height:1.25;}
.copy{border:2px solid var(--ink);background:#fff;color:var(--ink);font-size:14px;font-weight:800;padding:7px 15px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;flex:0 0 auto;}
.copy.done{background:#10B981;border-color:#10B981;color:#fff;}
.ptext{margin:0;padding:14px;white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:15px;line-height:1.5;color:#1d2840;}
.tip{background:#eaf1ff;border-radius:10px;padding:12px 14px;font-size:13px;color:#33425c;margin:14px 0;}
footer{text-align:center;font-size:12px;color:#7a8aa3;padding:20px;}
</style></head><body>
<header><h1>EquityMD — Social Posts</h1><p>All LinkedIn first, then all Facebook · tap 📋 to copy, or just select &amp; copy</p></header>
<div class="wrap">
<div class="tip">💡 Grouped for easy posting: do all <b>${articles.length} LinkedIn</b> posts in one sitting, then all <b>${articles.length} Facebook</b> posts. Spacing is paste-proof. Every post has the free-signup CTA → equitymd.com/find</div>

<div class="section in">🔵 LinkedIn <span class="small">— ${articles.length} posts</span></div>
${liCards}

<div class="section fb">🟣 Facebook <span class="small">— ${articles.length} posts</span></div>
${fbCards}

<footer>EquityMD · owned &amp; operated by OC Tech Studio LLC · educational content, accredited investors only</footer>
</div>
<script>
const POSTS=${JSON.stringify(POSTS)};
function cp(btn){
  const t=POSTS[+btn.getAttribute('data-id')];
  const done=()=>{const o=btn.innerHTML;btn.innerHTML='✓ Copied';btn.classList.add('done');setTimeout(()=>{btn.innerHTML=o;btn.classList.remove('done');},1600);};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,()=>fallback(t,done));}
  else fallback(t,done);
}
function fallback(t,done){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(e){}document.body.removeChild(ta);}
</script></body></html>`;

fs.writeFileSync('/Users/dalenase/.openclaw/workspace/equitymd-social-posts-COPY.html', html);
console.log('LinkedIn posts:', articles.length, '| Facebook posts:', articles.length, '| total copy blocks:', POSTS.length);
