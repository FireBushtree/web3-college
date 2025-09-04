import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
  show: boolean
}

export default function Toast({ message, type = 'success', duration = 4000, onClose, show }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        const closeTimer = setTimeout(onClose, 300) // 等待动画完成后调用onClose
        return () => clearTimeout(closeTimer)
      }, duration)

      return () => clearTimeout(hideTimer)
    }
  }, [show, duration, onClose])

  if (!show && !isVisible)
    return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-700/50 text-green-100'
      case 'error':
        return 'bg-red-900/90 border-red-700/50 text-red-100'
      case 'info':
        return 'bg-blue-900/90 border-blue-700/50 text-blue-100'
      default:
        return 'bg-green-900/90 border-green-700/50 text-green-100'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed top-20 right-4 z-60">
      <div
        className={`
          ${getToastStyles()}
          backdrop-blur-xl border rounded-xl px-4 py-3 shadow-2xl
          transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
