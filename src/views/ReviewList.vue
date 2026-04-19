<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>

    <!-- 顶部导航，风格与 PersonalPage 保持一致 -->
    <nav class="nav">
      <button class="btn-back" @click="goBack">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </button>
      <div class="nav-title">审核报名 · {{ competitionTitle }}</div>
      <div class="nav-spacer"></div>
    </nav>

    <div class="content">
      <!-- 统计栏 -->
      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-num">{{ applicants.length }}</span>
          <span class="stat-label">全部</span>
        </div>
        <div class="stat-chip chip-pending">
          <span class="stat-num">{{ pendingCount }}</span>
          <span class="stat-label">待审核</span>
        </div>
        <div class="stat-chip chip-approved">
          <span class="stat-num">{{ approvedCount }}</span>
          <span class="stat-label">已通过</span>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-row">
        <button
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          v-for="f in filters"
          :key="f.value"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- 加载中 -->
      <div class="empty-tip" v-if="loading">加载中…</div>

      <!-- 空态 -->
      <div class="empty-tip" v-else-if="filteredApplicants.length === 0">暂无报名记录</div>

      <!-- 申请人列表 -->
      <div class="applicant-grid" v-else>
        <ApplicantCard
          v-for="a in filteredApplicants"
          :key="a.userId"
          :applicant="a"
          :selected="selectedId === a.userId"
          @click="openDrawer(a)"
          @select="toggleSelect(a.userId)"
        />
      </div>
    </div>

    <!-- AIReviewDrawer -->
    <AIReviewDrawer
      :visible="drawerVisible"
      :applicant="drawerApplicant"
      @close="drawerVisible = false"
      @approve="handleApprove"
      @reject="handleReject"
      @review="handleReview"
    />

    <!-- Toast -->
    <transition name="toast">
      <div class="toast" v-if="toast.show">
        <span>{{ toast.icon }}</span> {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import ApplicantCard from '@/components/review/ApplicantCard.vue'
import AIReviewDrawer from '@/components/review/AIReviewDrawer.vue'
import { unadmittedMembersApi } from '@/api/api'

const route = useRoute()
const competitionId = computed(() => route.query.id)
const competitionTitle = ref('加载中…')

const loading = ref(false)
const applicants = ref([])
const selectedId = ref(null)
const drawerVisible = ref(false)
const drawerApplicant = ref(null)
const activeFilter = ref('all')

const toast = ref({ show: false, msg: '', icon: '' })

const filters = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
]

const filteredApplicants = computed(() => {
  if (activeFilter.value === 'all') return applicants.value
  return applicants.value.filter(a => a.status === activeFilter.value)
})

const pendingCount = computed(() => applicants.value.filter(a => a.status === '待审核' || !a.status).length)
const approvedCount = computed(() => applicants.value.filter(a => a.status === '已通过').length)

const goBack = () => router.back()

async function loadApplicants() {
  if (!competitionId.value) return
  loading.value = true
  try {
    const res = await unadmittedMembersApi({ competitionId: competitionId.value })
    if (res.code === 0 && res.data) {
      applicants.value = res.data.map(item => ({
        userId: item.userId,
        name: item.userName || '未知用户',
        age: item.userAge || '-',
        position: item.userMajor || '未填写',
        location: item.userUniversity || '未填写',
        score: item.aiScore || 0,
        status: item.status || '待审核',
        highlights: item.aiHighlights || [],
        risks: item.aiRisks || [],
        interviewQuestions: item.aiInterviewQuestions || [],
        dimensions: item.aiDimensions || [],
      }))
      competitionTitle.value = res.data[0]?.competitionTitle || `竞赛 #${competitionId.value}`
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openDrawer(applicant) {
  drawerApplicant.value = applicant
  drawerVisible.value = true
  selectedId.value = applicant.userId
}

function toggleSelect(userId) {
  selectedId.value = selectedId.value === userId ? null : userId
}

function showToast(icon, msg) {
  toast.value = { show: true, icon, msg }
  setTimeout(() => { toast.value.show = false }, 2500)
}

function handleApprove(applicant) {
  updateLocalStatus(applicant.userId, '已通过')
  drawerVisible.value = false
  showToast('✅', `已通过 ${applicant.name} 的申请`)
}

function handleReject(applicant) {
  updateLocalStatus(applicant.userId, '已拒绝')
  drawerVisible.value = false
  showToast('❌', `已拒绝 ${applicant.name} 的申请`)
}

function handleReview(applicant) {
  updateLocalStatus(applicant.userId, '复核中')
  drawerVisible.value = false
  showToast('🔍', `${applicant.name} 已标记为复核中`)
}

function updateLocalStatus(userId, status) {
  const idx = applicants.value.findIndex(a => a.userId === userId)
  if (idx !== -1) applicants.value[idx] = { ...applicants.value[idx], status }
}

onMounted(() => {
  loadApplicants()
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.15); top: -120px; right: -80px; }

.nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }
.nav-title { position: absolute; left: 50%; transform: translateX(-50%); font-size: 18px; font-weight: 800; color: #1a1028; white-space: nowrap; }
.nav-spacer { width: 64px; }

.btn-back { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: rgba(139,92,246,0.08); color: #7c3aed; border: 1px solid rgba(139,92,246,0.15); border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-back:hover { background: rgba(139,92,246,0.14); }

.content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 16px; }

.stats-row { display: flex; gap: 10px; }
.stat-chip { display: flex; flex-direction: column; align-items: center; padding: 10px 18px; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-radius: 14px; backdrop-filter: blur(12px); box-shadow: 0 2px 10px rgba(100,80,200,0.05); min-width: 70px; }
.stat-num { font-size: 22px; font-weight: 800; color: #1a1028; }
.stat-label { font-size: 11px; color: #aaa; font-weight: 600; margin-top: 2px; }
.chip-pending .stat-num { color: #5c6bc0; }
.chip-approved .stat-num { color: #059669; }

.filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-btn { padding: 5px 14px; background: rgba(139,92,246,0.06); color: #888; border: 1px solid rgba(139,92,246,0.1); border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.filter-btn.active { background: rgba(139,92,246,0.12); color: #7c3aed; border-color: rgba(139,92,246,0.25); }
.filter-btn:hover { background: rgba(139,92,246,0.1); }

.applicant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.empty-tip { text-align: center; padding: 40px; font-size: 14px; color: #ccc; }

.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: rgba(240,253,244,0.96); border: 1px solid rgba(52,211,153,0.3); border-radius: 14px; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #065f46; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 999; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 600px) {
  .nav { padding: 12px 16px; }
  .nav-title { font-size: 15px; }
  .applicant-grid { grid-template-columns: 1fr; }
  .stats-row { flex-wrap: wrap; }
}
</style>