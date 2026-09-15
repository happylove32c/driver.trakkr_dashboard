'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

type MapProps = {
  destinationAddress?: string
  pickupAddress?: string
}

type Coords = { lat: number; lng: number }

async function geocode(address: string): Promise<Coords | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

function LiveMap({ destinationAddress, pickupAddress }: MapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [driverCoords, setDriverCoords] = useState<Coords | null>(null)
  const [destCoords, setDestCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    // Geocode destination address
    if (destinationAddress) {
      geocode(destinationAddress).then(coords => {
        if (coords) setDestCoords(coords)
      })
    }

    // Get driver's live GPS location
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ready')
      },
      (err) => {
        console.error('Geolocation error:', err)
        setStatus('error')
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [destinationAddress])

  useEffect(() => {
    if (status !== 'ready' || !driverCoords || !mapContainerRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current!).setView(
          [driverCoords.lat, driverCoords.lng], 14
        )

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current)
      }

      // Clear existing markers
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer)
      })

      // Driver marker
      const driverIcon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3B82F6;border:3px solid white;
          box-shadow:0 0 6px rgba(0,0,0,0.4)">
        </div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker([driverCoords.lat, driverCoords.lng], { icon: driverIcon })
        .addTo(mapRef.current)
        .bindPopup('You are here')

      // Destination marker
      if (destCoords) {
        L.marker([destCoords.lat, destCoords.lng])
          .addTo(mapRef.current)
          .bindPopup(destinationAddress || 'Delivery destination')

        // Fit map to show both markers
        const bounds = L.latLngBounds(
          [driverCoords.lat, driverCoords.lng],
          [destCoords.lat, destCoords.lng]
        )
        mapRef.current.fitBounds(bounds, { padding: [40, 40] })
      } else {
        mapRef.current.setView([driverCoords.lat, driverCoords.lng], 14)
      }
    })
  }, [driverCoords, destCoords, status])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  if (status === 'error') {
    return (
      <div style={{
        height: '300px', borderRadius: '12px', background: 'var(--card-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '8px'
      }}>
        <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--text-muted)' }}>location_off</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Location unavailable</span>
        {destinationAddress && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{destinationAddress}</span>
        )}
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div style={{
        height: '300px', borderRadius: '12px', background: 'var(--card-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Getting your location...</span>
      </div>
    )
  }

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }}
      />
      {destinationAddress && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Destination: {destinationAddress}
        </p>
      )}
    </div>
  )
}

export default LiveMap