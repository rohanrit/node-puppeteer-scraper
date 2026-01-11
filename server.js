const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const scrapData = require('./scraper');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/scrape', async (req, res) => {
  const { url, fields } = req.body;
  const fieldList = fields ? fields.split(',').map(f => f.trim()).filter(f => f) : [];

  try {
    const result = await scrapData(url, fieldList);

    let html = `<div style="display: flex; gap: 20px;">`;
    html += `<div><a href="/">Back</a></br><h2>Scraped Data</h2><pre>${JSON.stringify(result.data, null, 2)}</pre></div>`;
    html += `<div><h3>Screenshot:</h3><img src="${result.screenshot}" style="max-width:200px;border:1px solid #ccc;" /></div>`;
    
    html += `</div>`;

    res.send(html);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
