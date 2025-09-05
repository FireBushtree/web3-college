export default function PlatformIntro() {
  return (
    <div className="text-center py-16 bg-gradient-to-br from-pink-500/10 via-violet-500/10 to-cyan-500/10 rounded-3xl border border-gray-800/30">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Web3 College
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Learn cutting-edge Web3 technologies and earn OWC tokens upon course
          completion. Stake your earned tokens for additional rewards and join
          our community of learners and builders shaping the decentralized
          future.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Learn</h3>
          <p className="text-gray-400 text-center">
            Access high-quality Web3 courses from industry experts
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Complete</h3>
          <p className="text-gray-400 text-center">
            Finish courses and demonstrate your knowledge
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Earn</h3>
          <p className="text-gray-400 text-center">
            Receive OWC tokens as rewards for your achievements
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-cyan-400 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Stake</h3>
          <p className="text-gray-400 text-center">
            Stake your OWC tokens to earn additional passive rewards
          </p>
        </div>
      </div>
    </div>
  )
}
