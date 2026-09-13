'use client'

import { useRef, useState } from 'react'

type PhotoCaptureProps = {
  label: string
  onCapture: (file: File) => void
  captured: boolean
}

export default function PhotoCapture({ label, onCapture, captured }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileName(file.name)
      onCapture(file)
    }
  }

  if (captured) {
    return (
      <div className="photo-area taken" onClick={handleClick}>
        <span className="material-symbols-rounded">check_circle</span>
        <span>Photo captured</span>
        <small>{fileName || 'Photo ready'}</small>
        <input type="file" accept="image/*" capture="environment" ref={inputRef} onChange={handleChange} style={{ display: 'none' }} />
      </div>
    )
  }

  return (
    <div className="photo-area" onClick={handleClick}>
      <span className="material-symbols-rounded">camera</span>
      <span>Tap to take photo</span>
      <small>Required before continuing</small>
      <input type="file" accept="image/*" capture="environment" ref={inputRef} onChange={handleChange} style={{ display: 'none' }} />
    </div>
  )
}
