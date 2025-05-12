"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Globe, ArrowLeft, MapIcon } from "lucide-react"
import type { Office } from "@/lib/core/models/office"
import { MapContainer } from "./map-container"

interface ProviderDetailsProps {
  provider: Office
}

export function ProviderDetails({ provider }: ProviderDetailsProps) {
  const [showMap, setShowMap] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-2xl">{provider.name}</CardTitle>
              <p className="text-muted-foreground">{provider.organizationName}</p>
            </div>
            <Badge variant={provider.isPrincipal ? "default" : "outline"} className="w-fit">
              {provider.isPrincipal ? "Principal Office" : "Extension Office"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  {provider.address.formattedAddress.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <a href={`tel:${provider.phone}`} className="hover:underline">
                    {provider.phone}
                  </a>
                </div>
              </div>

              {provider.email && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <a href={`mailto:${provider.email}`} className="hover:underline">
                      {provider.email}
                    </a>
                  </div>
                </div>
              )}

              {provider.website && (
                <div className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {provider.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div>
              {provider.location ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => setShowMap(!showMap)}>
                    <MapIcon className="mr-2 h-4 w-4" />
                    {showMap ? "Hide map" : "Show on map"}
                  </Button>

                  {showMap && (
                    <div className="h-[300px] overflow-hidden rounded-md border">
                      <MapContainer
                        providers={[provider]}
                        center={provider.location}
                        zoom={14}
                        key={`map-${provider.id}`} // Add a key to force re-render
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border p-4 text-center text-muted-foreground">
                  Map location not available
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={`tel:${provider.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </a>
            </Button>

            {provider.email && (
              <Button variant="outline" asChild>
                <a href={`mailto:${provider.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            )}

            {provider.website && (
              <Button variant="outline" asChild>
                <a href={provider.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}

            {provider.location && (
              <Button variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${provider.location.latitude},${provider.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
