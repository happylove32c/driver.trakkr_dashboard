'use client'

import { useEffect, useState } from 'react'
import { useDriver } from '../../context/DriverContext'
import { supabase } from '../../lib/supabase'
import TopBar from '../../components/TopBar'

type HistoryEvent = {
  id: string
  created_at: string
  job_id: string
  jobs: {
    id: string
    delivery_address: string
    cargo_description: string
    client: string
    route: string
  }
}

export default function HistoryPage() {
  const { driver } = useDriver()
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null)

  useEffect(() => {
    if (!driver) return
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('job_events')
        .select(`
          id, created_at, job_id,
          jobs (id, delivery_address, cargo_description, client, route)
        `)
        .eq('driver_id', driver.id)
        .eq('event_type', 'delivered')
        .order('created_at', { ascending: false })

      if (data) setEvents(data as unknown as HistoryEvent[])
      setLoading(false)
    }
    fetchHistory()
  }, [driver])

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="view active" id="view-history">
      <TopBar title="History" />
      <div className="content-area" style={{ paddingTop: '16px' }} id="history-list-container">
        {loading ? (
          <div style={{ textAlign: 'center' }}>Loading...</div>
        ) : events.length === 0 ? (
          <div className="placeholder-view">
            <div className="placeholder-icon">
              <span className="material-symbols-rounded" style={{ fontSize: '34px', color: '#111111' }}>history</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px' }}>No past jobs yet.</p>
          </div>
        ) : (
          events.map(event => {
            const routeParts = event.jobs?.route ? event.jobs.route.split('→').map(p => p.trim()) : []
            const addr = event.jobs?.delivery_address || routeParts[1] || 'Unknown Location'
            return (
              <div key={event.id} className="card job-item" onClick={() => setSelectedEvent(event)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-delivery" style={{ backgroundColor: 'var(--success)', color: '#fff', borderColor: 'var(--success)' }}>DELIVERED</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(event.created_at)}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{addr}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{event.jobs?.cargo_description}</div>
              </div>
            )
          })
        )}
      </div>

      {/* Receipt Modal */}
      <div className={`modal-overlay ${selectedEvent ? 'active' : ''}`} onClick={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="receipt-modal" onClick={e => e.stopPropagation()}>
            <button className="receipt-close" onClick={() => setSelectedEvent(null)}>
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
            </button>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '36px', color: 'var(--success)' }}>check_circle</span>
              <h2 style={{ fontSize: '18px', marginTop: '6px' }}>Delivery Receipt</h2>
              <p style={{ fontSize: '11px' }}>{formatDate(selectedEvent.created_at)}</p>
            </div>
            <div className="receipt-divider"></div>
            <div style={{ marginBottom: '10px' }}>
              <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Job ID</div>
              <div className="value">{selectedEvent.jobs?.id}</div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Delivered To</div>
              <div className="value">{selectedEvent.jobs?.delivery_address || (selectedEvent.jobs?.route ? selectedEvent.jobs.route.split('→')[1]?.trim() : 'Unknown')}</div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Package</div>
              <div className="value">{selectedEvent.jobs?.cargo_description}</div>
            </div>
            <div className="receipt-divider"></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>Thank you for delivering with TRAKKR!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
