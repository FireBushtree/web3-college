import CourseList from '@/components/CourseList'
import SwapCard from '@/components/SwapCard'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* 课程列表区域 */}
      <div className="px-4">
        <CourseList />
      </div>

      {/* 交换卡片区域 */}
      <div className="flex justify-center">
        <SwapCard />
      </div>
    </div>
  )
}
