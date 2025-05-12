"use client"

import { useProviders } from "@/context/providers-context"
import { Button } from "@/components/ui/button"
import { List, Map } from "lucide-react"
import Link from "next/link"

export function ViewToggle() {
  const { viewMode, setViewMode } = useProviders()

  return (
    <div className="flex justify-end">
      {viewMode === "list" ? (
        <Button variant="outline" size="sm" asChild>
          <Link href="/map">
            <Map className="mr-2 h-4 w-4" />
            Map View
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <List className="mr-2 h-4 w-4" />
            List View
          </Link>
        </Button>
      )}
    </div>
  )
}
