interface StepItemProps {
    label: string
    description: string
    status: 'completed' | 'current' | 'upcoming'
    step: number
  }
  
  export function StepItem({ label, description, status, step }: StepItemProps) {
    return (
      <div className="flex items-start gap-4 relative">
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              status === 'completed'
                ? 'bg-primary border-primary text-primary-foreground'
                : status === 'current'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-muted text-muted-foreground'
            }`}
          >
            {status === 'completed' ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <span className="text-sm">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div className="w-0.5 h-16 bg-muted mt-2" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className={`text-sm font-medium ${
            status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {label}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }