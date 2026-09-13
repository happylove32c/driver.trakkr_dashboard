'use client'

import { useEffect, useState } from 'react'

export type Job = {
  id: string
  client: string
  status: string
  status_key: string
  route: string
  time: string
  driver_id: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  cargo_description: string
  weight_kg: number
  special_instructions: string | null
  pickup_address: string | null
  pickup_contact_name: string | null
  pickup_contact_phone: string | null
  delivery_address: string | null
  delivery_contact_name: string | null
  delivery_contact_phone: string | null
  notification_radius_km: number | null
}

type JobCardProps = {
  job: Job
  onClick: () => void
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const [distance, setDistance] = useState<string>('— km away')

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation && job.pickup_lat && job.pickup_lng) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const d = calculateDistance(position.coords.latitude, position.coords.longitude, job.pickup_lat!, job.pickup_lng!)
          setDistance(`${d.toFixed(1)} km away`)
        },
        () => {
          setDistance('— km away')
        }
      )
    }
  }, [job.pickup_lat, job.pickup_lng])

  const routeParts = job.route ? job.route.split('→').map(p => p.trim()) : []
  const pickupAddr = job.pickup_address || routeParts[0] || 'Unknown Pickup'
  const deliveryAddr = job.delivery_address || routeParts[1] || 'Unknown Delivery'

  const isDelivery = job.status_key === 'pending' || job.status_key === 'assigned' || job.status_key === 'transit' // Adjust logic if needed. Default badge delivery for now unless otherwise specified.
  const badgeClass = isDelivery ? 'badge-delivery' : 'badge-pickup'
  const badgeText = isDelivery ? 'DELIVERY' : 'PICKUP' // Simple logic, refine if necessary.

  return (
    <div className="card job-item" onClick={onClick}>
      <div className="job-header">
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
        <div className="distance">
          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>location_on</span>
          {distance}
        </div>
      </div>
      <div className="route">
        <div className="route-point">
          <span className="label">From</span>
          <span className="value">{pickupAddr}</span>
        </div>
        <div className="route-point">
          <span className="label">To</span>
          <span className="value">{deliveryAddr}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{job.cargo_description}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700 }}>{job.weight_kg} kg</span>
      </div>
    </div>
  )
}
