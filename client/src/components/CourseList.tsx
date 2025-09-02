import { useEffect, useState } from 'react'
import { parseEther } from 'viem'
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

// 课程卡片组件
function CourseCard({ course }: { course: Course }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const registryAddress = COURSE_REGISTRY_ADDRESSES[chainId as keyof typeof COURSE_REGISTRY_ADDRESSES]
  const owcTokenAddress = OWC_TOKEN_ADDRESSES[chainId as keyof typeof OWC_TOKEN_ADDRESSES]

  const [isApproving, setIsApproving] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // 检查用户是否已购买该课程
  const { data: hasPurchased } = useReadContract({
    address: registryAddress as `0x${string}`,
    abi: CourseRegistryABI.abi,
    functionName: 'hasPurchased',
    args: [course._id, address],
  })

  // 检查用户对课程注册合约的OWC授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: owcTokenAddress as `0x${string}`,
    abi: OWCTokenABI.abi,
    functionName: 'allowance',
    args: [address, registryAddress],
  })

  // 批准合约调用
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

  // 购买课程合约调用
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

  const coursePrice = parseEther(course.price.toString())
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
      args: [course.name],
    })
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-gray-700/50 transition-colors">
      {/* 课程标题 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 h-10 leading-5">{course.description}</p>
      </div>

      {/* 课程信息 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-400 text-sm">
            {new Date(course.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            {course.price}
          </span>
          <span className="text-gray-400 text-sm">OWC</span>
        </div>
      </div>

      {/* 购买状态和按钮 */}
      <div className="flex items-center justify-between">
        {hasPurchased
          ? (
              <span className="inline-flex items-center gap-1 text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Purchased
              </span>
            )
          : (
              <div className="flex items-center gap-3 w-full">
                {hasEnoughAllowance === true && (
                  <span className="inline-flex items-center gap-1 text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approved
                  </span>
                )}
                <div className="flex gap-2 ml-auto">
                  {!hasEnoughAllowance && (
                    <button
                      onClick={handleApprove}
                      disabled={!isConnected || isApproving}
                      className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                    >
                      {isApproving
                        ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              Approving
                            </div>
                          )
                        : 'Approve'}
                    </button>
                  )}
                  <button
                    onClick={handlePurchase}
                    disabled={!isConnected || !hasEnoughAllowance || isPurchasing}
                    className="cursor-pointer bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    {isPurchasing
                      ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Purchasing
                          </div>
                        )
                      : !isConnected
                          ? 'Connect Wallet'
                          : 'Purchase'}
                  </button>
                </div>
              </div>
            )}
      </div>
    </div>
  )
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取课程列表
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await api.getCourses()
        setCourses(result)
      }
      catch (err) {
        console.error('Failed to fetch courses:', err)
        setError('Failed to load courses')
      }
      finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={`loading-${index}`}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-700 rounded mb-4" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-24" />
              <div className="h-8 bg-gray-700 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-400 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-lg font-semibold">Failed to Load Courses</span>
        </div>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
        >
          Retry
        </button>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Courses Available</h3>
        <p className="text-gray-400 mb-6">
          There are no courses available right now. Check back later or create your own course!
        </p>
        <a
          href="/create"
          className="inline-block bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
        >
          Create Course
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Available Courses</h2>
        <p className="text-gray-400">
          Discover and purchase courses from our community of educators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  )
}
