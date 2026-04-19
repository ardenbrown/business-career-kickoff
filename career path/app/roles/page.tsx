import { requireUser } from "@/lib/auth-helpers";
import { getUserWorkspace } from "@/lib/data";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function RolesPage() {
  const authUser = await requireUser();
  const user = await getUserWorkspace(authUser.id);
  const recommendation = user?.roleRecommendations[0];

  if (!recommendation) {
    return (
      <SiteShell>
        <EmptyState
          actionHref="/onboarding"
          actionLabel="Generate recommendations"
          description="Complete onboarding to receive AI-generated role categories, title ideas, search keywords, and competitiveness guidance."
          title="No recommendations yet"
        />
      </SiteShell>
    );
  }

  const roleCategories = recommendation.roleCategories as unknown as Array<{
    category: string;
    fitReason: string;
    titles: string[];
    companyGuidance: string;
    skillGaps: string[];
  }>;
  const competitiveness = recommendation.competitiveness as unknown as Array<{
    path: string;
    competitiveness: string;
    advice: string;
  }>;
  const keywords = recommendation.keywords as unknown as string[];

  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Role recommendations"
          title="Role directions matched to your profile"
          description={recommendation.summary}
        />
        <div className="grid gap-4 xl:grid-cols-2">
          {roleCategories.map((item) => (
            <Card className="p-6" key={item.category}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-ink">{item.category}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.fitReason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Titles to search</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.titles.map((title) => (
                      <span className="rounded-full bg-primary/5 px-3 py-1 text-sm text-primary" key={title}>
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Company guidance</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.companyGuidance}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Skill gaps to address</p>
                  <ul className="mt-2 space-y-2">
                    {item.skillGaps.map((gap) => (
                      <li className="text-sm text-muted" key={gap}>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">How competitive each path may be</h3>
              <div className="space-y-3">
                {competitiveness.map((item) => (
                  <div className="rounded-2xl border border-border bg-white/80 p-4" key={item.path}>
                    <p className="text-sm font-semibold text-ink">{item.path}</p>
                    <p className="text-sm text-primary">{item.competitiveness}</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{item.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Copyable search keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span className="rounded-full border border-border bg-white px-3 py-1 text-sm text-ink" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SiteShell>
  );
}
