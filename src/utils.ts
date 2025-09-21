import * as cheerio from "cheerio";

export const getHtml = async (url: string) => {
  const response = await fetch(url);
  return cheerio.load(await response.text());
};
