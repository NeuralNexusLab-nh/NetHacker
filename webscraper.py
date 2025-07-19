import requests
from bs4 import BeautifulSoup

def findOne(htmlCode, tag) :
    data = htmlCode.find(tag)
    if data:
        return data.text
    else:
        return "[Not Fount]"
def findAll (htmlCode, tag) :
    data = htmlCode.find_all(tag)
    if not data:
        return ["[Not Found]"]
    return str([n.text.strip() for n in data])

if __name__ == "__main__":
    url = input("web scraper target url: ")
    type = input("type (tag/raw): ")
    print("starting NetHacker web scraper v1.1.7")
    if ("http://" in url or "https://" in url) == False:
        url = "https://" + url
    res = requests.get(url)
    html = BeautifulSoup(res.text, "html.parser")
    
    if (type == "raw"):
        print(res.text)
    else :
        print()
        print(f"{url} scraper data:")
        print()
        print("title:")
        print(findOne(html, "title"))
        print()
        print("head:")
        print(findAll(html, ["h1", "h2", "h3", "h4", "h5", "h6"]))
        print()
        print("text:")
        print(findAll(html, "p"))
        print()
        print("hyperlink:")
        print(findAll(html, "a"))
        print()
        print("button:")
        print(findAll(html, "button"))
        print()
        print("script:")
        print(findAll(html, "script"))

