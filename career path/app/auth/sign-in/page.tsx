import { SiteShell } from "@/components/layout/site-shell";
import { SignInForm } from "@/components/forms/sign-in-form";

export default function SignInPage() {
  return (
    <SiteShell>
      <div className="py-12">
        <SignInForm />
      </div>
    </SiteShell>
  );
}
