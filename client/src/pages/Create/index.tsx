import CourseForm from '@/components/CourseForm'

export default function Create() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Create New Course
        </h1>
        <p className="text-gray-400">
          Fill in the details below to create your course
        </p>
      </div>

      <CourseForm mode="create" />
    </div>
  )
}
