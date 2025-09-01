import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount, useChainId, useWriteContract } from 'wagmi'
import CourseRegistryABI from '@/assets/CourseRegistry.json'
import Toast from '@/components/Toast'
import { COURSE_REGISTRY_ADDRESSES } from '@/config/tokens'
import { api } from '@/utils/api'

interface CourseForm {
  title: string
  content: string
  price: string
}

export default function Create() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const [form, setForm] = useState<CourseForm>({
    title: '',
    content: '',
    price: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<'idle' | 'api' | 'contract' | 'completed'>('idle')

  // Toast状态
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        // 合约调用成功后显示Toast
        setToastMessage('🎉 Course registered on blockchain successfully!')
        setToastType('success')
        setShowToast(true)
      },
      onError: (error) => {
        // 合约调用失败时显示Toast
        setToastMessage(`❌ Blockchain registration failed: ${error.message}`)
        setToastType('error')
        setShowToast(true)
      },
    },
  })

  const updateForm = (field: keyof CourseForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || isSubmitting)
      return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    setCurrentStep('api')

    try {
      // Step 1: Create course via API
      const result = await api.createCourse({
        ...form,
        creator: address!,
      })
      console.warn('Course created successfully:', result)

      // Step 2: Register on blockchain
      // Note: Since this contract only has purchaseCourse, we'll use it to register the course
      // In a production environment, you'd want a separate createCourse function
      setCurrentStep('contract')
      const registryAddress = COURSE_REGISTRY_ADDRESSES[chainId as keyof typeof COURSE_REGISTRY_ADDRESSES]

      if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Course registry not deployed on chain ${chainId}. Please deploy the contract first.`)
      }

      writeContract({
        address: registryAddress as `0x${string}`,
        abi: CourseRegistryABI.abi,
        functionName: 'purchaseCourse',
        args: [result.name || form.title], // Use the course name returned from API
      })

      // The contract call will complete in the background
      // We'll show completion immediately after contract is submitted
      setCurrentStep('completed')

      // Reset form on success
      setForm({
        title: '',
        content: '',
        price: '',
      })
      setSuccess(true)

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        setCurrentStep('idle')
      }, 5000)
    }
    catch (error) {
      console.error('Failed to create course:', error)
      setError(error instanceof Error ? error.message : 'Failed to create course')
      setCurrentStep('idle')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast提示 */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Create New Course
          </h1>
          <p className="text-gray-400">
            Fill in the details below to create your course
          </p>
        </div>

        <div className="relative">
          {/* Blur overlay when not connected */}
          {!isConnected && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You need to connect your wallet to create courses
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

            {/* Progress Steps */}
            {isSubmitting && (
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
                <div className="space-y-4">
                  <h4 className="text-blue-300 font-medium">Creating Course...</h4>

                  {/* Step 1: API Call */}
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      currentStep === 'api'
                        ? 'border-blue-400 bg-blue-400'
                        : currentStep === 'contract' || currentStep === 'completed'
                          ? 'border-green-400 bg-green-400'
                          : 'border-gray-600'
                    }`}
                    >
                      {currentStep === 'api'
                        ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )
                        : (currentStep === 'contract' || currentStep === 'completed')
                            ? (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )
                            : null}
                    </div>
                    <span className={`text-sm ${
                      currentStep === 'api'
                        ? 'text-blue-300'
                        : currentStep === 'contract' || currentStep === 'completed'
                          ? 'text-green-300'
                          : 'text-gray-400'
                    }`}
                    >
                      Saving course data...
                    </span>
                  </div>

                  {/* Step 2: Contract Call */}
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      currentStep === 'contract'
                        ? 'border-blue-400 bg-blue-400'
                        : currentStep === 'completed'
                          ? 'border-green-400 bg-green-400'
                          : 'border-gray-600'
                    }`}
                    >
                      {currentStep === 'contract'
                        ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )
                        : currentStep === 'completed'
                          ? (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )
                          : null}
                    </div>
                    <span className={`text-sm ${
                      currentStep === 'contract'
                        ? 'text-blue-300'
                        : currentStep === 'completed'
                          ? 'text-green-300'
                          : 'text-gray-400'
                    }`}
                    >
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
                  <p className="text-green-300 text-sm">Course created successfully!</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isConnected || !form.title || !form.content || !form.price || isSubmitting}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting
                ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Creating Course...
                    </div>
                  )
                : !isConnected
                    ? (
                        'Connect Wallet First'
                      )
                    : (
                        'Create Course'
                      )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
