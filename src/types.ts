export interface Crawler {
  website: string;
  prefix: string;
  url: string;
  crawl: () => Promise<Job[]>;
}

export interface Job {
  uuid: string;
  title: string;
  url: string;
  organization?: string;
  description?: string;
  updatedAt?: Date;
}
