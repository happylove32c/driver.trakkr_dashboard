'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../../../../context/DriverContext'
import { supabase } from '../../../../lib/supabase'
import TopBar from '../../../../components/TopBar'
import ProgressTrack from '../../../../components/ProgressTrack'
import PhotoCapture from '../../../../components/PhotoCapture'
import { Job } from '../../../../components/JobCard'

export default function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { driver } = useDriver()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (data) setJob(data)
    }
    fetchJob()
  }, [id])

  const handleConfirm = async () => {
    if (!job || !driver || !photo) return
    setUploading(true)

    const timestamp = new Date().getTime()
    const filePath = `${job.id}/delivery_${timestamp}.jpg`

    const { error: uploadError } = await supabase.storage.from('job-proofs').upload(filePath, photo)

    let fileUrl = ''
    if (!uploadError) {
      const { data } = supabase.storage.from('job-proofs').getPublicUrl(filePath)
      fileUrl = data.publicUrl
    }

    await supabase.from('job_proofs').insert({ job_id: job.id, driver_id: driver.id, proof_type: 'delivery', file_url: fileUrl })
    await supabase.from('job_events').insert({ job_id: job.id, driver_id: driver.id, event_type: 'delivered' })
    await supabase.from('jobs').update({ status_key: 'delivered' }).eq('id', job.id)
    await supabase.from('drivers').update({ is_taken: false }).eq('id', driver.id)

    router.push(`/jobs/${job.id}/complete`)
  }

  if (!job) return <div className="view active"><div className="content-area">Loading...</div></div>

  const routeParts = job.route ? job.route.split('→').map(p => p.trim()) : []
  const deliveryAddr = job.delivery_address || routeParts[1] || 'Unknown'

  return (
    <div className="view active">
      <TopBar title="Confirm Delivery" backHref={`/jobs/${job.id}/navigation`} />
      <ProgressTrack currentStep={3} />
      <div className="content-area">
        <div className="card">
          <div className="label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Delivering To</div>
          <div className="value" style={{ fontSize: '14px', marginTop: '4px' }}>{deliveryAddr}</div>
          {job.delivery_contact_name && <div className="value" style={{ fontSize: '13px', marginTop: '4px' }}>{job.delivery_contact_name}</div>}
        </div>
        
        <h3>Proof of Delivery</h3>
        <PhotoCapture label="Delivery Photo" onCapture={setPhoto} captured={!!photo} />
        
        <div style={{ flex: 1 }}></div>
        <button 
          className="btn btn-success" 
          disabled={!photo || uploading} 
          onClick={handleConfirm}
        >
          {uploading ? 'Confirming...' : 'Confirm Delivery'}
        </button>
      </div>
    </div>
  )
}
