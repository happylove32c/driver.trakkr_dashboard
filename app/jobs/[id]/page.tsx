'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useDriver } from '../../../context/DriverContext'
import TopBar from '../../../components/TopBar'
import ProgressTrack from '../../../components/ProgressTrack'
import { Job } from '../../../components/JobCard'

type JobWithDriver = Job & {
  drivers?: { full_name: string } | null
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { driver } = useDriver()
  const jobId = params.id as string

  const [job, setJob] = useState<JobWithDriver | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, drivers(full_name)')
        .eq('id', jobId)
        .single()

      if (data) {
        setJob(data)
      } else {
        console.error('Failed to fetch job', error)
      }
      setLoading(false)
    }

    fetchJob()
  }, [jobId])

  if (loading) {
    return (
      <div className="view active">
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          LOADING JOB...
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="view active">
        <TopBar title="Job Details" backHref="/jobs" />
        <div className="content-area">
          <p>Job not found.</p>
        </div>
      </div>
    )
  }

  const handleAccept = async () => {
    if (!driver || job.driver_id) return
    setAccepting(true)
    
    const { error } = await supabase
      .from('jobs')
      .update({ driver_id: driver.id, status_key: 'assigned', status: 'ASSIGNED' })
      .eq('id', job.id)

    if (!error) {
      router.push(`/jobs/${job.id}/pickup`)
    } else {
      console.error('Error accepting job:', error)
      setAccepting(false)
    }
  }

  const isTakenByOther = job.driver_id && job.driver_id !== driver?.id
  const isTakenByMe = job.driver_id === driver?.id

  return (
    <div className="view active">
      <TopBar title="Job Details" backHref="/jobs" />
      <ProgressTrack currentStep={0} />

      <div className="content-area" style={{ overflowY: 'auto' }}>
        <div className="card">
          <h3>Pickup</h3>
          <p className="value">{job.pickup_address || 'Unknown Pickup'}</p>
          <p className="label" style={{ marginTop: '4px' }}>
            {job.pickup_contact_name} {job.pickup_contact_phone ? `• ${job.pickup_contact_phone}` : ''}
          </p>
        </div>

        <div className="card">
          <h3>Delivery</h3>
          <p className="value">{job.delivery_address || 'Unknown Delivery'}</p>
          <p className="label" style={{ marginTop: '4px' }}>
            {job.delivery_contact_name} {job.delivery_contact_phone ? `• ${job.delivery_contact_phone}` : ''}
          </p>
        </div>

        <div className="card">
          <h3>Cargo</h3>
          <p className="value">{job.cargo_description}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span className="label">Weight</span>
            <span className="value">{job.weight_kg} kg</span>
          </div>
          {job.special_instructions && (
            <div style={{ marginTop: '12px' }}>
              <span className="label">Special Instructions</span>
              <p className="value" style={{ marginTop: '4px', fontSize: '12px' }}>{job.special_instructions}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          {isTakenByOther ? (
            <button className="btn" disabled>
              Job Taken
            </button>
          ) : isTakenByMe ? (
            <button className="btn btn-success" onClick={() => router.push(`/jobs/${job.id}/pickup`)}>
              Continue Job
            </button>
          ) : (
            <button className="btn" onClick={handleAccept} disabled={accepting || !driver}>
              {accepting ? 'Accepting...' : 'Accept Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
