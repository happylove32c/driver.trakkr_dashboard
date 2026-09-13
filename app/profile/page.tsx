'use client'

import { useRouter } from 'next/navigation'
import { useDriver } from '../../context/DriverContext'
import TopBar from '../../components/TopBar'

export default function ProfilePage() {
  const { driver, signOut } = useDriver()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="view active" id="view-profile">
      <TopBar title="Profile" />
      <div className="content-area" style={{ paddingTop: '28px', alignItems: 'center' }}>
        <div className="logo-container" style={{ borderRadius: '50%', marginBottom: '14px' }}>
          <span className="material-symbols-rounded" style={{ fontSize: '36px', color: '#111111' }}>person</span>
        </div>
        <h2 id="profile-name">{driver?.full_name || 'Driver Name'}</h2>
        <p id="profile-email" style={{ marginBottom: '20px' }}>{driver?.email || 'email@example.com'}</p>
        
        <div className="card" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="label">Phone</span>
            <span className="value">{driver?.phone || 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="label">Status</span>
            <span className="value" style={{ color: 'var(--success)' }}>Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label">Member Since</span>
            <span className="value">{formatDate(driver?.created_at)}</span>
          </div>
        </div>
        
        <div style={{ flex: 1 }}></div>
        <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}
