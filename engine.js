(function(root){
  'use strict';
  var LEGACY_PE = {before:1,after:1,'first-line':1,'first-letter':1};
  var NTH_OF = {'nth-child':1,'nth-last-child':1};
  function splitTop(s){ // split on top-level commas
    var out=[],d=0,q=null,cur='',i,c;
    for(i=0;i<s.length;i++){c=s[i];
      if(q){cur+=c;if(c==='\\'){cur+=s[++i]||'';}else if(c===q)q=null;continue;}
      if(c==='\\'){cur+=c+(s[++i]||'');continue;}
      if(c==='"'||c==="'"){q=c;cur+=c;continue;}
      if(c==='('||c==='[')d++;else if(c===')'||c===']')d--;
      if(c===','&&d===0){out.push(cur);cur='';continue;}
      cur+=c;}
    out.push(cur);return out;}
  function readIdent(s,i){var j=i;while(j<s.length){var c=s[j];
      if(c==='\\'){j+=2;continue;}
      if(/[A-Za-z0-9_\-]/.test(c)||c.charCodeAt(0)>127)j++;else break;}
    return j;}
  function matchParen(s,i){ // s[i]==='(' ; returns index of matching ')'
    var d=0,q=null,j;
    for(j=i;j<s.length;j++){var c=s[j];
      if(q){if(c==='\\')j++;else if(c===q)q=null;continue;}
      if(c==='\\'){j++;continue;}
      if(c==='"'||c==="'"){q=c;continue;}
      if(c==='(')d++;else if(c===')'){d--;if(d===0)return j;}}
    return -1;}
  function max(list){var m=[0,0,0];list.forEach(function(r){if(cmp(r,m)>0)m=r;});return m;}
  function cmp(x,y){for(var i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i]?1:-1;}return 0;}
  // returns {spec:[a,b,c], notes:[]} for one complex selector; throws Error on syntax problems
  function complex(s,notes){
    var a=0,b=0,c=0,i=0,n=s.length,expectCompound=true,sawAny=false,ch;
    function bump(v){a+=v[0];b+=v[1];c+=v[2];}
    while(i<n){
      ch=s[i];
      if(/\s/.test(ch)||ch==='>'||ch==='+'||ch==='~'){
        if(ch==='>'||ch==='+'||ch==='~'){ if(!sawAny) throw new Error('A combinator "'+ch+'" needs a selector before it'); }
        i++;continue;}
      if(ch==='|'&&s[i+1]==='|'){i+=2;continue;}
      if(ch==='#'){var j=readIdent(s,i+1);if(j===i+1)throw new Error('"#" must be followed by an id');a++;i=j;sawAny=true;continue;}
      if(ch==='.'){var j2=readIdent(s,i+1);if(j2===i+1)throw new Error('"." must be followed by a class name');b++;i=j2;sawAny=true;continue;}
      if(ch==='['){var k=i+1,q=null;
        for(;k<n;k++){var x=s[k];if(q){if(x==='\\')k++;else if(x===q)q=null;continue;}
          if(x==='\\'){k++;continue;}if(x==='"'||x==="'"){q=x;continue;}if(x===']')break;}
        if(k>=n)throw new Error('Unclosed "[" in attribute selector');
        b++;i=k+1;sawAny=true;continue;}
      if(ch===':'){
        var pe=s[i+1]===':';var st=i+(pe?2:1);var e=readIdent(s,st);
        if(e===st)throw new Error('":" must be followed by a pseudo-class or pseudo-element name');
        var name=s.slice(st,e).toLowerCase();
        var arg=null;
        if(s[e]==='('){var cl=matchParen(s,e);if(cl<0)throw new Error('Unclosed "(" after :'+name);arg=s.slice(e+1,cl);e=cl+1;}
        i=e;sawAny=true;
        if(pe){c++;continue;}
        if(arg===null&&LEGACY_PE[name]){c++;continue;}
        if(name==='where'){notes.push(':where() counts as zero');continue;}
        if(name==='is'||name==='not'||name==='has'||name==='matches'||name==='-webkit-any'||name==='-moz-any'){
          if(arg===null)throw new Error(':'+name+' needs an argument list');
          var inner=listSpec(name==='has'?arg.replace(/(^|,)\s*[>+~]\s*/g,'$1'):arg,notes);
          var m=max(inner.map(function(r){return r.spec;}));
          bump(m);
          if(inner.length>1)notes.push(':'+name+'() takes its most specific argument ('+fmt(m)+')');
          continue;}
        if(NTH_OF[name]&&arg!==null){
          var mm=/\sof\s/i.exec(arg);
          b++;
          if(mm){var sel=arg.slice(mm.index+mm[0].length);
            var inn=listSpec(sel,notes);var m2=max(inn.map(function(r){return r.spec;}));bump(m2);
            notes.push(':'+name+'(... of S) adds the pseudo-class (0,1,0) plus its most specific selector '+fmt(m2));}
          continue;}
        b++;continue;}
      if(ch==='&'){throw new Error('Nesting selector & is not supported here (its specificity comes from the parent rule)');}
      if(ch==='*'){var nx=s[i+1];
        if(nx==='|'&&s[i+2]!=='='){i+=2; if(s[i]==='*'){i++;}else{var j3=readIdent(s,i);if(j3>i){c++;i=j3;}} sawAny=true;continue;}
        i++;sawAny=true;continue;}
      if(ch==='|'){ // empty-namespace prefix |a
        i++;var j4=readIdent(s,i);if(j4>i){c++;i=j4;}else if(s[i]==='*')i++;sawAny=true;continue;}
      var j5=readIdent(s,i);
      if(j5>i){
        if(s[j5]==='|'&&s[j5+1]!=='='){i=j5+1; if(s[i]==='*'){i++;}else{var j6=readIdent(s,i);if(j6>i){c++;i=j6;}}}
        else{c++;i=j5;}
        sawAny=true;continue;}
      throw new Error('Unexpected character "'+ch+'" at position '+i);
    }
    if(!sawAny)throw new Error('Empty selector');
    return [a,b,c];
  }
  function fmt(v){return '('+v.join(',')+')';}
  function listSpec(s,notes){
    var parts=splitTop(s);
    return parts.map(function(p){var t=p.trim();
      if(t==='')throw new Error('Empty selector in list (stray comma?)');
      return {src:t,spec:complex(t,notes)};});}
  function analyse(src){
    var notes=[];
    var r;
    try{r=listSpec(src,notes);}catch(e){return {ok:false,error:e.message};}
    return {ok:true,list:r,notes:notes};}
  // rank competing declarations: items {src, important}
  function rank(items){
    var rows=items.map(function(it,idx){
      if(it.inline)return {idx:idx,sel:it.sel,important:!!it.important,inline:true,info:{ok:true,list:[],notes:[]},spec:[0,0,0]};
      var info=analyse(it.sel);
      var best=null;
      if(info.ok)best=max(info.list.map(function(r){return r.spec;}));
      return {idx:idx,sel:it.sel,important:!!it.important,inline:false,info:info,spec:best};});
    var ok=rows.filter(function(r){return r.info.ok;});
    ok.sort(function(x,y){
      if(x.important!==y.important)return x.important?-1:1;
      if(x.inline!==y.inline)return x.inline?-1:1;
      var c=cmp(y.spec,x.spec);if(c)return c;return y.idx-x.idx;});
    return {rows:rows,order:ok};}
  var api={analyse:analyse,rank:rank,splitTop:splitTop,cmp:cmp};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpecWhy=api;
})(typeof window!=='undefined'?window:globalThis);
