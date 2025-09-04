import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useAccount, useChainId, useTransactionReceipt, useWriteContract } from 'wagmi'
import CourseRegistryABI from '@/assets/CourseRegistry.json'
import Toast from '@/components/Toast'
import { COURSE_REGISTRY_ADDRESSES } from '@/config/tokens'
import { api } from '@/utils/api'

export interface CourseFormData {
  title: string
  content: string
  price: string
}

interface CourseFormProps {
  mode: 'create' | 'edit'
  initialData?: CourseFormData
  courseId?: number
  onSuccess?: () => void
}

export default function CourseForm({ mode, initialData, courseId, onSuccess }: CourseFormProps) {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const [form, setForm] = useState<CourseFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    price: initialData?.price || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<'idle' | 'api' | 'contract' | 'completed'>('idle')

  // Toast状态
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  const { writeContract, isPending, data } = useWriteContract({})
  const { isLoading, isSuccess } = useTransactionReceipt({ hash: data })

  useEffect(() => {
    if (isSuccess) {
      const message = mode === 'create' 
        ? '🎉 Course registered on blockchain successfully!'
        : '✅ Course updated on blockchain successfully!'
      setToastMessage(message)
      setToastType('success')
      setShowToast(true)
    }
  }, [isSuccess, mode])

  const updateForm = (field: keyof CourseFormData, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    setCurrentStep('api')

    try {
      let result
      if (mode === 'create') {
        // 创建新课程
        result = await api.createCourse({
          ...form,
          creator: address!,
        })
        console.warn('Course created successfully:', result)
      } else {
        // 编辑现有课程
        result = await api.updateCourse(courseId!, {
          name: form.title,
          description: form.content,
          price: Number(form.price)
        })
        console.warn('Course updated successfully:', result)
      }

      if (mode === 'create') {
        // 创建模式需要注册到区块链
        setCurrentStep('contract')
        const registryAddress = COURSE_REGISTRY_ADDRESSES[chainId as keyof typeof COURSE_REGISTRY_ADDRESSES]

        if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error(`Course registry not deployed on chain ${chainId}. Please deploy the contract first.`)
        }

        writeContract({
          address: registryAddress as `0x${string}`,
          abi: CourseRegistryABI.abi,
          functionName: 'createCourse',
          args: [result.data._id, form.price],
        })
      }

      setCurrentStep('completed')

      // 重置表单（仅创建模式）
      if (mode === 'create') {
        setForm({
          title: '',
          content: '',
          price: '',
        })
      }
      
      setSuccess(true)
      onSuccess?.()

      // 清除成功消息
      setTimeout(() => {
        setSuccess(false)
        setCurrentStep('idle')
      }, 5000)
    } catch (error) {
      console.error(`Failed to ${mode} course:`, error)
      setError(error instanceof Error ? error.message : `Failed to ${mode} course`)
      setCurrentStep('idle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = form.title && form.content && form.price

  return (
    <>
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <div className="relative">
        {/* Blur overlay when not connected */}
        {!isConnected && (
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6">
                  You need to connect your wallet to {mode} courses
                </p>
              </div>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl ${
            !isConnected ? 'blur-sm pointer-events-none' : ''
          }`}
        >
          {/* Course Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Course Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={e => updateForm('title', e.target.value)}
              placeholder="Enter course title..."
              className="w-full bg-gray-800/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
            />
          </div>

          {/* Course Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Course Content
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={e => updateForm('content', e.target.value)}
              placeholder="Describe your course content..."
              rows={6}
              className="w-full bg-gray-800/30 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors resize-none"
            />
          </div>

          {/* Course Price */}
          <div className="mb-8">
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
              Course Price (OWC)
            </label>
            <div className="relative">
              <input
                id="price"
                type="text"
                value={form.price}
                onChange={e => updateForm('price', e.target.value)}
                placeholder="1"
                className="w-full bg-gray-800/30 border border-gray-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-colors"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-sm font-medium">OWC</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Progress Steps - 仅创建模式显示 */}
          {isSubmitting && mode === 'create' && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
              <div className="space-y-4">
                <h4 className="text-blue-300 font-medium">Creating Course...</h4>

                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    currentStep === 'api' ? 'border-blue-400 bg-blue-400'
                    : currentStep === 'contract' || currentStep === 'completed' ? 'border-green-400 bg-green-400'
                    : 'border-gray-600'
                  }`}>
                    {currentStep === 'api' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (currentStep === 'contract' || currentStep === 'completed') ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    currentStep === 'api' ? 'text-blue-300'
                    : currentStep === 'contract' || currentStep === 'completed' ? 'text-green-300'
                    : 'text-gray-400'
                  }`}>
                    Saving course data...
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    currentStep === 'contract' ? 'border-blue-400 bg-blue-400'
                    : currentStep === 'completed' ? 'border-green-400 bg-green-400'
                    : 'border-gray-600'
                  }`}>
                    {currentStep === 'contract' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : currentStep === 'completed' ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    currentStep === 'contract' ? 'text-blue-300'
                    : currentStep === 'completed' ? 'text-green-300'
                    : 'text-gray-400'
                  }`}>
                    Registering on blockchain...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-300 text-sm">
                  Course {mode === 'create' ? 'created' : 'updated'} successfully!
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isConnected || !isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {(isSubmitting || isPending || isLoading) ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {mode === 'create' ? 'Creating Course...' : 'Updating Course...'}
              </div>
            ) : !isConnected ? (
              'Connect Wallet First'
            ) : (
              mode === 'create' ? 'Create Course' : 'Update Course'
            )}
          </button>
        </form>
      </div>
    </>
  )
}