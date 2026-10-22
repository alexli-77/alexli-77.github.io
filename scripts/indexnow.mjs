// Pings IndexNow (Bing, Yandex, Seznam, Naver) with every URL in the live sitemap.
// Runs in CI after each deploy. Google and Baidu don't use IndexNow.
const HOST = 'alexli-77.github.io';
const KEY = '5c87ee7cac917da1ccdd3c1aed0c38e6';

const xml = await (await fetch(`https://${HOST}/sitemap-0.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status}`);
if (!res.ok && res.status !== 202) process.exit(1);
