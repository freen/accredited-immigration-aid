"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe, Mail, ExternalLink } from "lucide-react"
import type { Office } from "@/lib/core/models/office"

interface ProviderCardProps {
  provider: Office
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          <Badge variant={provider.isPrincipal ? "default" : "outline"}>
            {provider.isPrincipal ? "Principal" : "Extension"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{provider.organizationName}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-start space-x-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            {provider.address.formattedAddress.map((line, i) => (
              <p key={i} className="text-sm">
                {line}
              </p>
            ))}
            {provider.distance !== undefined && (
              <p className="mt-1 text-xs font-medium text-muted-foreground">{provider.distance.toFixed(1)} km away</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${provider.phone}`} className="text-sm hover:underline">
            {provider.phone}
          </a>
        </div>

        {provider.email && (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${provider.email}`} className="text-sm hover:underline">
              {provider.email}
            </a>
          </div>
        )}

        <div className="mt-4 flex w-full justify-between">
          {provider.website && (
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href={provider.website} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-1 h-3 w-3" />
                Website
              </a>
            </Button>
          )}

          <Button variant="default" size="sm" asChild className="text-xs">
            <Link href={`/providers/${provider.id}`}>
              Details
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
