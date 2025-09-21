import { Crawler, Job } from "../types";

export const europeanDutyStations = [
  { key: "Athens", value: "ATHENS", country: "Greece" },
  { key: "Barcelona", value: "BARCELONA", country: "Spain" },
  { key: "Belgrade", value: "BELGRADE", country: "Serbia" },
  { key: "Berlin", value: "BERLIN", country: "Germany" },
  { key: "Bern", value: "BERN", country: "Switzerland" },
  { key: "Bonn", value: "BONN", country: "Germany" },
  { key: "Brindisi", value: "BRINDISI", country: "Italy" },
  { key: "Brussels", value: "BRUSSELS", country: "Belgium" },
  { key: "Budapest", value: "BUDAPEST", country: "Hungary" },
  { key: "Cambridge", value: "CAMBRIDGE", country: "United Kingdom" },
  { key: "Chisinau", value: "CHISINAU", country: "Moldova" },
  { key: "Copenhagen", value: "COPENHAGEN", country: "Denmark" },
  { key: "Donetsk", value: "DONETSK", country: "Ukraine" },
  { key: "Geneva", value: "Geneva", country: "Switzerland" },
  { key: "Kyiv", value: "KIEV", country: "Ukraine" },
  { key: "Kharkiv", value: "KHARKIV", country: "Ukraine" },
  { key: "Lisbon", value: "LISBON", country: "Portugal" },
  { key: "London", value: "LDN", country: "United Kingdom" },
  { key: "Luhansk", value: "LUHANSK", country: "Ukraine" },
  { key: "Lviv", value: "LVIV", country: "Ukraine" },
  { key: "Madrid", value: "MADRID", country: "Spain" },
  { key: "Minsk", value: "MINSK", country: "Belarus" },
  { key: "Mitrovica", value: "MITROVICAKOSOVO", country: "Kosovo" },
  { key: "Moscow", value: "MOSCOW", country: "Russia" },
  { key: "Nicosia", value: "NICOSIA", country: "Cyprus" },
  { key: "Odessa", value: "ODESSA", country: "Ukraine" },
  { key: "Paris", value: "1470", country: "France" },
  { key: "Podgorica", value: "PODGORICA", country: "Montenegro" },
  { key: "Prague", value: "PRAGUE", country: "Czech Republic" },
  { key: "Pristina", value: "PRISTINA", country: "Kosovo" },
  { key: "Rome", value: "ROME", country: "Italy" },
  { key: "Sarajevo", value: "SARAJEVO", country: "Bosnia and Herzegovina" },
  { key: "Skopje", value: "SKOPJE", country: "North Macedonia" },
  { key: "Sokhumi", value: "SOKHUMI", country: "Georgia" },
  { key: "Stockholm", value: "STOCKHOLM", country: "Sweden" },
  { key: "The Hague", value: "THEHAGUE", country: "Netherlands" },
  { key: "Tirana", value: "TIRANA", country: "Albania" },
  { key: "Tbilisi", value: "TBILISI", country: "Georgia" },
  { key: "Valletta", value: "VALLETTA", country: "Malta" },
  { key: "Vienna", value: "VIENNA", country: "Austria" },
  { key: "Warsaw", value: "WARSAW", country: "Poland" },
  { key: "Yerevan", value: "YEREVAN", country: "Armenia" },
  { key: "Zagreb", value: "ZAGREB", country: "Croatia" },
];

const filters = {
  filterConfig: {
    ds: europeanDutyStations.map((ds) => ds.value),
  },
  pagination: {
    page: 0,
    itemPerPage: 50,
    sortBy: "startDate",
    sortDirection: -1,
  },
};

// POST https://careers.un.org/api/public/opening/jo/list/filteredV2/en

type ApiResponse = {
  status: number;
  message: string;
  data: {
    list: CareersUNJob[];
    count: number;
  };
};

type CareersUNJob = {
  _id: string;
  jobId: number;
  language: string;
  categoryCode: string;
  jobTitle: string;
  postingTitle: string;
  jobCodeTitle: string;
  jobDescription: string; // contains HTML
  jobFamilyCode?: string;
  jobLevel?: string;
  dutyStation?: DutyStation[];
  recruitmentType?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  jf?: {
    Code: string;
    Name: string;
  };
  jc?: {
    code: string;
    name: string;
  };
  jl?: {
    code: string;
    name: string;
  };
  dept?: {
    code: string;
    name: string;
  };
  totalCount: number;
};

type DutyStation = {
  _id: string;
  code: string;
  description: string;
};

const extractJobs = async (page: number) => {
  console.log(`Extracting jobs from Careers UN, page ${page}`);

  const response = await fetch(
    `https://careers.un.org/api/public/opening/jo/list/filteredV2/en`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Origin: "https://careers.un.org",
        Referer: "https://careers.un.org/jobopening?language=en",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
      body: JSON.stringify({
        filterConfig: filters.filterConfig,
        pagination: {
          ...filters.pagination,
          page,
        },
      }),
    }
  );

  const res = (await response.json()) as ApiResponse;

  return {
    jobs: res.data.list,
    hasMore: res.data.count > (page + 1) * filters.pagination.itemPerPage,
  };
};

const crawler = async () => {
  const results: Job[] = [];

  let page = 0;
  let hasNextPage = false;
  do {
    const { jobs, hasMore } = await extractJobs(page++);
    results.push(
      ...jobs.map((job) => ({
        uuid: `careersun-${job.jobId}`,
        title: `${job.jobTitle} - ${
          job.dutyStation?.map((ds) => ds.description).join(", ") ||
          "NO_DUTY_STATION"
        } - ${job.jc?.name || "NO_JC"}`,
        url: `https://careers.un.org/jobSearchDescription/${job.jobId}`,
        organization: job.dept?.name || "NO_DEPT",
        description: job.jobDescription,
        updatedAt: new Date(job.startDate),
      }))
    );
    hasNextPage = hasMore;
  } while (hasNextPage);

  return results;
};

export const CareersUNCrawler: Crawler = {
  website: "CareersUN",
  url: "https://careers.un.org/jobopening",
  crawl: crawler,
};
