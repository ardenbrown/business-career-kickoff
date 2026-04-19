import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/shared/page-hero";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <PageHero
          badge="Privacy policy"
          title="How Business Career Kickoff handles your data"
          description="Plain-language privacy terms for profile data, resumes, and generated outputs."
        />
        <Card className="space-y-5 p-8 text-sm leading-8 text-muted">
          <p>
            Business Career Kickoff stores your profile information, generated outputs, saved jobs,
            and uploaded resumes privately in your account so the platform can provide personalized
            guidance.
          </p>
          <p>
            Uploaded resumes and extracted resume text are used only to generate guidance for the
            logged-in user who uploaded them. They are not shared with other users or third parties.
          </p>
          <p>
            We scope all account data to the authenticated user and do not intentionally expose
            resumes, resume text, or saved outputs publicly.
          </p>
          <p>
            Jobs data may come from external provider APIs. When you click an apply link, you leave
            Business Career Kickoff and continue on the source site.
          </p>
        </Card>
      </div>
    </SiteShell>
  );
}
