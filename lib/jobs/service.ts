import { addHours } from "date-fns";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AdzunaProvider } from "@/lib/jobs/adzuna";
import type { JobListing } from "@/lib/types";
import type { JobSearchInput, JobsProvider } from "@/lib/jobs/types";
import { slugify } from "@/lib/utils";

const providers = [new AdzunaProvider()];

function createCacheKey(input: JobSearchInput) {
  return [
    input.query,
    input.location,
    input.experienceLevel,
    input.companyType,
    input.roleCategory,
    input.remoteMode,
    input.recencyDays,
    input.sort,
  ]
    .filter(Boolean)
    .map((value) => slugify(String(value)))
    .join(":");
}

function createMatchRationale(job: JobListing, profileSummary: string) {
  return `${job.title} aligns with ${profileSummary} and your stated interest in ${job.roleCategory ?? "closely related roles"}.`;
}

function uniqueStrings(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function expandQueries(input: JobSearchInput) {
  const baseQuery = input.query.trim();
  const roleCategory = input.roleCategory?.trim();
  const fragments = baseQuery
    .split(/[,&/]| and /i)
    .map((part) => part.trim())
    .filter(Boolean);

  return uniqueStrings([
    baseQuery,
    roleCategory,
    fragments[0],
    `${fragments[0] ?? baseQuery} coordinator`,
    `${fragments[0] ?? baseQuery} analyst`,
    "business analyst",
    "coordinator",
    "analyst",
    "entry level business",
  ]);
}

function expandLocations(input: JobSearchInput) {
  const location = input.location?.trim();
  return uniqueStrings([
    location,
    location === "Los Angeles" ? "Los Angeles, CA" : undefined,
    location === "New York" ? "New York, NY" : undefined,
    "Remote",
    undefined,
  ]);
}

async function fetchAndCacheProviderResults(
  input: JobSearchInput,
  provider: JobsProvider,
  profileSummary: string,
) {
  const cacheKey = createCacheKey(input);
  const jobs = await provider.searchJobs(input);
  const normalized = jobs.map((job) => ({
    ...job,
    matchRationale: createMatchRationale(job, profileSummary),
  }));

  await prisma.jobCache.upsert({
    where: { cacheKey },
    update: {
      jobs: normalized as unknown as Prisma.JsonArray,
      expiresAt: addHours(new Date(), 6),
      fetchedAt: new Date(),
    },
    create: {
      cacheKey,
      source: provider.source,
      query: input.query,
      location: input.location,
      experienceLevel: input.experienceLevel,
      roleCategory: input.roleCategory,
      remoteMode: input.remoteMode,
      jobs: normalized as unknown as Prisma.JsonArray,
      expiresAt: addHours(new Date(), 6),
    },
  });

  return normalized;
}

export async function searchJobsWithCache(input: JobSearchInput, profileSummary: string) {
  const cacheKey = createCacheKey(input);
  const cached = await prisma.jobCache.findUnique({
    where: { cacheKey },
  });

  if (cached && cached.expiresAt > new Date()) {
    const jobs = cached.jobs as unknown as JobListing[];
    return jobs
      .filter((job) => matchesCompanyType(job, input.companyType))
      .map((job) => ({
      ...job,
      matchRationale: job.matchRationale ?? createMatchRationale(job, profileSummary),
      }));
  }

  const attempts = expandQueries(input).flatMap((query) =>
    expandLocations(input).map((location) => ({
      ...input,
      query,
      location,
    })),
  );

  for (const provider of providers) {
    try {
      for (const attempt of attempts) {
        const normalized = await fetchAndCacheProviderResults(
          attempt,
          provider,
          profileSummary,
        );
        const filtered = normalized.filter((job) => matchesCompanyType(job, input.companyType));

        if (filtered.length) {
          return filtered;
        }
      }
    } catch (error) {
      console.error(`${provider.source} jobs lookup failed:`, error);
    }
  }

  if (cached) {
    return (cached.jobs as unknown as JobListing[])
      .filter((job) => matchesCompanyType(job, input.companyType))
      .map((job) => ({
      ...job,
      matchRationale: job.matchRationale ?? createMatchRationale(job, profileSummary),
      }));
  }

  return [];
}

function matchesCompanyType(job: JobListing, companyType?: string) {
  if (!companyType) {
    return true;
  }

  const haystack = `${job.company} ${job.shortDescription}`.toLowerCase();
  const needle = companyType.toLowerCase();

  return haystack.includes(needle);
}
