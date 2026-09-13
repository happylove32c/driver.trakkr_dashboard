'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import TopBar from '../../../../components/TopBar'
import ProgressTrack from '../../../../components/ProgressTrack'
import MapPlaceholder from '../../../../components/MapPlaceholder'
import { Job } from '../../../../components/JobCard'

export default function NavigationPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="view active">
      <TopBar title="En Route" backHref={`/jobs/${job.id}/pickup`} />
      <ProgressTrack currentStep={2} />
      <div className="content-area">
        <MapPlaceholder destinationAddress={deliveryAddr} lat={job.pickup_lat || undefined} lng={job.pickup_lng || undefined} />
        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Destination</div>
          <div className="value" style={{ fontSize: '14px', marginTop: '4px' }}>{deliveryAddr}</div>
          {job.delivery_contact_name && <div className="value" style={{ fontSize: '13px', marginTop: '4px' }}>{job.delivery_contact_name}</div>}
        </div>
        
        <div style={{ flex: 1 }}></div>
        <button className="btn" onClick={() => router.push(`/jobs/${job.id}/delivery`)}>I've Arrived</button>
      </div>
    </div>
  )
}
