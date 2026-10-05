// Worked examples from the MDN Specificity page (fetched) and plain cases. [selector, a,b,c]
var S=require('./engine.js');var T=[[':is(p, #fakeId)',1,0,0],['h1:has(+ h2, > #fakeId)',1,0,1],['p:not(#fakeId)',1,0,1],['div:not(.inner, #fakeId) p',1,0,2],[':is(p, #fakeId) span',1,0,1],['a:not(#fakeId#fakeId#fakeID)',3,0,1],[':where(#defaultTheme) a',0,0,1],['h2:has(~ h2)',0,0,2],['*',0,0,0],['#x .y:hover',1,2,0],['a::before',0,0,2],['li:nth-child(2n+1)',0,1,1]];
var bad=0;T.forEach(function(t){var r=S.analyse(t[0]);var m=r.ok?S.rank([{sel:t[0]}]).order[0].spec:null;var ok=m&&m[0]===t[1]&&m[1]===t[2]&&m[2]===t[3];if(!ok){bad++;console.log('FAIL',t[0],m,r.error)}});
console.log(T.length+' doc cases, '+bad+' failures');
