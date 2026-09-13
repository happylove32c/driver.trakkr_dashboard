'use client'

import TopBar from '../../components/TopBar'

export default function ActiveEmptyPage() {
  return (
    <div className="view active" id="view-active-empty">
      <TopBar title="Active Job" />
      <div className="placeholder-view">
        <div className="placeholder-icon">
          <span className="material-symbols-rounded" style={{ fontSize: '34px', color: '#111111', fontVariationSettings: "'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 40" }}>local_shipping</span>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px' }}>No active job right now.</p>
      </div>
    </div>
  )
}
