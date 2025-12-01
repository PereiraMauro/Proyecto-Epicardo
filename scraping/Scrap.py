# pip install selenium
# Si querés menos bloqueos: pip install undetected-chromedriver  (y ver comentarios abajo)
import re, time, random, sqlite3
from urllib.parse import urlparse
from datetime import datetime
from selenium import webdriver
# Reemplazá estas dos líneas por undetected_chromedriver si querés:
# import undetected_chromedriver as uc
# from selenium.webdriver.common.by import By
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

HOMEPAGE = "https://store.epicgames.com/es-ES/"

DOM_SELECTORS = [
    "[data-testid*='product-price']",
    "[data-testid*='offer-price']",
    "[data-testid*='price']",
    ".price",
    "span.css-12hp1bd strong",
]

PRICE_JSON_RE = re.compile(
    r'"totalPrice"\s*:\s*\{[^}]*'
    r'"currencyCode"\s*:\s*"(?P<cur>[A-Z]{3})"[^}]*'
    r'"originalPrice"\s*:\s*(?P<orig>\d+)[^}]*'
    r'"discountPrice"\s*:\s*(?P<disc>\d+)[^}]*'
    r'"fmtPrice"\s*:\s*\{[^}]*'
    r'"originalPrice"\s*:\s*"(?P<orig_str>[^"]+)"[^}]*'
    r'"discountPrice"\s*:\s*"(?P<disc_str>[^"]+)"',
    re.DOTALL
)

PRICE_TEXT_RE = re.compile(r'(US\$|USD|\$|ARS)\s*(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[.,]\d{2})?')

def normalize_amount(text_num: str) -> float | None:
    if not text_num: return None
    t = text_num.strip()
    # "1.234,56" -> "1234.56" ; "19,99" -> "19.99"
    if ',' in t and '.' in t:
        t = t.replace('.', '').replace(',', '.')
    else:
        t = t.replace(',', '.')
    try:
        return float(t)
    except ValueError:
        return None

def make_driver(headless: bool = False):
    # Para menos bloqueos, podés usar:
    # options = uc.ChromeOptions()
    # driver = uc.Chrome(options=options)
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--lang=es-AR")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    # Si usás uc.Chrome, silenciá el destructor para evitar WinError 6:
    # try: driver.__del__ = lambda *a, **k: None
    # except: pass
    return driver

def wait_interstitial(driver, timeout=12):
    # intenta pasar el "Un momento..."
    try:
        WebDriverWait(driver, timeout).until(lambda d: "momento" not in (d.title or "").lower())
    except Exception:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2)")
        time.sleep(2)

def get_meta(driver):
    title = driver.execute_script(
        "return document.querySelector(\"meta[property='og:title']\")?.content"
    ) or driver.title
    image = driver.execute_script(
        "return document.querySelector(\"meta[property='og:image']\")?.content"
    )
    desc = driver.execute_script(
        "return document.querySelector(\"meta[property='og:description']\")?.content"
    )
    return title, image, desc

def try_dom_price(driver):
    for sel in DOM_SELECTORS:
        try:
            el = WebDriverWait(driver, 2).until(EC.presence_of_element_located((By.CSS_SELECTOR, sel)))
            txt = (el.text or "").strip()
            if txt:
                return txt
        except Exception:
            pass
    return None

def try_json_price(driver):
    # busca JSON embebido con fmtPrice
    for s in driver.find_elements(By.TAG_NAME, "script"):
        t = s.get_attribute("innerHTML") or ""
        if "totalPrice" in t and "fmtPrice" in t:
            m = PRICE_JSON_RE.search(t)
            if m:
                d = m.groupdict()
                return {
                    "currency": d["cur"],
                    "original_str": d["orig_str"],
                    "discount_str": d["disc_str"],
                }
    return None

def try_text_price(driver):
    txt = driver.execute_script("return document.body.innerText") or ""
    m = PRICE_TEXT_RE.search(txt)
    if m:
        return f"{m.group(1)} {m.group(2)}"
    return None

def infer_currency(price_text: str | None):
    if not price_text: return None
    if price_text.startswith("US$") or price_text.startswith("USD"): return "USD"
    if price_text.startswith("ARS") or price_text.startswith("$"):   return "ARS"
    return None

def extract_amount(price_text: str | None):
    if not price_text: return None
    m = re.search(r'([\d\.,]+)', price_text)
    return normalize_amount(m.group(1)) if m else None

def normalize_game_url(url: str, force_locale: str | None = None):
    # normaliza a /<locale>/p/<slug>
    parts = urlparse(url)
    segs = [s for s in parts.path.split('/') if s]
    if "p" in segs:
        i = segs.index("p")
        slug = segs[i+1] if i+1 < len(segs) else None
        locale = force_locale or (segs[0] if '-' in (segs[0] if segs else '') else 'es-ES')
        return f"{parts.scheme}://{parts.netloc}/{locale}/p/{slug}"
    return url

def get_game_data(driver, url: str) -> dict:
    # intenta es-ES y, si no hay precio, intenta en-US
    out = {"nombre": None, "descripcion": None, "imagen": None, "precio_text": None,
           "currency": None, "amount": None, "url": url}

    for locale_try in ("es-ES", "en-US"):
        target = normalize_game_url(url, force_locale=locale_try)
        driver.get(target)
        wait_interstitial(driver)
        title, image, desc = get_meta(driver)
        out["nombre"] = out["nombre"] or title
        out["imagen"] = out["imagen"] or image
        out["descripcion"] = out["descripcion"] or desc

        # A) DOM
        p_dom = try_dom_price(driver)
        if p_dom:
            out["precio_text"] = p_dom
        # B) JSON
        if not out["precio_text"]:
            pj = try_json_price(driver)
            if pj:
                out["precio_text"] = pj["discount_str"] or pj["original_str"]
                out["currency"] = pj and pj.get("currency")
        # C) Texto visible
        if not out["precio_text"]:
            out["precio_text"] = try_text_price(driver)

        if out["precio_text"]:
            # completa currency si faltó
            out["currency"] = out["currency"] or infer_currency(out["precio_text"])
            out["amount"] = extract_amount(out["precio_text"])
            out["url"] = target
            break

        # pequeña pausa y scroll para forzar hidratación antes del siguiente intento
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1.2)
        driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(0.8)

    return out

def obtener_urls_juegos(driver, catalogo_url: str, max_links: int = 60) -> list[str]:
    driver.get(catalogo_url)
    wait_interstitial(driver)
    time.sleep(1.2)
    # scroll suave para cargar más tarjetas
    for _ in range(6):
        driver.execute_script("window.scrollBy(0, document.body.scrollHeight * 0.6)")
        time.sleep(0.8 + random.uniform(0.2, 0.6))
    links = driver.find_elements(By.TAG_NAME, "a")
    urls = set()
    for a in links:
        href = a.get_attribute("href")
        if not href: continue
        if "/p/" in href and "/store.epicgames.com/" in href:
            urls.add(normalize_game_url(href, "es-ES"))
        if len(urls) >= max_links:
            break
    return list(urls)

def setup_db():
    conn = sqlite3.connect("epic_games.db")
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS juegos (
        nombre TEXT,
        descripcion TEXT,
        imagen TEXT,
        precio_text TEXT,
        currency TEXT,
        amount REAL,
        url TEXT UNIQUE,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()

def upsert_game(game: dict):
    conn = sqlite3.connect("epic_games.db")
    c = conn.cursor()
    c.execute("""
    INSERT INTO juegos (nombre, descripcion, imagen, precio_text, currency, amount, url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(url) DO UPDATE SET
        nombre=excluded.nombre,
        descripcion=excluded.descripcion,
        imagen=excluded.imagen,
        precio_text=excluded.precio_text,
        currency=excluded.currency,
        amount=excluded.amount,
        created_at=excluded.created_at
    """, (
        game.get("nombre"),
        game.get("descripcion"),
        game.get("imagen"),
        game.get("precio_text"),
        game.get("currency"),
        game.get("amount"),
        game.get("url"),
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    setup_db()
    driver = make_driver(headless=False)  # poné True si querés headless
    try:
        urls = obtener_urls_juegos(driver, HOMEPAGE, max_links=50)
        print(f"Encontradas {len(urls)} URLs.")
        for i, url in enumerate(urls, 1):
            print(f"[{i}/{len(urls)}] {url}")
            data = get_game_data(driver, url)
            print(" →", data.get("precio_text"), data.get("currency"), data.get("amount"))
            upsert_game(data)
            time.sleep(0.8 + random.uniform(0.2, 0.8))  # rate-limit suave
        print("✔ Datos guardados/actualizados en epic_games.db")
    finally:
        try:
            driver.quit()
        except Exception:
            pass
