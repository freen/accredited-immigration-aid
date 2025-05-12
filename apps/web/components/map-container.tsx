"use client"

import { useEffect, useRef, useState } from "react"
import type { Office } from "@/lib/core/models/office"

interface MapContainerProps {
  providers: Office[]
  center: { latitude: number; longitude: number }
  zoom: number
}

// This is a platform-agnostic map container that can be replaced with a React Native version
export function MapContainer({ providers, center, zoom }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })

  // Use state to store the map data instead of directly manipulating DOM
  const [mapData, setMapData] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setMapDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    // Initial dimensions
    updateDimensions()

    // Update dimensions on resize
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    if (mapDimensions.width === 0 || mapDimensions.height === 0) return

    const renderMap = async () => {
      try {
        // Simulate map loading delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Create an off-screen canvas
        const canvas = document.createElement("canvas")
        canvas.width = mapDimensions.width
        canvas.height = mapDimensions.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Draw map background
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(0, 0, mapDimensions.width, mapDimensions.height)

        // Draw grid lines
        ctx.strokeStyle = "#e0e0e0"
        ctx.lineWidth = 1

        for (let i = 0; i < mapDimensions.width; i += 50) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, mapDimensions.height)
          ctx.stroke()
        }

        for (let i = 0; i < mapDimensions.height; i += 50) {
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.lineTo(mapDimensions.width, i)
          ctx.stroke()
        }

        // Draw pins for each provider
        providers.forEach((provider, index) => {
          if (!provider.location) return

          // Simulate position calculation
          const x = (index + 1) * (mapDimensions.width / (providers.length + 1))
          const y = mapDimensions.height / 2 + (Math.sin(index) * mapDimensions.height) / 4

          // Draw pin
          ctx.fillStyle = "#ef4444"
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fill()

          // Draw provider name
          ctx.fillStyle = "#000000"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(provider.name, x, y - 15)
        })

        // Convert canvas to data URL and store in state
        const dataUrl = canvas.toDataURL("image/png")
        setMapData(dataUrl)
        setLoading(false)
      } catch (error) {
        console.error("Error rendering map:", error)
        setLoading(false)
      }
    }

    renderMap()
  }, [providers, mapDimensions, center, zoom])

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      ) : mapData ? (
        <img
          src={mapData || "/placeholder.svg"}
          alt="Map showing provider locations"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <p>Unable to load map</p>
        </div>
      )}
      <div className="absolute bottom-2 right-2 rounded bg-white p-2 text-xs text-gray-500">Map View (Simulated)</div>
    </div>
  )
}
