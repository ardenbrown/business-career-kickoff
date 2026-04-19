import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Terms"
          title="Business Career Kickoff terms"
          description="Basic product terms and disclaimers."
        />
        <Card className="space-y-5 p-8 text-sm leading-8 text-muted">
          <p>
            Business Career Kickoff provides AI-assisted career guidance for informational purposes.
            It does not guarantee interviews, offers, or employment outcomes.
          </p>
          <p>
            AI-generated role recommendations, resume guidance, outreach drafts, application plans,
            and job-match rationales should be reviewed by the user before being used.
          </p>
          <p>
            Job postings are dependent on third-party provider availability and may change, close,
            or expire without notice.
          </p>
          <p>
            Users are responsible for the accuracy of their profile details, uploaded documents, and
            application materials.
          </p>
        </Card>
      </div>
    </SiteShell>
  );
}
