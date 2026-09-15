'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { useDriver } from '../../../../context/DriverContext'
import TopBar from '../../../../components/TopBar'
import ProgressTrack from '../../../../components/ProgressTrack'
import PhotoCapture from '../../../../components/PhotoCapture'
import { Job } from '../../../../components/JobCard'

export default function DeliveryPage() {
  const params = useParams()
  const router = useRouter()
  const { driver } = useDriver()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [confirming, setConfirming] = useState(false)

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

  const handleCapture = async (file: File) => {
    if (!driver || !jobId) return
    setUploading(true)
    setUploadError(null)

    const path = `${jobId}/delivery_${Date.now()}.jpg`

    const { error: uploadErr } = await supabase.storage
      .from('job_proofs')
      .upload(path, file)

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      setUploadError('Failed to upload photo. Please try again.')
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('job_proofs')
      .getPublicUrl(path)

    const { error: dbErr } = await supabase
      .from('job_proofs')
      .insert({
        job_id: jobId,
        driver_id: driver.id,
        proof_type: 'delivery_photo',
        file_url: publicUrlData.publicUrl
      })

    if (dbErr) {
      console.error('DB Insert error:', dbErr)
      setUploadError('Failed to save photo record. Please try again.')
      setUploading(false)
      return
    }

    setPhotoCaptured(true)
    setUploading(false)
  }

  const handleConfirm = async () => {
    if (!driver || !photoCaptured) return
    setConfirming(true)

    // Insert job_events row
    await supabase.from('job_events').insert({
      job_id: jobId,
      driver_id: driver.id,
      event_type: 'delivered'
    })

    // Update jobs status
    const { error: jobErr } = await supabase
      .from('jobs')
      .update({ status: 'DELIVERED', status_key: 'closed' })
      .eq('id', jobId)

    // Update driver is_taken
    const { error: driverErr } = await supabase
      .from('drivers')
      .update({ is_taken: false })
      .eq('id', driver.id)

    if (!jobErr && !driverErr) {
      router.push(`/jobs/${jobId}/complete`)
    } else {
      console.error('Error confirming delivery:', jobErr || driverErr)
      setConfirming(false)
    }
  }

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
        <TopBar title="Confirm Delivery" backHref={`/jobs/${jobId}/navigation`} />
        <div className="content-area">
          <p>Job not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view active">
      <TopBar title="Confirm Delivery" backHref={`/jobs/${jobId}/navigation`} />
      <ProgressTrack currentStep={3} />

      <div className="content-area">
        <div className="card">
          <h3>Delivery Location</h3>
          <p className="value">{job.delivery_address || 'Unknown Delivery'}</p>
        </div>

        <div style={{ margin: '20px 0' }}>
          <PhotoCapture label="Delivery Photo" onCapture={handleCapture} captured={photoCaptured} />
          {uploading && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>Uploading photo...</p>}
          {uploadError && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px', textAlign: 'center' }}>{uploadError}</p>}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="btn btn-success" onClick={handleConfirm} disabled={!photoCaptured || confirming}>
            {confirming ? 'Confirming...' : 'Confirm Delivery'}
          </button>
        </div>
      </div>
    </div>
  )
}
