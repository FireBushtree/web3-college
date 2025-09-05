import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { CourseFormData } from '@/components/CourseForm'
import CourseForm from '@/components/CourseForm'
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

export default function Edit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      navigate('/')
      return
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await api.getCourse(id)
        setCourse(result)
      } catch (err) {
        console.error('Failed to fetch course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, navigate])

  const handleSuccess = () => {
    // 编辑成功后跳转到个人中心
    setTimeout(() => {
      navigate('/profile')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4" />
          <div className="h-4 bg-gray-700 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-700 rounded" />
            <div className="h-32 bg-gray-700 rounded" />
            <div className="h-12 bg-gray-700 rounded" />
            <div className="h-12 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-red-400 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-lg font-semibold">Failed to Load Course</span>
          </div>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  const initialData: CourseFormData = {
    title: course.name,
    content: course.description,
    price: course.price.toString(),
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          Edit Course
        </h1>
        <p className="text-gray-400">Update your course details below</p>
      </div>

      <CourseForm
        mode="edit"
        initialData={initialData}
        courseId={course._id}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
