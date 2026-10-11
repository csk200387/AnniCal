import sys, re, html, subprocess, os, datetime
from html.parser import HTMLParser

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
HERE = os.path.dirname(os.path.abspath(__file__))


class T(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip = 0

    def handle_starttag(self, tag, a):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1
        if tag in ("p", "br", "div", "li", "h1", "h2", "h3", "h4", "tr", "section", "td"):
            self.out.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def fetch(name, url):
    raw = os.path.join(HERE, name + ".raw")
    r = subprocess.run(["curl", "-sSL", "--max-time", "60", "-A", UA, "-o", raw, "-w", "%{http_code} %{content_type} %{url_effective}", url], capture_output=True, text=True)
    info = r.stdout
    data = open(raw, "rb").read() if os.path.exists(raw) else b""
    if data[:4] == b"%PDF":
        txt = subprocess.run(["pdftotext", "-layout", raw, "-"], capture_output=True, text=True).stdout
    else:
        s = data.decode("utf-8", "replace")
        p = T()
        p.feed(s)
        txt = html.unescape("".join(p.out))
        txt = re.sub(r"[ \t\xa0]+", " ", txt)
        txt = re.sub(r"\n\s*\n+", "\n", txt)
    hdr = f"URL: {url}\nFETCH: {info}\nACCESSED: {datetime.date.today().isoformat()}\n---\n"
    open(os.path.join(HERE, name + ".txt"), "w").write(hdr + txt)
    os.remove(raw)
    print(name, info, len(txt))


if __name__ == "__main__":
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        fetch(args[i], args[i + 1])
