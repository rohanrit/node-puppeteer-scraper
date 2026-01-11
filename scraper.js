const puppeteer = require('puppeteer');
const path = require('path');

async function scrapData(url, fields) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('table', { timeout: 5000 });

    const screenshotPath = path.join(__dirname, 'public', 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const data = await page.evaluate((fields) => {
      const getText = (label) => {
        const row = Array.from(document.querySelectorAll('table tr')).find(tr =>
          tr.textContent.includes(label)
        );
        return row ? row.querySelector('td:last-child')?.textContent.trim() : '';
      };

      const result = {};
      result["title"] = document.querySelector('h2')?.textContent.trim() || '';

      if (fields.length > 0) {
        fields.forEach(label => {
          const cleanLabel = label.trim();
          if (cleanLabel) {
            result[cleanLabel] = getText(cleanLabel);
          }
        });
      }

      return result;
    }, fields);

    await browser.close();
    return { data, screenshot: '/screenshot.png' };

  } catch (error) {
    console.error("Error waiting for selector:", error.message);

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    await browser.close();
    return { 
      data: { error: "Page not found, redirected to landing page" }, 
      screenshot: '/screenshot.png' 
    };
  }
}

module.exports = scrapData;
