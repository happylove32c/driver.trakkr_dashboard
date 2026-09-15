'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import TopBar from '../../../../components/TopBar'
import ProgressTrack from '../../../../components/ProgressTrack'
import MapPlaceholder from '../../../../components/MapPlaceholder'
import { Job } from '../../../../components/JobCard'

export default function NavigationPage() {
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
          LOADING NAVIGATION...
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="view active">
        <TopBar title="Navigation" backHref={`/jobs/${jobId}/pickup`} />
        <div className="content-area">
          <p>Job not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view active">
      <TopBar title="Navigation" backHref={`/jobs/${jobId}/pickup`} />
      <ProgressTrack currentStep={2} />

      <div className="content-area" style={{ display: 'flex', flexDirection: 'column' }}>
        <MapPlaceholder destinationAddress={job.delivery_address || 'Unknown Delivery Location'} />

        <div className="card" style={{ marginTop: '16px' }}>
          <h3>Delivering To</h3>
          <p className="value">{job.delivery_address || 'Unknown Delivery'}</p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="btn btn-success" onClick={() => router.push(`/jobs/${jobId}/delivery`)}>
            I've Arrived
          </button>
        </div>
      </div>
    </div>
  )
}
