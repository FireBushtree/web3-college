import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import CourseRegistryABI from '@/assets/CourseRegistry.json'
import OWCTokenABI from '@/assets/OWCToken.json'
import { COURSE_REGISTRY_ADDRESSES, OWC_TOKEN_ADDRESSES } from '@/config/tokens'
import { api } from '@/utils/api'

interface Course {
  _id: number
  name: string
  description: string
  price: number
  creator: string
  createdAt: string
  updatedAt: string
}

function CourseDetailHeader({ course }: { course: Course }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const registryAddress = COURSE_REGISTRY_ADDRESSES[chainId as keyof typeof COURSE_REGISTRY_ADDRESSES]
  const owcTokenAddress = OWC_TOKEN_ADDRESSES[chainId as keyof typeof OWC_TOKEN_ADDRESSES]

  const [isApproving, setIsApproving] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const { data: hasPurchased } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CourseRegistryABI.abi,
    functionName: 'hasPurchased',
    args: [course._id, address],
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: owcTokenAddress as `0x${string}`,
    abi: OWCTokenABI.abi,
    functionName: 'allowance',
    args: [address, registryAddress],
  })

  const { writeContract: approveToken } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setIsApproving(false)
        refetchAllowance()
      },
      onError: () => {
        setIsApproving(false)
      },
    },
  })

  const { writeContract: purchaseCourse } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setIsPurchasing(false)
      },
      onError: () => {
        setIsPurchasing(false)
      },
    },
  })

  const coursePrice = course.price
  const hasEnoughAllowance = allowance && BigInt(allowance.toString()) >= coursePrice

  const handleApprove = () => {
    setIsApproving(true)
    approveToken({
      address: owcTokenAddress as `0x${string}`,
      abi: OWCTokenABI.abi,
      functionName: 'approve',
      args: [registryAddress, coursePrice],
    })
  }

  const handlePurchase = () => {
    setIsPurchasing(true)
    purchaseCourse({
      address: registryAddress as `0x${string}`,
      abi: CourseRegistryABI.abi,
      functionName: 'purchaseCourse',
      args: [course._id],
    })
  }

  const handleComplete = () => {
    setIsCompleting(true)
    setTimeout(() => {
      setIsCompleting(false)
    }, 2000)
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{course.name}</h1>
        <p className="text-gray-300 text-lg leading-relaxed">{course.description}</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-400">
            Created on
            {' '}
            {new Date(course.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            {course.price}
          </span>
          <span className="text-gray-400">OWC</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {hasPurchased
            ? (
                <span className="inline-flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Purchased
                </span>
              )
            : isPurchasing
              ? (
                  <span className="inline-flex items-center gap-2 text-orange-400">
                    <div className="w-5 h-5 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                    Purchasing
                  </span>
                )
              : hasEnoughAllowance
                ? (
                    <>
                      <span className="inline-flex items-center gap-2 text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approved
                      </span>
                      <button
                        onClick={handlePurchase}
                        disabled={!isConnected}
                        className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        Purchase
                      </button>
                    </>
                  )
                : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={!isConnected || isApproving}
                        className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        {isApproving
                          ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Approving
                              </div>
                            )
                          : (
                              'Approve'
                            )}
                      </button>
                      <button
                        onClick={handlePurchase}
                        disabled={!isConnected || !hasEnoughAllowance}
                        className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        {!isConnected
                          ? 'Connect Wallet'
                          : 'Purchase'}
                      </button>
                    </div>
                  )}
        </div>

        {hasPurchased === true && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            {isCompleting
              ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Completing
                  </div>
                )
              : (
                  'Complete'
                )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id)
        return

      try {
        setLoading(true)
        setError(null)
        const result = await api.getCourse(id)
        setCourse(result)
      }
      catch (err) {
        console.error('Failed to fetch course:', err)
        setError('Failed to load course')
      }
      finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-2/3" />
          <div className="h-6 bg-gray-700 rounded mb-6 w-full" />
          <div className="flex justify-between items-center mb-8">
            <div className="h-5 bg-gray-700 rounded w-48" />
            <div className="h-8 bg-gray-700 rounded w-24" />
          </div>
          <div className="flex gap-4">
            <div className="h-12 bg-gray-700 rounded w-32" />
            <div className="h-12 bg-gray-700 rounded w-32" />
          </div>
        </div>

        <div>
          <div className="h-8 bg-gray-700 rounded mb-4 w-48" />
          <div className="text-center py-12">
            <div className="h-6 bg-gray-700 rounded w-64 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-red-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xl font-semibold">Course Not Found</span>
          </div>
          <p className="text-gray-400 mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <a
            href="/"
            className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      <CourseDetailHeader course={course} />

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
        <div className="text-center py-16">
          <div className="mb-6">
            <svg className="w-20 h-20 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Course Content Coming Soon</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            The course content and lessons will be available here once you purchase the course.
          </p>
        </div>
      </div>
    </div>
  )
}
