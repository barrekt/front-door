import { PageShell } from "@/components/layout/PageShell"
import { IncidentForm } from "@/components/forms/IncidentForm"

export const metadata = { title: "Report an Incident — DevOps Front Door" }

export default function IncidentPage() {
  return (
    <PageShell
      title="Report an Incident"
      description="Use this form to report a live incident or bug. P1 and P2 incidents will automatically create a Teams war room channel."
    >
      <IncidentForm />
    </PageShell>
  )
}
