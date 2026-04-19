import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <SiteShell>
      <div className="py-12">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-ink">Check your email</h1>
            <p className="text-sm leading-7 text-muted">
              We sent a sign-in link to your inbox. Open it on this device to continue.
            </p>
            <Button asChild variant="secondary">
              <Link href="/auth/sign-in">Back to sign in</Link>
            </Button>
          </div>
        </Card>
      </div>
    </SiteShell>
  );
}
