import { Job } from "./types";
import OpenAI from "openai";

export type JobRelevance = {
  job_id: string;
  reasoning?: string;
  category?:
    | "relevant"
    | "potentiallyRelevant"
    | "needsHumanReview"
    | "notRelevant";
};

const openApiKey = process.env.OPENAI_API_KEY;
const openAiClient = openApiKey
  ? new OpenAI({
      apiKey: openApiKey,
    })
  : null;

export const findMostRelevantJobs = async (jobs: Job[]) => {
  if (!openAiClient) {
    console.error("❌ OpenAI API key not found");
    return [];
  }

  console.log("🤖 Finding most relevant jobs...");

  let evaluations: JobRelevance[] = [];

  // to avoid being rate limited, we will only process 20 jobs at a time
  for (let i = 0; i < jobs.length; i += 20) {
    console.log(`🔍 Processing jobs ${i} to ${i + 20} of ${jobs.length}...`);
    const jobsToProcess = jobs
      .slice(i, i + 20)
      .map((j) => ({ ...j, description: "" }));

    const response = await openAiClient.responses.create({
      prompt: {
        id: "pmpt_68d6c2e541748195b85f09cf1394c2020f104ad120ecb8e7",
        version: "4",
        variables: {
          list_of_jobs: JSON.stringify(jobsToProcess),
        },
      },
    });

    evaluations.push(...JSON.parse(response.output_text).evaluations);
  }

  console.log("✅ Found most relevant jobs...");

  return evaluations;
};
