from pathlib import Path
from playwright.sync_api import sync_playwright
import base64

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"
DOCS.mkdir(exist_ok=True)
css = (ROOT / "documents.css").read_text(encoding="utf-8")
logo_b64 = base64.b64encode((ROOT / "assets/brand/foundation-data-logo-white-trimmed.webp").read_bytes()).decode("ascii")
logo_uri = "data:image/webp;base64," + logo_b64
items = [
    ("resume.html", "Russell-Dudek-Foundation-Data-Resume.pdf"),
    ("cover-letter.html", "Russell-Dudek-Foundation-Data-Cover-Letter.pdf"),
    ("interview-brief.html", "Russell-Dudek-Foundation-Data-Interview-Thesis-Brief.pdf"),
    ("120-day-plan.html", "Russell-Dudek-Foundation-Data-120-Day-Plan.pdf"),
    ("operating-review.html", "Russell-Dudek-Foundation-Data-Operating-Review.pdf"),
]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
    for route, filename in items:
        html = (ROOT / route).read_text(encoding="utf-8")
        html = html.replace('<link rel="stylesheet" href="documents.css">', f"<style>{css}</style>")
        html = html.replace("assets/brand/foundation-data-logo-white-trimmed.webp", logo_uri)
        html = html.replace("assets/brand/foundation-data-logo-white.webp", logo_uri)
        page = browser.new_page()
        page.set_content(html, wait_until="load")
        page.emulate_media(media="print")
        page.pdf(
            path=str(DOCS / filename),
            format="Letter",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
            tagged=True,
        )
        page.close()
    browser.close()
