import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";

export default function NotFound() {
  return (
    <div className="py-16">
      <StatePanel
        state="empty"
        title="Page not found"
        description="The page you requested does not exist in this demo deployment."
        action={
          <Link href="/" className={buttonStyles("secondary")}>
            Return home
          </Link>
        }
      />
    </div>
  );
}
