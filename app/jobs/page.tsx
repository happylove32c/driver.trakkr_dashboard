'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../../context/DriverContext'
import { supabase } from '../../lib/supabase'
import JobCard, { Job } from '../../components/JobCard'

export default function JobsPage() {
  const { driver, loading: driverLoading } = useDriver()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (driverLoading) return
    if (!driver) {
      router.push('/login')
      return
    }

    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status_key', ['pending', 'assigned'])
        .or(`driver_id.is.null,driver_id.eq.${driver.id}`)

      if (data) {
        setJobs(data)
      }
      setLoading(false)
    }

    fetchJobs()

    const intervalId = setInterval(fetchJobs, 3000)

    const channel = supabase.channel('jobs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, fetchJobs)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' }, fetchJobs)
      .subscribe()

    return () => {
      clearInterval(intervalId)
      supabase.removeChannel(channel)
    }
  }, [driver, driverLoading, router])

  if (driverLoading) {
    return (
      <div className="view active">
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    )
  }

  if (!driver) {
    return null
  }

  if (loading) {
    return (
      <div className="view active">
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          LOADING JOBS...
        </div>
      </div>
    )
  }

  return (
    <div className="view active" id="view-job-list">
      <div className="greeting">
        <p>Welcome back,</p>
        <h1 id="welcome-name">{driver?.full_name?.split(' ')[0] || 'Driver'}</h1>
      </div>
      <div className="content-area" style={{ paddingTop: '16px' }} id="job-list-container">
        {jobs.length === 0 ? (
          <div className="placeholder-view">
            <div className="placeholder-icon">
              <span className="material-symbols-rounded" style={{ fontSize: '34px', color: '#111111' }}>work</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '13px' }}>No jobs available right now.</p>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => router.push(`/jobs/${job.id}`)} />
          ))
        )}
      </div>
    </div>
  )
}
