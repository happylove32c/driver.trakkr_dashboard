'use client'

import { useRouter } from 'next/navigation'

type TopBarProps = {
  title: string
  backHref?: string
}

export default function TopBar({ title, backHref }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="top-bar">
      {backHref && (
        <button className="back-btn" onClick={() => router.back()}>
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
      )}
      <span className="view-title">{title}</span>
    </div>
  )
}
