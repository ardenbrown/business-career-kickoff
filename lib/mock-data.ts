import { differenceInWeeks, format } from "date-fns";
import { JobSearchStage, type Profile } from "@prisma/client";

import type {
  ApplicationPlanPayload,
  DashboardPayload,
  OutreachPayload,
  ResumeAnalysisPayload,
  RoleRecommendationsPayload,
  TimelinePayload,
} from "@/lib/types";

function profileStageLabel(stage: JobSearchStage) {
  return stage.toLowerCase().replace("_", " ");
}

export function buildDashboardFallback(profile: Profile): DashboardPayload {
  return {
    headline: `${profile.major} candidate with momentum toward ${profile.industryInterest.toLowerCase()} roles`,
    bestFitDirections: [
      `${profile.industryInterest} coordinator and analyst tracks`,
      `Entry-level rotational programs at ${profile.companyTypes[0] ?? "target"} companies`,
      `Hybrid roles in ${profile.preferredLocations[0] ?? "your preferred markets"}`,
    ],
    resumePriorities: [
      "Lead with quantified internship or campus impact.",
      "Align bullets to problem solving, ownership, and communication.",
      "Move the strongest business tools and coursework above lower-signal content.",
    ],
    outreachPriorities: [
      `Reach out to alumni in ${profile.industryInterest.toLowerCase()}.`,
      "Prioritize warm introductions before cold outreach.",
      "Build a short target list of 20 people and follow up consistently.",
    ],
    applicationPriorities: [
      "Focus on high-fit coordinator, analyst, and associate openings.",
      "Tailor the top third of applications each week rather than lightly editing everything.",
      "Use company-type preference to narrow search volume.",
    ],
    timingAdvice: [
      `You are currently in the ${profileStageLabel(profile.jobSearchStage)} stage.`,
      `Target serious application volume 6-10 weeks before ${format(profile.earliestStartDate, "MMM d, yyyy")}.`,
      "Treat resume refresh and networking as parallel tracks, not sequential tasks.",
    ],
    nextActions: [
      "Refresh your top resume bullets this week.",
      "Send five targeted outreach messages in the next seven days.",
      "Bookmark recent roles and build a follow-up tracker.",
    ],
  };
}

export function buildRoleRecommendationsFallback(
  profile: Profile,
): RoleRecommendationsPayload {
  return {
    summary: `Based on your ${profile.major.toLowerCase()} background, ${profile.industryInterest.toLowerCase()} interest, and ${profile.yearsExperience.toLowerCase()}, your best near-term targets are structured entry-level roles with room to grow into strategy or ownership.`,
    roleCategories: [
      {
        category: `${profile.industryInterest} coordinator`,
        fitReason:
          "This path fits business grads who can organize workstreams, communicate with multiple stakeholders, and grow into specialist ownership quickly.",
        titles: [
          "Marketing Coordinator",
          "Business Development Coordinator",
          "Partnerships Coordinator",
        ],
        companyGuidance:
          "Target established teams with defined onboarding if you want skill depth fast; target growth-stage firms if you want broader ownership.",
        skillGaps: [
          "Proof of measurable business outcomes",
          "Sharper portfolio or project examples",
        ],
      },
      {
        category: "Analyst and associate programs",
        fitReason:
          "Analyst tracks give new grads structure, strong signaling on a resume, and better exposure to internal stakeholders.",
        titles: [
          "Business Analyst",
          "Operations Analyst",
          "Growth Analyst",
        ],
        companyGuidance:
          "Use larger companies for rotational or formal analyst programs and mid-sized companies for cross-functional execution roles.",
        skillGaps: ["Advanced spreadsheet storytelling", "Interview-ready case examples"],
      },
    ],
    competitiveness: [
      {
        path: "Brand-name company programs",
        competitiveness: "High",
        advice: "Keep these in the mix, but balance them with mid-market and regional targets.",
      },
      {
        path: "Coordinator roles at growing firms",
        competitiveness: "Moderate",
        advice: "These are often more accessible if you show initiative and relevant execution proof.",
      },
    ],
    keywords: [
      "coordinator",
      "associate",
      "analyst",
      profile.industryInterest,
      profile.preferredLocations[0] ?? "remote",
    ],
  };
}

export function buildResumeFallback(profile: Profile): ResumeAnalysisPayload {
  return {
    overallAssessment:
      "Your resume likely has the right raw ingredients for early-career business roles, but it should do a better job converting experiences into clear business outcomes.",
    strengths: [
      "Relevant business direction and early-career positioning",
      "Likely mix of coursework, campus work, and internship signals",
      "Adaptable for multiple entry-level role families",
    ],
    weaknesses: [
      "Bullets may describe tasks more than impact",
      "Top section may not point clearly at your target roles",
      "Some experience lines may not carry enough numbers or scope",
    ],
    atsConcerns: [
      "Mirror more of the exact keywords used in coordinator and analyst openings.",
      "Use standard headings and consistent date formatting.",
    ],
    framingSuggestions: [
      `Frame projects around decisions, recommendations, or process improvement related to ${profile.industryInterest.toLowerCase()}.`,
      "Move the most relevant internship and leadership evidence higher on the page.",
    ],
    bulletRewriteIdeas: [
      {
        original: "Helped with marketing campaigns.",
        rewrite:
          "Coordinated campaign tasks across email and social channels, helping deliver launches on time and improving team reporting clarity.",
      },
      {
        original: "Worked with team on business project.",
        rewrite:
          "Partnered with a 4-person team to analyze customer trends and present recommendations that informed the final project strategy.",
      },
    ],
    tailoredRecommendations: [
      "Add a concise target-role summary if you are applying across a focused set of roles.",
      "Quantify internship, campus, and project outcomes wherever possible.",
      "Tailor your top keywords to the specific role family before each batch of applications.",
    ],
  };
}

export function buildOutreachFallback(
  profile: Profile,
  tone: string,
): OutreachPayload {
  return {
    networkingEmail: {
      subject: `Business student exploring ${profile.industryInterest} careers`,
      body: `Hi [Name],\n\nI’m a ${profile.major} student preparing for ${profile.industryInterest.toLowerCase()} roles and noticed your background in this space. I’m building a focused search around ${profile.targetRoleFocus ?? "entry-level business roles"} and would value 15 minutes to hear how you approached the field.\n\nThank you,\n${profile.fullName}`,
    },
    linkedInMessage: {
      body: `Hi [Name], I’m a ${profile.major} student targeting ${profile.industryInterest.toLowerCase()} roles. Your path stood out to me, and I’d love to connect and learn from your experience if you’re open to it.`,
    },
    informationalInterviewRequest: {
      subject: `Quick informational chat about ${profile.industryInterest}`,
      body: `Hi [Name],\n\nI’m exploring early-career roles in ${profile.industryInterest.toLowerCase()} and am reaching out to a small group of professionals whose paths look especially relevant. If you have 15 minutes in the next two weeks, I’d appreciate the chance to ask a few focused questions.\n\nBest,\n${profile.fullName}`,
    },
    followUpNote: {
      subject: "Following up on my note",
      body: `Hi [Name],\n\nI wanted to follow up in case my last message got buried. I’m continuing to refine my search for ${profile.industryInterest.toLowerCase()} roles and would appreciate a short conversation if your schedule allows.\n\nThank you,\n${profile.fullName}`,
    },
    thankYouEmail: {
      subject: "Thank you",
      body: `Hi [Name],\n\nThank you again for taking the time to speak with me. Your advice about positioning for ${profile.industryInterest.toLowerCase()} roles was especially helpful, and I’m already applying it to my search.\n\nBest,\n${profile.fullName}`,
    },
    tips: [
      `${tone} tone works best when you are early in the process and asking for insight rather than a referral.`,
      "Reference one specific reason you chose that person.",
      "Keep first-touch messages short enough to scan on a phone.",
    ],
  };
}

export function buildApplicationPlanFallback(
  _profile: Profile,
): ApplicationPlanPayload {
  return {
    summary:
      "Run a focused search built around role families you can credibly win now, with a smaller stream of stretch applications layered on top.",
    weeklyTarget: "8-12 tailored applications plus 5 outreach messages per week",
    realisticRoles: [
      "Coordinator roles",
      "Analyst roles with training support",
      "Associate and rotational programs",
    ],
    prioritization: [
      "Prioritize companies where your location, industry interest, and experience signal align clearly.",
      "Apply to high-fit openings within the first week when possible.",
      "Balance prestige targets with faster-moving mid-sized employers.",
    ],
    followUpCadence: [
      "Follow up 7-10 days after applying if you have a warm contact or high-fit case.",
      "Use a second follow-up only when you can add value or a real update.",
    ],
    tailoringChecklist: [
      "Match the resume headline and keywords to the role family.",
      "Adjust two to four bullets to reflect the posting.",
      "Use the cover note or outreach message to explain fit and timing.",
    ],
  };
}

export function buildTimelineFallback(profile: Profile): TimelinePayload {
  const totalWeeks = Math.max(
    6,
    differenceInWeeks(profile.earliestStartDate, new Date(), { roundingMethod: "ceil" }),
  );
  const milestones = [
    {
      label: "Resume revision sprint",
      timeframe: `Week 1`,
      description: "Rewrite the top section and strongest experience bullets around target roles.",
      editable: true,
    },
    {
      label: "Outreach launch",
      timeframe: `Week 2`,
      description: "Build a 20-person alumni and professional contact list and send your first wave.",
      editable: true,
    },
    {
      label: "Applications ramp",
      timeframe: `Weeks 2-4`,
      description: "Submit tailored applications with a repeatable weekly cadence.",
      editable: true,
    },
    {
      label: "Interview preparation",
      timeframe: `Weeks 4-6`,
      description: "Prepare stories, role-specific questions, and company research briefs.",
      editable: true,
    },
    {
      label: "Offer-readiness window",
      timeframe: `By ${format(profile.earliestStartDate, "MMM d, yyyy")}`,
      description: `Plan backwards from your earliest start date across roughly ${totalWeeks} weeks.`,
      editable: false,
    },
  ];

  return {
    summary:
      "Your plan should front-load positioning work, then shift into a disciplined outreach and application cadence tied to your start-date window.",
    timelineMode: totalWeeks <= 10 ? "weekly" : "monthly",
    milestones,
  };
}

export function buildJobsFallback() {
  return [];
}
