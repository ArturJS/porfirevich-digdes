const { createServer } = require('http');
const url = require('url');
const puppeteer = require('puppeteer');

const getText = async ({ page, selector }) => {
    const text = await page.evaluate(
        selector => document.querySelector(selector).textContent,
        selector
    );

    return text;
};

const askPorfirevich = async ({ go, text }) => {
    if (!text) {
        return 'Text not found. Try for example http://127.0.0.1/?text=here_is_your_text';
    }

    const page = await go('https://porfirevich.ru/');

    const answer = text + '........';
    return answer;
};

const handleError = error => {
    console.log('Some shit happened:');
    console.log(error);
    process.exit(1);
};

const main = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    });
    const page = await browser.newPage();
    const go = async (url, { waitUntil = 'networkidle2' } = {}) => {
        await page.goto(url, {
            waitUntil,
            timeout: 30000 /* 30 seconds */
        });

        return page;
    };

    createServer(async (req, res) => {
        try {
            const { text } = url.parse(req.url, true).query;
            res.writeHead(200, { 'Content-Type': 'text/plain' });

            const answer = await askPorfirevich({ go, text });

            res.write(answer);
            res.end();
        } catch (error) {
            handleError(error);
        }
    }).listen(8085);

    await browser.close();
};

main().catch(handleError);
