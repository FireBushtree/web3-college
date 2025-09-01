import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount } from 'wagmi'

interface CourseForm {
  title: string
  content: string
  price: string
}

export default function Create() {
  const { isConnected } = useAccount()
  const [form, setForm] = useState<CourseForm>({
    title: '',
    content: '',
    price: '',
  })

  const updateForm = (field: keyof CourseForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected)
      return

    console.warn('Creating course:', form)
    // TODO: Implement course creation logic
  }

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isConnected || !form.title || !form.content || !form.price}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {!isConnected ? 'Connect Wallet First' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  )
}
