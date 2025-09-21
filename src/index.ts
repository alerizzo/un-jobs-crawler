#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { UNJobsCrawler } from "./crawlers/unjobs";
import { CareersUNCrawler } from "./crawlers/careersun";
import { Job } from "./types";
import { EmailService } from "./email";
import fs from "fs";

const program = new Command();

program
  .name("un-jobs-crawler")
  .description("A command line application for crawling UN jobs")
  .version(version);

program
  .command("crawl")
  .description("Start crawling UN jobs")
  .option("-o, --output <file>", "output file for results")
  .option("-c, --compare <file>", "compare file for results")
  .option("-x, --compare-output <file>", "output file for new jobs")
  .option("-e, --email <email>", "email address to send new jobs to")
  .action(async (options) => {
    try {
      console.log("🚀 Starting UN jobs crawler...");

      const crawlers = [UNJobsCrawler, CareersUNCrawler];
      const jobs: Job[] = [];

      // Crawl jobs from all sources with error handling
      for (const crawler of crawlers) {
        try {
          console.log(`📡 Crawling from ${crawler.website}...`);
          const crawlerJobs = await crawler.crawl();
          jobs.push(...crawlerJobs);
          console.log(
            `✅ Found ${crawlerJobs.length} jobs from ${crawler.website}`
          );
        } catch (error) {
          console.error(`❌ Failed to crawl from ${crawler.website}:`, error);
          // Continue with other crawlers even if one fails
        }
      }

      if (jobs.length === 0) {
        console.warn("⚠️ No jobs found from any crawler");
        return;
      }

      console.log(`📊 Total jobs found: ${jobs.length}`);

      // Compare with existing jobs if comparison file is provided
      let newJobs: Job[] = [];
      if (options.compare) {
        try {
          if (!fs.existsSync(options.compare)) {
            console.warn(`⚠️ Compare file not found: ${options.compare}`);
          } else {
            console.log(
              `🔍 Comparing with existing jobs from ${options.compare}...`
            );
            const compareData = fs.readFileSync(options.compare, "utf8");
            const compareJobs = JSON.parse(compareData) as Job[];

            const compareJobsSet = new Set(
              compareJobs.map((job: Job) => job.uuid)
            );
            newJobs = jobs.filter((job) => !compareJobsSet.has(job.uuid));
            console.log(`🆕 Found ${newJobs.length} new jobs`);

            // Save new jobs to comparison output file if specified
            if (options.compareOutput) {
              try {
                fs.writeFileSync(
                  options.compareOutput,
                  JSON.stringify(newJobs, null, 2)
                );
                console.log(`💾 New jobs saved to ${options.compareOutput}`);
              } catch (error) {
                console.error(`❌ Failed to write new jobs file: ${error}`);
              }
            } else {
              console.log("🔍 New jobs:");
              console.dir(newJobs, { depth: null });
            }
          }
        } catch (error) {
          console.error(`❌ Error processing compare file: ${error}`);
          console.log("🔄 Treating all jobs as new...");
        }
      }

      // Save all jobs to output file if specified
      if (options.output) {
        try {
          fs.writeFileSync(options.output, JSON.stringify(jobs, null, 2));
          console.log(`💾 All jobs saved to ${options.output}`);
        } catch (error) {
          console.error(`❌ Failed to write output file: ${error}`);
        }
      } else {
        console.log("🔍 All jobs:");
        console.dir(jobs, { depth: null });
      }

      // Send email notification if email option is provided
      if (options.email) {
        try {
          await EmailService.sendNewJobsNotification({
            to: options.email,
            jobs: newJobs,
          });
        } catch (error) {
          console.error("❌ Email sending failed:", error);
        }
      }

      console.log("✅ Crawling completed successfully!");
    } catch (error) {
      console.error("💥 Fatal error during crawling process:", error);
      process.exit(1);
    }
  });

program.parse();
