const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/checkRank', async (req, res) => {
  const keywords = req.body.keywords;
  const url = req.body.url;
  const keywordList = keywords.split(',').map((keyword) => keyword.trim());
  const results = await checkKeywordRank(keywordList, url);
  res.json(results);
});

const checkKeywordRank = async (keywords, url) => {
  const rankings = [];
  const browser = await puppeteer.launch({
    headless: true, // This mode can be helpful during development or when you need to visually inspect the website as the automation progresses.
    // headless: false, // This mode is suitable for most automated tasks where human interaction with the browser window is not necessary.
  });

  try {
    for (const keyword of keywords) {
      const page = await browser.newPage();
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`);
      await page.waitForSelector('.tF2Cxc');
      const searchResults = await page.evaluate(() => {
          const results = [];
          document.querySelectorAll('.tF2Cxc').forEach((element, index) => {
              const title = element.querySelector('h3').innerText;
              const link = element.querySelector('a').href;
              results.push({ title, link });
            });
            // console.log("Test Log:", results)
            return results;
        });
        // console.log("Test Log:", searchResults)

    //   const rank = searchResults.findIndex((result) => result.link === url);
      const rank = searchResults.findIndex((result) => result.link.indexOf(url) !== -1);
      rankings.push({ keyword, rank: rank !== -1 ? rank + 1 : 'Not found' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }

  return rankings;
};

app.listen(3000, () => console.log('Server running on port 3000'));