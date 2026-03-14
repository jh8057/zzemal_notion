import Parser from "rss-parser";

const parser = new Parser({ timeout: 10000 });
const MAX_PER_KEYWORD = 2;

/**
 * 키워드별 Google News RSS 수집
 * @param {string[]} keywords
 * @returns {Promise<Array<{keyword, title, link, published}>>}
 */
export async function fetchNews(keywords) {
  const articles = [];
  const seenTitles = new Set();

  for (const keyword of keywords) {
    const encoded = encodeURIComponent(keyword);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;

    try {
      const feed = await parser.parseURL(url);
      let count = 0;

      for (const item of feed.items) {
        if (count >= MAX_PER_KEYWORD) break;
        const title = item.title ?? "";
        if (seenTitles.has(title)) continue;
        seenTitles.add(title);

        articles.push({
          keyword,
          title,
          link: item.link ?? "",
          published: item.pubDate ?? "",
        });
        count++;
      }
    } catch (err) {
      console.error(`  뉴스 수집 실패 [${keyword}]:`, err.message);
    }
  }

  return articles;
}
