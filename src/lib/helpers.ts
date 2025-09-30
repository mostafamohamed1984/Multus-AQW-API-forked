import { load } from "cheerio";

export class AQW {
  protected baseURL = "https://account.aq.com/CharPage";
  protected init: RequestInit = {
    cache: "no-cache",
  };

  getIDbyName = async (name: string) => {
    const url = new URL(this.baseURL);
    url.searchParams.append("id", name);
    try {
      const response = await fetch(url, this.init);
      const htmlString = await response.text();
      const htmlS = htmlString.replace(/(\r\n|\n|\r)/gm, "");
      var regex = /var\s+ccid\s*=\s*(\d+);/;
      const match = regex.exec(htmlS);
      if (!match) throw new Error("Error");
      return Number(match[1]);
    } catch (error) {
      return null;
    }
  };

  getEquippedByName = async (name: string) => {
    // Try both 'id' and 'player' params for robustness
    let url = new URL(this.baseURL);
    url.searchParams.append("id", name);
    let response, htmlString;
    try {
      response = await fetch(url, this.init);
      htmlString = await response.text();
      // If the HTML is suspiciously short, try 'player' param
      if (htmlString.length < 500) {
        url = new URL(this.baseURL);
        url.searchParams.append("player", name);
        response = await fetch(url, this.init);
        htmlString = await response.text();
      }
    } catch (err) {
      return { error: 'Fetch failed', details: String(err) };
    }

    try {
      const $ = load(htmlString);
      const list = $("div.card-body label").parent().text().trim().split("\n");
      if (list.length == 1) {
        return { error: 'No equipped data found', html: htmlString };
      }
      const values: Record<string, string> = {};
      list.forEach((l) => {
        const label = l.split(":")[0].trim();
        const value = l.split(":")[1]?.trim();
        if (label) values[label] = value;
      });
      // Log for debugging
      console.log({ values });
      return values;
    } catch (err) {
      return { error: 'Parse failed', details: String(err), html: htmlString };
    }
  };
}
