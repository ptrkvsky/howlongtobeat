class SitemapGenerator {
  baseUrl: string; // website url
  urls: string | undefined; // urls
  siteMap: string; // complete sitemap
  header: string;
  footer: string;

  constructor(baseUrl: string, urls: string[]) {
    this.baseUrl = baseUrl;
    this.siteMap = ``;
    this.header = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    this.footer = `</urlset>`;
    this.setUrls(urls);
  }

  setSitemapEntry(url: string) {
    return `
    <url>
      <changefreq>monthly</changefreq>
      <loc>${`${url}`}</loc>
    </url>`;
  }

  setUrls(pUrls: string[]) {
    const urls = pUrls.map((url) => this.setSitemapEntry(url));
    this.urls = urls.join(``);
  }

  getSitemap() {
    this.siteMap = this.header + this.urls + this.footer;
    return this.siteMap;
  }
}

export default SitemapGenerator;
