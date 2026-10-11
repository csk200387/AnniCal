import json,re,os,sys
G=os.path.dirname(os.path.abspath(__file__))
inp=json.load(open(os.path.join(G,"input.json")))
d=json.load(open(os.path.join(G,"drafts.json")))
ids=[e["id"] for e in inp]; errs=[]
if set(ids)!=set(d): errs.append(("id-set-mismatch",set(ids)^set(d)))
for k in ids:
    x=d[k]
    for f in ("origin","anecdote"):
        s=x[f]
        if re.search(r"[\x00-\x1f\x7f\u2028\u2029]",s): errs.append((k,f,"control-char"))
        if "</script" in s.lower(): errs.append((k,f,"script"))
    o,a=len(x["origin"]),len(x["anecdote"])
    if not (440<=o<=560): errs.append((k,"origin-len",o))
    if not (400<=a<=520): errs.append((k,"anecdote-len",a))
    if not x["sourceUrl"].startswith("https://"): errs.append((k,"sourceUrl",x["sourceUrl"]))
    for ev in x["evidence"]:
        p=os.path.join(G,ev["local_evidence_path"])
        if not os.path.exists(p): errs.append((k,"missing-file",p)); continue
        if ev["quote_original"] not in open(p,encoding="utf-8").read(): errs.append((k,"quote-not-found",ev["quote_original"][:50]))
    print(k,o,a,o+a,"evidence",len(x["evidence"]))
print("ERRORS:",errs if errs else "none")
sys.exit(1 if errs else 0)
