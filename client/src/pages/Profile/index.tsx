import type { BaseSyntheticEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
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

function CreateCourseCard() {
  return (
    <div className="bg-gradient-to-r from-pink-500/10 to-violet-600/10 border border-pink-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-violet-600/5 animate-pulse" />

      <div className="relative z-10 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Create New Course</h3>
          <p className="text-gray-400">Share your knowledge with the community and earn OWC tokens</p>
        </div>

        <a
          href="/create"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-pink-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Creating
        </a>
      </div>
    </div>
  )
}

function UserCourseCard({ course }: { course: Course }) {
  const handleEdit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-gray-700/50 transition-colors">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 h-10 leading-5">{course.description}</p>
      </div>

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

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Published
        </span>
        <button
          onClick={handleEdit}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  const { address } = useAccount()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserCourses = async () => {
    if (!address)
      return

    try {
      setLoading(true)
      setError(null)
      const result = await api.getUserCourses()
      setCourses(result.courses)
    }
    catch (err) {
      console.error('Failed to fetch user courses:', err)
      setError('Failed to load your courses')
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserCourses()
  }, [address])

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="px-4">
        <CreateCourseCard />
      </div>

      <div className="px-4">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">My Courses</h2>
            <p className="text-gray-400">
              Manage your published courses and track their performance
            </p>
          </div>

          {loading
            ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }, (_, index) => (
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
            : error
              ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-2 text-red-400 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-lg font-semibold">Failed to Load Your Courses</span>
                    </div>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                      onClick={fetchUserCourses}
                      className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
                    >
                      Retry
                    </button>
                  </div>
                )
              : courses.length === 0
                ? (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Courses Yet</h3>
                      <p className="text-gray-400">
                        You haven't created any courses yet. Use the form above to create your first course!
                      </p>
                    </div>
                  )
                : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map(course => (
                        <UserCourseCard key={course._id} course={course} />
                      ))}
                    </div>
                  )}
        </div>
      </div>
    </div>
  )
}
