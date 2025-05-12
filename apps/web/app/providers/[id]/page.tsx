import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ProviderDetails } from "@/components/provider-details"
import { ProviderDetailsSkeleton } from "@/components/skeletons/provider-details-skeleton"
import { getProviderById } from "@/lib/core/services/providers-service"

export default async function ProviderPage({ params }: { params: { id: string } }) {
  const provider = await getProviderById(params.id)

  if (!provider) {
    notFound()
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <Suspense fallback={<ProviderDetailsSkeleton />}>
          <ProviderDetails provider={provider} />
        </Suspense>
      </div>
    </main>
  )
}
