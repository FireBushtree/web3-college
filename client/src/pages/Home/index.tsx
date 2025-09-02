import CourseList from '@/components/CourseList'
import PlatformIntro from '@/components/PlatformIntro'
import SwapCard from '@/components/SwapCard'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* 平台介绍区域 */}
      <div className="px-4">
        <PlatformIntro />
      </div>

      {/* 课程列表区域 */}
      <div className="px-4">
        <CourseList />
      </div>

      {/* 交换卡片区域 */}
      <div className="px-4">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Token Exchange</h2>
            <p className="text-gray-400">
              Swap your tokens seamlessly with our integrated exchange
            </p>
          </div>

          <div className="flex justify-center">
            <SwapCard />
          </div>
        </div>
      </div>
    </div>
  )
}
