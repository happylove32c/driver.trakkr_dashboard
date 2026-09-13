'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { Job } from '../../../../components/JobCard'

export default function CompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (data) setJob(data)
    }
    fetchJob()
  }, [id])

  if (!job) return <div className="view active"><div className="content-area">Loading...</div></div>

  const routeParts = job.route ? job.route.split('→').map(p => p.trim()) : []
  const deliveryAddr = job.delivery_address || routeParts[1] || 'Unknown'

  return (
    <div className="view active" id="view-job-complete">
      <div className="success-icon">
        <span className="material-symbols-rounded">check</span>
      </div>
      <h2>Delivery Complete</h2>
      <p style={{ marginBottom: '28px', textAlign: 'center' }}>Admin has been notified. Package delivered to <strong>{job.delivery_contact_name || 'Destination'}</strong>.</p>
      
      <div className="card" style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="label">Job ID</span>
          <span className="value">{job.id.substring(0, 8)}...</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="label">Delivered to</span>
          <span className="value" style={{ textAlign: 'right', maxWidth: '60%' }}>{deliveryAddr}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label">Package</span>
          <span className="value">{job.cargo_description}</span>
        </div>
      </div>
      
      <button className="btn" onClick={() => router.push('/jobs')}>Back to Jobs</button>
    </div>
  )
}
