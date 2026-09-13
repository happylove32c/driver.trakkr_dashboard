'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDriver } from '../../context/DriverContext'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const { session, loading } = useDriver()
  const router = useRouter()

  useEffect(() => {
    if (!loading && session) {
      router.push('/jobs')
    }
  }, [session, loading, router])

  const handleLogin = async () => {
    if (typeof window !== 'undefined') {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    }
  }

  return (
    <div className="view active" id="view-login" style={{ justifyContent: 'center', padding: '48px 28px 0', alignItems: 'center', textAlign: 'center', background: 'var(--surface)' }}>
      <div className="logo-container">
        <span className="material-symbols-rounded" style={{ color: '#111111', fontSize: '32px' }}>local_shipping</span>
      </div>
      <h1>Driver<br/>Portal</h1>
      <p>Log in to manage your deliveries.</p>
      <button className="btn google-btn" style={{ marginTop: '40px' }} onClick={handleLogin}>
        <img src="https://www.svgrepo.com/show/448227/google.svg" alt="" className="google_logo" />
        Sign in with Google
      </button>
    </div>
  )
}
