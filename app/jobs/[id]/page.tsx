'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../../../context/DriverContext'
import { supabase } from '../../../lib/supabase'
import TopBar from '../../../components/TopBar'
import ProgressTrack from '../../../components/ProgressTrack'
import { Job } from '../../../components/JobCard'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { driver } = useDriver()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (data) setJob(data)
    }
    fetchJob()
  }, [id])

  const handleAccept = async () => {
    if (!driver || !job) return
    setAccepting(true)
    setError(null)

    const { error, count } = await supabase
      .from('jobs')
      .update({ status_key: 'assigned', driver_id: driver.id })
      .eq('id', job.id)
      .eq('status_key', 'pending')

    if (error || count === 0) {
      setError("This job was just taken by another driver.")
      setAccepting(false)
      return
    }

    await supabase.from('job_acceptance_history').insert({ job_id: job.id, driver_id: driver.id, action: 'accepted' })
    await supabase.from('job_events').insert({ job_id: job.id, driver_id: driver.id, event_type: 'accepted' })
    await supabase.from('drivers').update({ is_taken: true }).eq('id', driver.id)

    router.push(`/jobs/${job.id}/pickup`)
  }

  if (!job) return <div className="view active"><div className="content-area">Loading...</div></div>

  const routeParts = job.route ? job.route.split('→').map(p => p.trim()) : []
  const pickupAddr = job.pickup_address || routeParts[0] || 'Unknown'
  const deliveryAddr = job.delivery_address || routeParts[1] || 'Unknown'

  return (
    <div className="view active" id="view-job-detail">
      <TopBar title="Job Details" backHref="/jobs" />
      <ProgressTrack currentStep={0} />
      <div className="content-area">
        {error && <div style={{ color: 'var(--danger)', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>{error}</div>}
        
        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Pickup</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Address</span>
            <span className="value" style={{ textAlign: 'right', maxWidth: '60%' }}>{pickupAddr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Contact</span>
            <span className="value">{job.pickup_contact_name} · {job.pickup_contact_phone}</span>
          </div>
        </div>

        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Delivery</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Address</span>
            <span className="value" style={{ textAlign: 'right', maxWidth: '60%' }}>{deliveryAddr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Contact</span>
            <span className="value">{job.delivery_contact_name} · {job.delivery_contact_phone}</span>
          </div>
        </div>

        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Package</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Contents</span>
            <span className="value">{job.cargo_description}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="label">Weight</span>
            <span className="value">{job.weight_kg} kg</span>
          </div>
        </div>

        {job.special_instructions && (
          <div className="card">
            <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Instructions</div>
            <div style={{ fontSize: '13px' }}>{job.special_instructions}</div>
          </div>
        )}

        <div style={{ flex: 1 }}></div>
        <button 
          className="btn btn-success" 
          onClick={handleAccept} 
          disabled={job.status_key !== 'pending' || accepting}
        >
          {accepting ? 'Accepting...' : 'Accept Job'}
        </button>
      </div>
    </div>
  )
}
