import CourseList from '@/components/CourseList'
import SwapCard from '@/components/SwapCard'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* 交换卡片区域 */}
      <div className="flex justify-center">
        <SwapCard />
      </div>

      {/* 课程列表区域 */}
      <div className="px-4">
        <CourseList />
      </div>
    </div>
  )
}
