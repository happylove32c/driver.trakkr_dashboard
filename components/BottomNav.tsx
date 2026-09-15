'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useDriver } from '../context/DriverContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { driver } = useDriver()
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  useEffect(() => {
    if (!driver) {
      setActiveJobId(null)
      return
    }

    const fetchActiveJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('driver_id', driver.id)
        .in('status_key', ['assigned', 'transit'])
        .maybeSingle()

      if (error) {
        console.error('Failed to fetch active job:', error)
        setActiveJobId(null)
        return
      }

      setActiveJobId(data?.id ?? null)
    }

    fetchActiveJob()

    const channel = supabase
      .channel('active_job_nav')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `driver_id=eq.${driver.id}`,
        },
        fetchActiveJob
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [driver])

  const isJobs = pathname === '/jobs'
  const isHistory = pathname === '/history'
  const isProfile = pathname === '/profile'
  const isActive = pathname.startsWith('/jobs/') || pathname === '/active'

  const handleActiveTab = async () => {
    if (!activeJobId) {
      router.push('/active')
      return
    }

    const { data } = await supabase
      .from('jobs')
      .select('status_key')
      .eq('id', activeJobId)
      .single()

    if (!data) {
      router.push('/active')
      return
    }

    if (data.status_key === 'transit') {
      router.push(`/jobs/${activeJobId}/navigation`)
    } else {
      router.push(`/jobs/${activeJobId}/pickup`)
    }
  }

  return (
    <nav id="bottom-nav" className="bottom-nav">
      <div
        className={`nav-item ${isJobs ? 'active' : ''}`}
        onClick={() => router.push('/jobs')}
      >
        <div className="nav-icon-wrap">
          <span className="material-symbols-rounded">work</span>
        </div>
        <span className="nav-label">Jobs</span>
      </div>

      <div
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={handleActiveTab}
      >
        <div className="nav-icon-wrap">
          <span className="material-symbols-rounded">local_shipping</span>
        </div>
        <span className="nav-label">Active</span>
      </div>

      <div
        className={`nav-item ${isHistory ? 'active' : ''}`}
        onClick={() => router.push('/history')}
      >
        <div className="nav-icon-wrap">
          <span className="material-symbols-rounded">history</span>
        </div>
        <span className="nav-label">History</span>
      </div>

      <div
        className={`nav-item ${isProfile ? 'active' : ''}`}
        onClick={() => router.push('/profile')}
      >
        <div className="nav-icon-wrap">
          <span className="material-symbols-rounded">person</span>
        </div>
        <span className="nav-label">Profile</span>
      </div>
    </nav>
  )
}
