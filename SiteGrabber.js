const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = require('url');
const axios = require('axios'); // Ensure axios is installed

const baseURL = 'https://shohid.info/'; // Change to your website URL

const visited = new Set();

async function downloadResource(resourceUrl, outputDir) {
  try {
    const response = await axios({
      url: resourceUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const MAX_PATH_LENGTH = 255; // Set a maximum length for the path
    let parsedUrl = url.parse(resourceUrl);
    // Remove any leading '_' from parsedUrl.pathname. Useful for hosting on github.io
    parsedUrl.pathname = parsedUrl.pathname.replace(/^\/_+/, '/');
    // Cap the pathname length to ensure it's a valid file path
    const encodedPathname = encodeURI(parsedUrl.pathname);

    //extract extension
    const extension = encodedPathname.includes('.') ? encodedPathname.slice(encodedPathname.lastIndexOf('.')) : '';
    const basepath = encodedPathname.slice(0,encodedPathname.lastIndexOf('.'));

    if (encodedPathname.length > MAX_PATH_LENGTH) {
      const allowedLength = MAX_PATH_LENGTH - extension.length;
      const truncatedBasePath=basepath.substring(0,allowedLength);
      parsedUrl.pathname = decodeURI(truncatedBasePath + extension);
    }
    
    // turn on for debug
    //console.log(`pathname:${parsedUrl.pathname}`)
    const filePath = path.join(outputDir, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    const fileDir = path.dirname(filePath);
    fs.mkdirSync(fileDir, { recursive: true });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(parsedUrl.pathname));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading resource ${resourceUrl}: ${error}`);
  }
}

async function downloadPage(browser, pageUrl, outputDir, baseURL) {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });

  let pageContent = await page.content();

  // Extract all resources (images, stylesheets, scripts) from the page
  const resources = await page.evaluate(() => {
    const resources = [];
    const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
    const scripts = Array.from(document.querySelectorAll('script')).map(script => script.src).filter(src => src);
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href).filter(href => href);

    return [...images, ...scripts, ...styles];
  });

  // Download each resource and update HTML
  for (const resource of resources) {
    if (resource.startsWith(baseURL)) {
      const localPath = await downloadResource(resource, outputDir);
      
      // Update HTML to reference local resource
      const resourceUrl = new URL(resource);
      const relativePath = path.relative(path.dirname(url.parse(pageUrl).pathname), localPath).replace(/\\/g, '/');
      pageContent = pageContent.replace(new RegExp(resourceUrl.pathname, 'g'), relativePath);
    }
  }

  // Update links to point to local HTML files
  pageContent = pageContent.replace(/href="(\/[^"]*)"/g, (match, p1) => {
    // Only modify links that start with /profile and don't already end with .html
    if (p1.startsWith('/profile') && !p1.endsWith('.html')) {
      let relativePath = url.parse(p1).pathname + '.html';
      // Remove the first '/' from relativePath. Useful for hosting on github.io
      relativePath = relativePath.replace(/^\//, '');
      console.log(`Updated Link: ${p1} -> ${relativePath}`);
      return `href="${relativePath}"`;
    }
    // For external links or those that end with .html, return unchanged
    return match;
  });

  // Remove all <script> tags from pageContent
  pageContent = pageContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Debug: Verify the updated links
  /*
  const updatedLinks = pageContent.match(/href="(\/[^"]*)"/g);
  console.log("Updated Links:");
  updatedLinks.forEach(link => {
    console.log(link);
  });
  */

  // Save the page content
  const parsedUrl = url.parse(pageUrl);
  const filePath = path.join(outputDir, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname + '.html');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, pageContent);

  console.log(`Downloaded: ${pageUrl} -> ${filePath}`);

  // Extract and log the links
  const links = await page.$$eval('a', (as, baseURL) => as.map(a => a.href).filter(href => href.startsWith(baseURL)), baseURL);

  // Log the extracted links to the console
  console.log(`Extracted links from ${pageUrl}:`);
  links.forEach(link => console.log(link));

  await page.close();

  // Download each linked page
  for (const link of links) {
   await downloadPage(browser, link, outputDir, baseURL);
  }

  
}

async function main() {
  const browser = await puppeteer.launch({ 
    // Disabling sandbox is not safe. But if you are using linux and having trouble, keep the following or else uncomment below
    args: ['--no-sandbox'] 
  });
  const outputDir = path.resolve(`./downloaded_site`);
  console.log(`Started cloning: ${baseURL}..................`)
  await downloadPage(browser, baseURL, outputDir, baseURL);

  await browser.close();
  console.log('Cloning done! Exit this shell and find the webpage in \'downloaded_site\' folder ')
}

main().catch(console.error);