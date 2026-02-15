"""Browser interaction helpers for sandboxes using Playwright."""

from sbx.provider import SandboxInstance


BROWSER_SETUP_SCRIPT = """
cd /tmp && npm init -y && npm install playwright
npx playwright install chromium
"""


def init_browser(sbx: SandboxInstance) -> None:
    """Install browser dependencies in the sandbox."""
    sbx.commands.run(BROWSER_SETUP_SCRIPT, timeout=120)


def start_browser(sbx: SandboxInstance, headless: bool = True) -> None:
    """Start a Playwright browser process in the sandbox."""
    headless_flag = "true" if headless else "false"
    script = f"""
cat > /tmp/browser-server.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: {headless_flag} }});
    const page = await browser.newPage();
    console.log('BROWSER_READY');
    process.stdin.resume();
}})();
SCRIPT
"""
    sbx.commands.run(script)
    sbx.commands.run("node /tmp/browser-server.js", background=True)


def close_browser(sbx: SandboxInstance) -> None:
    """Close the browser process."""
    sbx.commands.run("pkill -f browser-server.js || true")


def navigate(sbx: SandboxInstance, url: str) -> None:
    """Navigate to a URL using a Playwright script."""
    script = f"""
cat > /tmp/nav.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    await page.goto('{url}');
    console.log('Navigated to: ' + page.url());
    console.log('Title: ' + await page.title());
    await browser.close();
}})();
SCRIPT
node /tmp/nav.js
"""
    sbx.commands.run(script, timeout=30)


def click_element(sbx: SandboxInstance, selector: str) -> None:
    """Click an element by CSS selector."""
    script = f"""
cat > /tmp/click.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    await page.click('{selector}');
    await browser.close();
}})();
SCRIPT
node /tmp/click.js
"""
    sbx.commands.run(script, timeout=15)


def type_text(sbx: SandboxInstance, selector: str, text: str) -> None:
    """Type text into an element."""
    script = f"""
cat > /tmp/type.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    await page.fill('{selector}', '{text}');
    await browser.close();
}})();
SCRIPT
node /tmp/type.js
"""
    sbx.commands.run(script, timeout=15)


def evaluate_js(sbx: SandboxInstance, script: str) -> str:
    """Evaluate JavaScript in the browser context."""
    js = f"""
cat > /tmp/eval.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    const result = await page.evaluate(() => {{ {script} }});
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
}})();
SCRIPT
node /tmp/eval.js
"""
    result = sbx.commands.run(js, timeout=15)
    return result.stdout


def take_screenshot(sbx: SandboxInstance, output: str = "screenshot.png") -> None:
    """Take a screenshot and download it."""
    remote_path = f"/tmp/{output}"
    script = f"""
cat > /tmp/screenshot.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    await page.screenshot({{ path: '{remote_path}', fullPage: true }});
    console.log('Screenshot saved');
    await browser.close();
}})();
SCRIPT
node /tmp/screenshot.js
"""
    sbx.commands.run(script, timeout=15)


def get_accessibility_tree(sbx: SandboxInstance) -> str:
    """Get the accessibility tree of the current page."""
    script = """
cat > /tmp/a11y.js << 'SCRIPT'
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const snapshot = await page.accessibility.snapshot();
    console.log(JSON.stringify(snapshot, null, 2));
    await browser.close();
})();
SCRIPT
node /tmp/a11y.js
"""
    result = sbx.commands.run(script, timeout=15)
    return result.stdout


def get_dom(sbx: SandboxInstance, selector: str | None = None) -> str:
    """Get the DOM structure of the current page or a scoped element."""
    sel = selector or "body"
    script = f"""
cat > /tmp/dom.js << 'SCRIPT'
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage();
    const html = await page.$eval('{sel}', el => el.innerHTML);
    console.log(html);
    await browser.close();
}})();
SCRIPT
node /tmp/dom.js
"""
    result = sbx.commands.run(script, timeout=15)
    return result.stdout


def browser_status(sbx: SandboxInstance) -> dict:
    """Check if browser is running in the sandbox."""
    result = sbx.commands.run("pgrep -f 'chromium|browser-server' || echo 'not running'")
    running = "not running" not in result.stdout
    return {
        "running": running,
        "processes": result.stdout.strip(),
    }
