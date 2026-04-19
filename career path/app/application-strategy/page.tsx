import { requireUser } from "@/lib/auth-helpers";
import { getUserWorkspace, toStringArray } from "@/lib/data";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { ListBlock } from "@/components/shared/list-block";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ApplicationStrategyPage() {
  const authUser = await requireUser();
  const user = await getUserWorkspace(authUser.id);
  const plan = user?.applicationPlans[0];

  if (!plan) {
    return (
      <SiteShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Generate strategy"
          description="Complete onboarding to build a personalized application plan with role targeting, follow-up timing, and weekly volume guidance."
          title="No application strategy yet"
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Application strategy"
          title="A focused plan for where, when, and how to apply"
          description={plan.summary}
        />
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Weekly target</p>
            <p className="text-2xl font-semibold text-ink">{plan.weeklyTarget}</p>
          </div>
        </Card>
        <div className="grid gap-4 xl:grid-cols-2">
          <ListBlock items={toStringArray(plan.realisticRoles)} title="Which roles are realistic" />
          <ListBlock items={toStringArray(plan.prioritization)} title="How to prioritize companies" />
          <ListBlock items={toStringArray(plan.followUpCadence)} title="When to follow up" />
          <ListBlock items={toStringArray(plan.tailoringChecklist)} title="Tailoring checklist" />
        </div>
      </div>
    </SiteShell>
  );
}
