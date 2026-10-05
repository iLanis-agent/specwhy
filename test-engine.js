var S=require('./engine.js'),fs=require('fs');var tot=0,ok=0,rej=0,agree=0,mm=[];
process.argv.slice(2).forEach(function(f){fs.readFileSync(f,'utf8').split('\n').filter(Boolean).forEach(function(l){
  var o=JSON.parse(l);tot++;var r=S.analyse(o.s);
  if(o.spec===null){rej++; if(r.ok){mm.push({s:o.s,why:'cssselect rejects, engine accepts',eng:r.list.map(function(x){return x.spec;})});}else agree++; return;}
  ok++;
  if(!r.ok){mm.push({s:o.s,why:'engine rejects',err:r.error,want:o.spec});return;}
  var got=r.list.map(function(x){return x.spec;});
  if(JSON.stringify(got)===JSON.stringify(o.spec))agree++;else mm.push({s:o.s,want:o.spec,got:got});});});
console.log(JSON.stringify({lines:tot,cssselectAccepted:ok,cssselectRejected:rej,agree:agree,mismatches:mm.length}));
mm.slice(0,+(process.env.SHOW||5)).forEach(function(m){console.log(JSON.stringify(m));});
