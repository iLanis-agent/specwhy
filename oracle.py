# Generates selectors in the subset cssselect 1.3.0 understands and records its specificity().
import random, sys, json
from cssselect import parse
seed=int(sys.argv[1]); N=int(sys.argv[2]); random.seed(seed)
IDS=['a','b','nav','x-1','Üx','_q','a\\.b','h1']
def simple():
    r=random.random()
    if r<.2: return random.choice(['a','div','li','ul','p','svg|a','*|b','|c','x'])
    if r<.3: return '*'
    if r<.45: return '#'+random.choice(IDS)
    if r<.6: return '.'+random.choice(IDS)
    if r<.7: return random.choice(['[href]','[a="x,y"]','[b~=c]','[d|="e"]','[f^=\'g\']','[h="]"]','[ns|a]','[a=b i]'])
    return random.choice([':hover',':first-child',':nth-child(2n+1)',':nth-of-type(odd)',':lang(en)',':checked',':nth-last-child(3)',':root',':empty',':only-child'])
def compound():
    s=''
    if random.random()<.5: s+=random.choice(['a','div','li','*','svg|a'])
    for _ in range(random.randint(0,3)): s+=random.choice(['#'+random.choice(IDS),'.'+random.choice(IDS),'[href]',':hover',':nth-child(2)',':lang(en)','[a="x"]'])
    r=random.random()
    if r<.12: s+=':not('+random.choice(['.a','#b','a','[x]',':hover','*','li.c','a#d.e[f]'])+')'
    return s or 'p'
def complexsel():
    parts=[compound()]
    for _ in range(random.randint(0,3)):
        parts.append(random.choice([' ','>','+','~',' > ',' + ',' ~ ']))
        parts.append(compound())
    s=''.join(parts)
    r=random.random()
    if r<.1: s+=random.choice(['::before','::after','::first-line',':before','::selection','::first-letter'])
    return s
out=open(sys.argv[3],'w'); n=0
for _ in range(N):
    s=','.join(complexsel() for _ in range(random.choice([1,1,1,2,3])))
    if random.random()<.3: s=random.choice(['',' ',' '])+s+random.choice(['',' '])
    try: r=[list(x.specificity()) for x in parse(s)]
    except Exception as e: r=None
    out.write(json.dumps({'s':s,'spec':r})+'\n')
