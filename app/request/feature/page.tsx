import { PageShell } from "@/components/layout/PageShell"
import { FeatureRequestForm } from "@/components/forms/FeatureRequestForm"

export const metadata = { title: "Request a Feature — DevOps Front Door" }

export default function FeatureRequestPage() {
  return (
    <PageShell
      title="Request a Feature"
      description="Submit a feature request to our delivery backlog. We review all requests and will follow up directly."
    >
      <FeatureRequestForm />
    </PageShell>
  )
}
