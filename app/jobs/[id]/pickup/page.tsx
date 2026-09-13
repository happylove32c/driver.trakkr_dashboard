'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../../../../context/DriverContext'
import { supabase } from '../../../../lib/supabase'
import TopBar from '../../../../components/TopBar'
import ProgressTrack from '../../../../components/ProgressTrack'
import PhotoCapture from '../../../../components/PhotoCapture'
import { Job } from '../../../../components/JobCard'

export default function PickupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { driver } = useDriver()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (data) {
        if (data.driver_id !== driver?.id) {
          router.push('/jobs')
        } else {
          setJob(data)
        }
      }
    }
    if (driver) fetchJob()
  }, [id, driver, router])

  const handleConfirm = async () => {
    if (!job || !driver || !photo) return
    setUploading(true)

    const timestamp = new Date().getTime()
    const filePath = `${job.id}/pickup_${timestamp}.jpg`

    const { error: uploadError } = await supabase.storage.from('job-proofs').upload(filePath, photo)

    let fileUrl = ''
    if (!uploadError) {
      const { data } = supabase.storage.from('job-proofs').getPublicUrl(filePath)
      fileUrl = data.publicUrl
    }

    await supabase.from('job_proofs').insert({ job_id: job.id, driver_id: driver.id, proof_type: 'pickup', file_url: fileUrl })
    await supabase.from('job_events').insert({ job_id: job.id, driver_id: driver.id, event_type: 'pickup_confirmed' })
    await supabase.from('jobs').update({ status_key: 'transit' }).eq('id', job.id)

    router.push(`/jobs/${job.id}/navigation`)
  }

  if (!job) return <div className="view active"><div className="content-area">Loading...</div></div>

  const routeParts = job.route ? job.route.split('→').map(p => p.trim()) : []
  const pickupAddr = job.pickup_address || routeParts[0] || 'Unknown'

  return (
    <div className="view active">
      <TopBar title="Confirm Pickup" backHref={`/jobs/${job.id}`} />
      <ProgressTrack currentStep={1} />
      <div className="content-area">
        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Pickup Location</div>
          <div className="value" style={{ fontSize: '14px', marginTop: '4px' }}>{pickupAddr}</div>
          {job.pickup_contact_name && <div className="value" style={{ fontSize: '13px', marginTop: '4px' }}>{job.pickup_contact_name}</div>}
        </div>
        
        <h3>Proof of Pickup</h3>
        <PhotoCapture label="Pickup Photo" onCapture={setPhoto} captured={!!photo} />
        
        <div style={{ flex: 1 }}></div>
        <button 
          className="btn btn-success" 
          disabled={!photo || uploading} 
          onClick={handleConfirm}
        >
          {uploading ? 'Confirming...' : 'Confirm Pickup'}
        </button>
      </div>
    </div>
  )
}
