import { ref, computed } from 'vue'

// 模拟数据，替换为真实 API 调用
const MOCK_LIST = [
  {
    id: '1',
    name: '张伟',
    age: 28,
    position: '高级前端工程师',
    location: '北京',
    score: 92,
    status: '待审核',
    highlights: ['3年Vue经验', '主导过大型项目', '开源贡献'],
    risks: ['跳槽频繁'],
    dimensions: [
      { name: '技术', value: 90 },
      { name: '经验', value: 88 },
      { name: '潜力', value: 85 },
      { name: '沟通', value: 78 },
      { name: '稳定性', value: 62 },
    ],
    interviewQuestions: [
      '请描述你主导的最复杂的前端项目？',
      '如何处理大规模状态管理的问题？',
      '谈谈你频繁更换工作的原因？',
    ],
  },
  {
    id: '2',
    name: '李娜',
    age: 25,
    position: '产品经理',
    location: '上海',
    score: 78,
    status: '待审核',
    highlights: ['用户研究扎实', '有电商背景'],
    risks: ['管理经验不足', '缺少 B 端经验'],
    dimensions: [
      { name: '业务', value: 82 },
      { name: '数据', value: 75 },
      { name: '沟通', value: 90 },
      { name: '执行', value: 70 },
      { name: '视野', value: 65 },
    ],
    interviewQuestions: [
      '描述一次你从数据出发推动产品迭代的案例？',
      '如何与技术团队协作推进需求？',
    ],
  },
  {
    id: '3',
    name: '王强',
    age: 32,
    position: '后端架构师',
    location: '深圳',
    score: 55,
    status: '待审核',
    highlights: ['分布式系统经验'],
    risks: ['技术栈过时', '沟通能力弱', '薪资预期偏高'],
    dimensions: [
      { name: '架构', value: 80 },
      { name: '代码', value: 60 },
      { name: '沟通', value: 45 },
      { name: '学习', value: 50 },
      { name: '稳定性', value: 88 },
    ],
    interviewQuestions: [
      '你如何看待技术栈的更新迭代？',
      '谈谈你对薪资的期望依据是什么？',
    ],
  },
  {
    id: '4',
    name: '陈晓',
    age: 24,
    position: 'UI/UX 设计师',
    location: '杭州',
    score: 84,
    status: '待审核',
    highlights: ['作品集丰富', '有动效设计经验', '熟悉前端开发'],
    risks: [],
    dimensions: [
      { name: '视觉', value: 92 },
      { name: '交互', value: 85 },
      { name: '研究', value: 70 },
      { name: '协作', value: 88 },
      { name: '产出', value: 80 },
    ],
    interviewQuestions: [
      '请介绍一个你最满意的设计案例？',
      '你如何平衡美观与可用性？',
    ],
  },
]

export function useReviewList() {
  const list = ref(MOCK_LIST)
  const selectedIds = ref([])
  const sortOrder = ref('desc') // 'asc' | 'desc'

  const sortedList = computed(() => {
    return [...list.value].sort((a, b) => {
      return sortOrder.value === 'desc' ? b.score - a.score : a.score - b.score
    })
  })

  const filteredList = computed(() => sortedList.value)

  const isAllSelected = computed(
    () => list.value.length > 0 && selectedIds.value.length === list.value.length
  )

  const isIndeterminate = computed(
    () => selectedIds.value.length > 0 && selectedIds.value.length < list.value.length
  )

  function toggleSelect(id) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value.splice(idx, 1)
    }
  }

  function toggleSelectAll() {
    if (isAllSelected.value) {
      selectedIds.value = []
    } else {
      selectedIds.value = list.value.map((item) => item.id)
    }
  }

  function setSortOrder(order) {
    sortOrder.value = order
  }

  return {
    list,
    selectedIds,
    sortOrder,
    isAllSelected,
    isIndeterminate,
    sortedList,
    filteredList,
    toggleSelect,
    toggleSelectAll,
    setSortOrder,
  }
}
