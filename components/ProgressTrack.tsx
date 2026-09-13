'use client'

type ProgressTrackProps = {
  currentStep: 0 | 1 | 2 | 3
}

export default function ProgressTrack({ currentStep }: ProgressTrackProps) {
  const steps = ['Accepted', 'Pickup', 'En Route', 'Delivered']
  const lineWidth = `${(currentStep / 3) * 100}%`

  return (
    <div className="progress-track">
      <div className="line-fill" style={{ width: lineWidth }}></div>
      {steps.map((step, index) => {
        let className = 'progress-step'
        if (index < currentStep) className += ' completed'
        else if (index === currentStep) className += ' active'

        return (
          <div key={step} className="step-container">
            <div className={className}>
              {index < currentStep ? (
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check</span>
              ) : (
                index + 1
              )}
            </div>
            <span className="step-label">{step}</span>
          </div>
        )
      })}
    </div>
  )
}
