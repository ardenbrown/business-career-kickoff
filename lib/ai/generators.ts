import { ContentType, JobSearchStage, Prisma, type Profile } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type {
  ApplicationPlanPayload,
  DashboardPayload,
  OutreachPayload,
  RoleRecommendationsPayload,
  TimelinePayload,
} from "@/lib/types";
import {
  buildApplicationPlanFallback,
  buildDashboardFallback,
  buildOutreachFallback,
  buildResumeFallback,
  buildRoleRecommendationsFallback,
  buildTimelineFallback,
} from "@/lib/mock-data";
import {
  applicationPlanSchema,
  dashboardSchema,
  outreachSchema,
  resumeAnalysisSchema,
  roleRecommendationsSchema,
  timelineSchema,
} from "@/lib/ai/schemas";
import { extractJsonObject, generateStructuredObject, getOpenAIClient } from "@/lib/ai/client";

function serializeProfile(profile: Profile) {
  return JSON.stringify(
    {
      fullName: profile.fullName,
      major: profile.major,
      industryInterest: profile.industryInterest,
      companyTypes: profile.companyTypes,
      preferredLocations: profile.preferredLocations,
      yearsExperience: profile.yearsExperience,
      graduationDate: profile.graduationDate,
      jobSearchStage: profile.jobSearchStage,
      earliestStartDate: profile.earliestStartDate,
      bio: profile.bio,
      targetRoleFocus: profile.targetRoleFocus,
    },
    null,
    2,
  );
}

async function withFallback<T>(run: () => Promise<T>, fallback: () => T) {
  if (!getOpenAIClient()) {
    return { payload: fallback(), source: "fallback" as const };
  }

  try {
    return { payload: await run(), source: "ai" as const };
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return { payload: fallback(), source: "fallback" as const };
  }
}

async function logHistory(userId: string, type: ContentType, title: string, payload: Prisma.JsonObject) {
  await prisma.generatedContentHistory.create({
    data: {
      userId,
      contentType: type,
      title,
      payload,
    },
  });
}

export async function generateDashboardInsight(profile: Profile, userId: string) {
  const { payload } = await withFallback<DashboardPayload>(
    async () =>
      generateStructuredObject({
        schema: dashboardSchema,
        system:
          "You generate highly actionable early-career business guidance. Make recommendations specific, realistic, and concise.",
        prompt: `Create a personalized dashboard summary for this user profile.\n${serializeProfile(profile)}\nFocus on role direction, resume priorities, outreach priorities, application priorities, timing advice, and next actions.`,
      }),
    () => buildDashboardFallback(profile),
  );

  await prisma.dashboardInsight.create({
    data: {
      userId,
      headline: payload.headline,
      bestFitDirections: payload.bestFitDirections as Prisma.JsonArray,
      resumePriorities: payload.resumePriorities as Prisma.JsonArray,
      outreachPriorities: payload.outreachPriorities as Prisma.JsonArray,
      applicationPriorities: payload.applicationPriorities as Prisma.JsonArray,
      timingAdvice: payload.timingAdvice as Prisma.JsonArray,
      nextActions: payload.nextActions as Prisma.JsonArray,
    },
  });

  await logHistory(userId, ContentType.DASHBOARD, "Dashboard insight", payload as Prisma.JsonObject);

  return payload;
}

export async function generateRoleRecommendations(profile: Profile, userId: string) {
  const { payload } = await withFallback<RoleRecommendationsPayload>(
    async () =>
      generateStructuredObject({
        schema: roleRecommendationsSchema,
        system:
          "You generate role recommendations for college business seniors and recent graduates. Be specific and field-aware.",
        prompt: `Recommend role categories, titles to search, company-type guidance, skill gaps, competitiveness, and search keywords for this user profile.\n${serializeProfile(profile)}`,
      }),
    () => buildRoleRecommendationsFallback(profile),
  );

  await prisma.roleRecommendation.create({
    data: {
      userId,
      summary: payload.summary,
      roleCategories: payload.roleCategories as Prisma.JsonArray,
      keywords: payload.keywords as Prisma.JsonArray,
      competitiveness: payload.competitiveness as Prisma.JsonArray,
    },
  });

  await logHistory(
    userId,
    ContentType.ROLE_RECOMMENDATION,
    "Role recommendations",
    payload as Prisma.JsonObject,
  );

  return payload;
}

export async function generateResumeAnalysis(profile: Profile, userId: string, resumeText: string, resumeId?: string) {
  const fallback = buildResumeFallback(profile);
  let payload = fallback;
  let source = "fallback" as const;
  const client = getOpenAIClient();

  if (client) {
    try {
      const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You are an expert early-career resume reviewer for business candidates. Return valid JSON only. Use exactly these keys: overallAssessment, strengths, weaknesses, atsConcerns, framingSuggestions, bulletRewriteIdeas, tailoredRecommendations.",
          },
          {
            role: "user",
            content: `Review this resume for the following user profile.\nProfile:\n${serializeProfile(profile)}\nResume text:\n${resumeText.slice(0, 12000)}\nReturn concise but specific feedback that references the resume itself when possible.`,
          },
        ],
      });

      const parsed = resumeAnalysisSchema.partial().parse(
        JSON.parse(extractJsonObject(response.output_text)),
      );

      payload = {
        overallAssessment: parsed.overallAssessment ?? fallback.overallAssessment,
        strengths: parsed.strengths?.length ? parsed.strengths : fallback.strengths,
        weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : fallback.weaknesses,
        atsConcerns: parsed.atsConcerns?.length ? parsed.atsConcerns : fallback.atsConcerns,
        framingSuggestions: parsed.framingSuggestions?.length
          ? parsed.framingSuggestions
          : fallback.framingSuggestions,
        bulletRewriteIdeas: parsed.bulletRewriteIdeas?.length
          ? parsed.bulletRewriteIdeas
          : fallback.bulletRewriteIdeas,
        tailoredRecommendations: parsed.tailoredRecommendations?.length
          ? parsed.tailoredRecommendations
          : fallback.tailoredRecommendations,
      };

      source = "ai";
    } catch (error) {
      console.error("AI generation failed, using fallback:", error);
    }
  }

  await prisma.resumeAnalysis.create({
    data: {
      userId,
      resumeId,
      source,
      extractedTextSample: resumeText.slice(0, 1200),
      overallAssessment: payload.overallAssessment,
      strengths: payload.strengths as Prisma.JsonArray,
      weaknesses: payload.weaknesses as Prisma.JsonArray,
      atsConcerns: payload.atsConcerns as Prisma.JsonArray,
      framingSuggestions: payload.framingSuggestions as Prisma.JsonArray,
      bulletRewriteIdeas: payload.bulletRewriteIdeas as Prisma.JsonArray,
      tailoredRecommendations: payload.tailoredRecommendations as Prisma.JsonArray,
    },
  });

  await logHistory(
    userId,
    ContentType.RESUME_ANALYSIS,
    "Resume feedback",
    payload as Prisma.JsonObject,
  );

  return payload;
}

export async function generateOutreachTemplates(profile: Profile, userId: string, tone: string) {
  const { payload } = await withFallback<OutreachPayload>(
    async () =>
      generateStructuredObject({
        schema: outreachSchema,
        system:
          "You write personalized outreach templates for students and recent graduates. Keep them specific, professional, and usable as-is.",
        prompt: `Generate networking email, LinkedIn outreach, informational interview request, follow-up, thank-you email, and profile-aware tips in a ${tone} tone.\n${serializeProfile(profile)}`,
      }),
    () => buildOutreachFallback(profile, tone),
  );

  await prisma.outreachTemplateSet.create({
    data: {
      userId,
      tone,
      networkingEmail: payload.networkingEmail as Prisma.JsonObject,
      linkedInMessage: payload.linkedInMessage as Prisma.JsonObject,
      interviewRequest: payload.informationalInterviewRequest as Prisma.JsonObject,
      followUpNote: payload.followUpNote as Prisma.JsonObject,
      thankYouEmail: payload.thankYouEmail as Prisma.JsonObject,
      tips: payload.tips as Prisma.JsonArray,
    },
  });

  await logHistory(userId, ContentType.OUTREACH, `Outreach templates (${tone})`, payload as Prisma.JsonObject);

  return payload;
}

export async function generateApplicationPlan(profile: Profile, userId: string) {
  const { payload } = await withFallback<ApplicationPlanPayload>(
    async () =>
      generateStructuredObject({
        schema: applicationPlanSchema,
        system:
          "You create realistic early-career business application strategies. Balance ambition with probability of conversion.",
        prompt: `Generate an application strategy for this user. Include weekly volume guidance, realistic role bands, company prioritization, follow-up cadence, and tailoring checklist.\n${serializeProfile(profile)}`,
      }),
    () => buildApplicationPlanFallback(),
  );

  await prisma.applicationPlan.create({
    data: {
      userId,
      summary: payload.summary,
      weeklyTarget: payload.weeklyTarget,
      realisticRoles: payload.realisticRoles as Prisma.JsonArray,
      prioritization: payload.prioritization as Prisma.JsonArray,
      followUpCadence: payload.followUpCadence as Prisma.JsonArray,
      tailoringChecklist: payload.tailoringChecklist as Prisma.JsonArray,
    },
  });

  await logHistory(
    userId,
    ContentType.APPLICATION_PLAN,
    "Application strategy",
    payload as Prisma.JsonObject,
  );

  return payload;
}

export async function generateTimelinePlan(profile: Profile, userId: string) {
  const { payload } = await withFallback<TimelinePayload>(
    async () =>
      generateStructuredObject({
        schema: timelineSchema,
        system:
          "You build a practical search timeline for a college business senior or recent graduate. Be date-aware and action-oriented.",
        prompt: `Create a personalized timeline plan using graduation date, earliest start date, and current search stage. Stage enum reference: ${Object.values(JobSearchStage).join(", ")}.\n${serializeProfile(profile)}`,
      }),
    () => buildTimelineFallback(profile),
  );

  await prisma.timelinePlan.create({
    data: {
      userId,
      summary: payload.summary,
      timelineMode: payload.timelineMode,
      milestones: payload.milestones as Prisma.JsonArray,
    },
  });

  await logHistory(userId, ContentType.TIMELINE, "Timeline plan", payload as Prisma.JsonObject);

  return payload;
}

export async function regenerateCoreOutputs(profile: Profile, userId: string) {
  const [dashboard, roles, outreach, applicationPlan, timeline] = await Promise.all([
    generateDashboardInsight(profile, userId),
    generateRoleRecommendations(profile, userId),
    generateOutreachTemplates(profile, userId, "Professional"),
    generateApplicationPlan(profile, userId),
    generateTimelinePlan(profile, userId),
  ]);

  return { dashboard, roles, outreach, applicationPlan, timeline };
}
