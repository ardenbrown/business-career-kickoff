import Link from "next/link";

import { requireUser } from "@/lib/auth-helpers";
import { getUserWorkspace, toStringArray } from "@/lib/data";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { InsightGrid } from "@/components/dashboard/insight-grid";
import { HistoryList } from "@/components/shared/history-list";
import { RecommendedActions } from "@/components/dashboard/recommended-actions";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { RegenerateButton } from "@/components/dashboard/regenerate-button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const authUser = await requireUser();
  const user = await getUserWorkspace(authUser.id);

  if (!user?.profile) {
    return (
      <SiteShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Complete onboarding"
          description="Finish your profile setup to generate dashboard insights, recommendations, outreach guidance, and timeline planning."
          title="Your dashboard is waiting on your profile"
        />
      </SiteShell>
    );
  }

  const dashboard = user.dashboardInsights[0];

  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Dashboard"
          title={`Welcome back, ${user.profile.fullName.split(" ")[0]}`}
          description={dashboard?.headline ?? "Your personalized guidance hub is ready."}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href="/onboarding">Update profile</Link>
              </Button>
              <RegenerateButton />
            </div>
          }
        />

        {dashboard ? (
          <InsightGrid
            cards={[
              { title: "Best-fit roles", items: toStringArray(dashboard.bestFitDirections), href: "/roles" },
              { title: "Resume priorities", items: toStringArray(dashboard.resumePriorities), href: "/resume-feedback" },
              { title: "Outreach priorities", items: toStringArray(dashboard.outreachPriorities), href: "/outreach" },
              { title: "Application priorities", items: toStringArray(dashboard.applicationPriorities), href: "/application-strategy" },
              { title: "Timing advice", items: toStringArray(dashboard.timingAdvice), href: "/timeline" },
            ]}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <RecommendedActions actions={dashboard ? toStringArray(dashboard.nextActions) : []} />
          <HistoryList
            items={user.generatedHistory.map((item) => ({
              id: item.id,
              title: item.title,
              createdAt: item.createdAt,
            }))}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <RecentJobs
            jobs={user.savedJobs.map((job) => ({
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              datePosted: job.datePosted,
              applicationUrl: job.applicationUrl,
            }))}
          />
          <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-panel">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Resume status</h3>
              <p className="text-sm leading-7 text-muted">
                {user.resumes[0]
                  ? `Latest file: ${user.resumes[0].fileName}`
                  : "No resume uploaded yet. Add a PDF to unlock personalized feedback."}
              </p>
              <Button asChild>
                <Link href="/resume-feedback">
                  {user.resumes[0] ? "Open resume feedback" : "Upload resume"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
