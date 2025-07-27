from urllib.parse import urlparse as parse
import urllib.request as req
import argparse
import re

def xss(resBody):
    xss = []
    pattern = re.compile(r'(innerHTML|innerText|textContent)', re.IGNORECASE)
    for m in pattern.finditer(resBody):
        start = max(m.start() - 20, 0)
        end = min(m.end() + 27, len(body))
        snippet = body[start:end]
        xss.append(snippet)
    return xss

parser = argparse.ArgumentParser()
parser.add_argument("-u", "-url", "-l", "-link", dest="url", required=True, help="Target URL")
args = parser.parse_args()
url = args.url

print("starting NetHacker webot (NhBot) v1.2.5")
print()

if ("http://" in url or "https://" in url):
    url = url
else:
    url = "http://" + url

src = []
domain = parse(url)
domain = f"{domain.scheme}://{domain.netloc}"
print()
print("TARGET URL DOMAIN: " + domain)
print()

def bot (link):
    try: 
        print("TARGET URL: " + link)
        with req.urlopen(req.Request(link, headers={"User-Agent": "NetHacker Web Scraper NhBot v1.2.5"})) as resp:
            body = resp.read().decode("utf-8")
            dictHeaders = dict(resp.getheaders())
            headers = str(dict(resp.getheaders())).replace(",", ", \n")
            status = str(resp.status)
        print()
        print("RESPONSE:")
        print("HTTP STATUS CODE: " + status)
        print()
        print("RESPONSE HEADERS:")
        print(headers)
        print()
        if "Content-Security-Policy" in dictHeaders or "content-security-policy" in dictHeaders:
            print("Content-Security-Policy: True")
        else:
            print("Content-Security-Policy: False")
        if "X-Frame-Option" in dictHeaders or "x-frame-option" in dictHeaders or "X-Frame-Options" in dictHeaders or "x-frame-options" in dictHeaders:
            print("X-Frame-Option: True")
        else:
            print("X-Frame-Option: False")
        print()
        print("RESPONSE BODY:")
        print(body)
        print()
        print("xss location: ")
        print(xss(body))
        print()
        html = body.split(" ")
        index = [n for n, t in enumerate(html) if t == "src"]
        for i in index:
            src.append(html[i + 1])
    except Exception as err:
        print("NhBot on ERROR: " + str(err))
        print()

bot(url)

if len(src) > 0:
    for i in src:
        if i[0] == "/":
            urlPath = domain + i
        elif "http://" in i or "https://" in i:
            urlPath = i
        else:
            urlPath = domain + "/" + i
        print("SOURCE URL IN RESPONSE BODY: " + urlPath)
        print()
        bot(urlPath)
