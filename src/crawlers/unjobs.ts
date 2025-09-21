import { Crawler, Job } from "../types";
import { getHtml } from "../utils";
import { uniqBy } from "lodash";
import { europeanDutyStations } from "./careersun";

// const themes = [
//   "renewable-energy",
//   "climate-change",
//   "climate-change-mitigation",
//   "environmental-sustainability",
//   "environmental-policy",
//   "paris-agreement",
//   "energy-transition",
// ];

// const skills = ["climate-policy", "renewable-energy"];

export const regions = [
  "Home Based",
  "Remote",
  "Europe",
  "UK",
  ...europeanDutyStations.map((ds) => ds.key),
  ...europeanDutyStations.map((ds) => ds.country),
];

const extractJobs = async (url: string) => {
  console.log(`Extracting jobs from UNJobs, ${url}`);
  const $ = await getHtml(url);

  const jobsEl = $(".job");
  const nextPageEl = $('table td.nv a:contains("Next")').first();

  const jobs = jobsEl
    .map((_, job) => {
      // Sample job element
      // <div id="1758019552445" style="padding-right:8px;" class="job">
      //   <a style="margin-top:0px;" class="jtitle" href="https://unjobs.org/vacancies/1758015049233">PROGRAMME MANAGEMENT OFFICER, Doha, Qatar</a>
      //   <br>
      //   UNOCT - Office of Counter-Terrorism
      //   <br>
      //   Updated:
      //   <time class="upd timeago" datetime="2025-09-16T10:45:52Z" title="2025-09-16T10:45:52Z">about 4 hours ago</time>
      //   <br>
      //   <span id="j9">Closing date: Wednesday, 15 October 2025</span>
      // </div>

      const $job = $(job);
      const $a = $job.find("a");

      const title = $a.text();
      const url = $a.attr("href") || "";
      const uuid = `unjobs-${$job.attr("id")}`;

      const orgTextEl = $job.contents()[2];

      let organization = "";
      if (orgTextEl && orgTextEl.type === "text" && "data" in orgTextEl) {
        organization = orgTextEl.data;
      }

      const updatedAtStr = $(job).find("time.upd").attr("datetime") || "";

      return {
        uuid,
        title,
        url,
        organization,
        updatedAt: updatedAtStr ? new Date(updatedAtStr) : undefined,
      } as Job;
    })
    .get()
    .filter((job: Job) => job.title && job.url && job.uuid)
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
    nextPage: nextPageEl?.attr("href"),
  };
};

const crawler = async () => {
  const results: Job[] = [];

  // // iterate themes
  // for (const theme of themes) {
  //   let np: string | undefined;
  //   do {
  //     const { jobs, nextPage } = await extractJobs(
  //       np || `${UNJobsCrawler.url}/themes/${theme}`
  //     );
  //     results.push(...jobs);
  //     np = nextPage;
  //   } while (np);
  // }

  // // iterate skills
  // for (const skill of skills) {
  //   let np: string | undefined;
  //   do {
  //     const { jobs, nextPage } = await extractJobs(
  //       np || `${UNJobsCrawler.url}/skills/${skill}`
  //     );
  //     results.push(...jobs);
  //     np = nextPage;
  //   } while (np);
  // }

  let np: string | undefined;
  do {
    const { jobs, nextPage } = await extractJobs(np || UNJobsCrawler.url);
    results.push(...jobs);
    np = nextPage;
  } while (np);

  return uniqBy(results, "uuid");
};

export const UNJobsCrawler: Crawler = {
  website: "UNJobs",
  url: "https://unjobs.org",
  crawl: crawler,
};
