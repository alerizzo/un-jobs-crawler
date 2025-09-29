import { Crawler, Job } from "../types";
import { cleanText, getHtml, sha256Base62, waitFor } from "../utils";
import { uniqBy } from "lodash";
import { europeanDutyStations } from "./careersun";
import { CheerioAPI } from "cheerio";

export const regions = [
  "Home Based",
  "Remote",
  "Europe",
  "Amsterdam",
  "Cyprus",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Ireland",
  "Italy",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Portugal",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "UK",
  ...europeanDutyStations.map((ds) => ds.key),
  ...europeanDutyStations.map((ds) => ds.country),
];

const MAX_RETRIES = 10;
const RETRY_DELAY = 5; // seconds

const extractJobs = async (url: string) => {
  console.log(`Extracting jobs from UNTalent, ${url}`);

  let $: CheerioAPI;
  let n = 0;
  let hasJobs = false;

  do {
    $ = await getHtml(url);
    hasJobs = $(".job-card.card").length > 0;

    if (!hasJobs && ++n < MAX_RETRIES) {
      console.log(
        `Waiting for ${RETRY_DELAY} seconds to retry (attempt ${n} of ${MAX_RETRIES})...`
      );
      await waitFor(RETRY_DELAY * 1000);
    }
  } while (!hasJobs && n < MAX_RETRIES);

  // find the string "After this post, you will find only expired jobs." in the page
  const isLastPage = $("body")
    .text()
    .includes("After this post, you will find only expired jobs.");

  // job-card card
  const jobsEl = $(".job-card.card");
  const nextPageEl = $("main .card:last-child a");

  const jobs = jobsEl
    .map((_, job) => {
      const $job = $(job);

      const hasExpired = $job.find(".deadline .expired").length > 0;
      if (hasExpired) {
        return;
      }

      const jobTitleEl = $job.find(".job-title h1 a");
      const locationEl = $job.find(".locations .locations");

      const title = `${jobTitleEl.text()} - ${
        cleanText(locationEl.text()) || "No location"
      }`;
      const url = jobTitleEl.attr("href") || "";

      const uuid = `untalent-${sha256Base62(url)}`;

      const organization = cleanText($job.find(".organisation").text());

      const tags = $job
        .find(".tag")
        .map((_, tag) => $(tag).text())
        .get();

      const description = `${tags.join(", ")}${
        tags.length > 0 ? "\n\n" : ""
      }${cleanText($job.find(".job-summary").text())}`;

      return {
        uuid,
        title,
        url,
        organization,
        description,
      } as Job;
    })
    .get()
    .filter((job: Job) => job && job.title && job.url && job.uuid)
    .filter((job: Job) =>
      regions.some((region) => {
        const pattern = new RegExp(
          `(?:^|[\\s\\p{P}])${region}(?=[\\s\\p{P}]|$)`,
          "iu"
        );
        return pattern.test(job.title);
      })
    );

  return {
    jobs,
    nextPage: !isLastPage
      ? `https://untalent.org${nextPageEl?.attr("href")}`
      : undefined,
  };
};

const crawler = async () => {
  const results: Job[] = [];

  const PAGE_LIMIT = 50;

  let np: string | undefined;
  let n = 0;
  do {
    const { jobs, nextPage } = await extractJobs(np || UNTalentCrawler.url);
    results.push(...jobs);
    np = nextPage;
    n++;
  } while (np && n < PAGE_LIMIT);

  return uniqBy(results, "uuid");
};

export const UNTalentCrawler: Crawler = {
  website: "UNTalent",
  prefix: "untalent",
  url: "https://untalent.org/jobs",
  crawl: crawler,
};
