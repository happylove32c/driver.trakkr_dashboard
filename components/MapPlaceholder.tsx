'use client'

type MapPlaceholderProps = {
  destinationAddress?: string
  lat?: number
  lng?: number
}

export default function MapPlaceholder({ destinationAddress, lat, lng }: MapPlaceholderProps) {
  return (
    <div className="map-placeholder">
      <span className="material-symbols-rounded" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>map</span>
      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>Google Maps</span>
      {(lat && lng) ? (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} id="map-coords">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      ) : destinationAddress ? (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} id="map-coords">
          {destinationAddress}
        </span>
      ) : null}
    </div>
  )
}
