'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../context/DriverContext'

export default function HomePage() {
  const { session, loading } = useDriver()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.push('/jobs')
      } else {
        router.push('/login')
      }
    }
  }, [session, loading, router])

  return (
    <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      Loading...
    </div>
  )
}
