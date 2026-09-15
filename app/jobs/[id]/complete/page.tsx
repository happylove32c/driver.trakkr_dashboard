'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { Job } from '../../../../components/JobCard'

export default function CompletePage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
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
        <div className="content-area">
          <p>Job not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view active" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '32px' }}>
        <span className="material-symbols-rounded" style={{ fontSize: '80px', color: 'var(--success)' }}>
          check_circle
        </span>
      </div>

      <h1 style={{ marginBottom: '24px' }}>Delivery Complete</h1>

      <div className="card" style={{ width: '100%', textAlign: 'left', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <span className="label">Job ID</span>
          <p className="value" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{job.id}</p>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <span className="label">Delivered To</span>
          <p className="value">{job.delivery_address || 'Unknown Delivery Location'}</p>
        </div>

        <div>
          <span className="label">Cargo</span>
          <p className="value">{job.cargo_description}</p>
        </div>
      </div>

      <button className="btn" onClick={() => router.push('/jobs')} style={{ width: '100%' }}>
        Back to Jobs
      </button>
    </div>
  )
}
