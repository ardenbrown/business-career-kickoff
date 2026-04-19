import { requireUser } from "@/lib/auth-helpers";
import { getUserWorkspace, toStringArray } from "@/lib/data";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { ResumeUploadCard } from "@/components/resume/upload-card";
import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ResumeFeedbackPage() {
  const authUser = await requireUser();
  const user = await getUserWorkspace(authUser.id);
  const analysis = user?.resumeAnalyses[0];

  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Resume feedback"
          title="Private PDF resume analysis"
          description="Upload a PDF resume for structured feedback on strengths, weaknesses, ATS issues, framing, and role-specific recommendations."
        />
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <ResumeUploadCard />
          {analysis ? (
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-ink">Latest analysis</h3>
                <p className="text-sm leading-7 text-muted">{analysis.overallAssessment}</p>
                <Accordion
                  items={[
                    {
                      title: "Strengths",
                      content: (
                        <ul className="space-y-2">
                          {toStringArray(analysis.strengths).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      title: "Weaknesses",
                      content: (
                        <ul className="space-y-2">
                          {toStringArray(analysis.weaknesses).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      title: "ATS and readability concerns",
                      content: (
                        <ul className="space-y-2">
                          {toStringArray(analysis.atsConcerns).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      title: "Experience framing suggestions",
                      content: (
                        <ul className="space-y-2">
                          {toStringArray(analysis.framingSuggestions).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      title: "Tailored recommendations",
                      content: (
                        <ul className="space-y-2">
                          {toStringArray(analysis.tailoredRecommendations).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          ) : (
            <EmptyState
              description="Upload a resume to receive detailed AI feedback and build a private feedback history."
              title="No resume analysis yet"
            />
          )}
        </div>
        {analysis ? (
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink">Bullet rewriting ideas</h3>
              <div className="space-y-3">
                {(analysis.bulletRewriteIdeas as unknown as Array<{ original: string; rewrite: string }>).map(
                  (item, index) => (
                    <div className="grid gap-3 rounded-2xl border border-border bg-white/85 p-4 md:grid-cols-2" key={`${item.original}-${index}`}>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Before</p>
                        <p className="mt-2 text-sm text-muted">{item.original}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">After</p>
                        <p className="mt-2 text-sm text-ink">{item.rewrite}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </SiteShell>
  );
}
