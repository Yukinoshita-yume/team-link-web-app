<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>

    <!-- 顶部导航 -->
    <nav class="nav">
      <div class="nav-title">个人主页</div>
      <div class="nav-actions">
        <button class="btn-save" @click="saveUserInfo" :disabled="saving">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {{ saving ? '保存中…' : '保存' }}
        </button>
        <button class="btn-logout" @click="handleLogout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          退出
        </button>
      </div>
    </nav>

    <div class="content">

      <!-- 头像区 -->
      <div class="avatar-section">
        <div class="avatar"></div>
        <div class="avatar-name">{{ user.userName || '未设置用户名' }}</div>
        <div class="avatar-sub">{{ user.userEmail }}</div>
      </div>

      <!-- ★ AI 对话入口横幅 -->
      <div class="ai-banner" @click="goToAiChat">
        <div class="ai-banner-left">
          <div class="ai-banner-orb">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
          </div>
          <div class="ai-banner-text">
            <span class="ai-banner-title">AI 竞赛助手</span>
            <span class="ai-banner-sub">为你推荐竞赛 · 组队策略 · 申请指导</span>
          </div>
        </div>
        <div class="ai-banner-right">
          <span class="ai-banner-btn">开始对话</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <!-- ★ 快捷入口栏：系统通知 + 私信 -->
      <div class="shortcut-bar">
        <button class="shortcut-card sc-notify" @click="goToMessagePage">
          <div class="sc-icon-wrap sc-icon-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div class="sc-text">
            <span class="sc-label">系统通知</span>
            <span class="sc-sub" v-if="unreadMessageCount > 0">{{ unreadMessageCount }} 条未读</span>
            <span class="sc-sub sc-sub-empty" v-else>暂无新通知</span>
          </div>
          <span v-if="unreadMessageCount > 0" class="sc-badge">{{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}</span>
          <svg class="sc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <button class="shortcut-card sc-dm" @click="goToDmPage">
          <div class="sc-icon-wrap sc-icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="sc-text">
            <span class="sc-label">私信</span>
            <span class="sc-sub" v-if="unreadDirectCount > 0">{{ unreadDirectCount }} 条未读</span>
            <span class="sc-sub sc-sub-empty" v-else>暂无新私信</span>
          </div>
          <span v-if="unreadDirectCount > 0" class="sc-badge sc-badge-blue">{{ unreadDirectCount > 99 ? '99+' : unreadDirectCount }}</span>
          <svg class="sc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- 个人信息卡片 -->
      <div class="card">
        <div class="card-title"><div class="title-bar"></div>个人信息</div>
        <div class="form-grid">
          <div class="field">
            <label>用户名</label>
            <input type="text" v-model="user.userName" placeholder="请输入用户名"/>
          </div>
          <div class="field">
            <label>性别</label>
            <select v-model="user.userGender">
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="unknown">其他</option>
            </select>
          </div>
          <div class="field">
            <label>学校</label>
            <input type="text" v-model="user.userUniversity" placeholder="请输入学校"/>
          </div>
          <div class="field">
            <label>专业</label>
            <input type="text" v-model="user.userMajor" placeholder="请输入专业"/>
          </div>
        </div>
        <div class="field full">
          <label>个人简介</label>
          <textarea v-model="user.userInformation" placeholder="介绍一下你自己…"></textarea>
        </div>
      </div>

      <!-- 竞赛信息三栏 -->
      <div class="competitions-grid">

        <!-- ① 我报名的项目（待审核，admission_status=0） -->
        <div class="card">
          <div class="card-title">
            <div class="title-bar bar-orange"></div>
            我报名的项目
          </div>
          <div class="project-list">
            <div
                class="project-item"
                v-for="p in registeredProjects"
                :key="p.competitionId"
                @click="toCompetitionDetail(p.competitionId)"
            >
              <span class="project-name">{{ p.title }}</span>
              <span class="status-chip chip-pending">待审核</span>
            </div>
            <div class="empty-list" v-if="registeredProjects.length === 0">暂无报名项目</div>
          </div>
        </div>

        <!-- ② 我参与的项目（已录取，admission_status=1） -->
        <div class="card">
          <div class="card-title">
            <div class="title-bar bar-amber"></div>
            我参与的项目
          </div>
          <div class="project-list">
            <div
                class="project-item"
                v-for="p in appliedProjects"
                :key="p.competitionId"
                @click="toCompetitionDetail(p.competitionId)"
            >
              <span class="project-name">{{ p.title }}</span>
              <span class="project-action">查看 ›</span>
            </div>
            <div class="empty-list" v-if="appliedProjects.length === 0">暂无参与项目</div>
          </div>
        </div>

        <!-- ③ 我创办的项目 -->
        <div class="card">
          <div class="card-title">
            <div class="title-bar"></div>
            我创办的项目
            <div class="title-actions">
              <button class="msg-btn btn-green" @click="handleCreateProject">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                创办
              </button>
            </div>
          </div>
          <div class="project-list">
            <div
                class="project-item"
                v-for="p in createdProjects"
                :key="p.competitionId"
            >
              <span class="project-name">{{ p.title }}</span>
              <div class="item-actions">
                <button class="item-btn btn-manage" @click.stop="toCompetitionDetail(p.competitionId)">
                  管理
                </button>
                <button class="item-btn btn-review badge-wrap" @click.stop="toReview(p.competitionId, p.title)">
                  审核
                  <span v-if="getPendingCount(p.competitionId) > 0" class="badge badge-sm">{{ getPendingCount(p.competitionId) > 99 ? '99+' : getPendingCount(p.competitionId) }}</span>
                </button>
              </div>
            </div>
            <div class="empty-list" v-if="createdProjects.length === 0">暂无创办项目</div>
          </div>
        </div>

      </div>

      <!-- 能力卡片 -->
      <div class="card competence-card">
        <div class="card-title">
          <div class="title-bar"></div>
          能力画像
          <span v-if="competenceCard.totalScore != null" class="total-chip">
            综合 {{ competenceCard.totalScore }} 分
          </span>
        </div>

        <!-- 技能标签 -->
        <div class="tags-row">
          <div class="tag" v-for="tag in competenceCard.skillTags" :key="tag">{{ tag }}</div>
        </div>

        <!-- 雷达图 + 条形分数并列 -->
        <div class="competence-body">
          <div class="radar-chart-wrap">
            <canvas
                id="competenceRadar"
                width="220"
                height="220"
                role="img"
                aria-label="能力雷达图，包含技术深度、竞赛经验、团队协作、学习能力、时间投入五个维度"
            >能力雷达图</canvas>
          </div>
          <div class="radar-list">
            <div class="radar-item" v-for="item in radarItems" :key="item.key">
              <span class="radar-label">{{ item.label }}</span>
              <div class="radar-bar">
                <div class="radar-bar-fill" :style="{ width: (item.value || 0) + '%' }"></div>
              </div>
              <span class="radar-score">{{ item.value != null ? item.value : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 保存成功 Toast -->
    <transition name="toast">
      <div class="toast" v-if="saveToast">
        <span>✅</span> 保存成功
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import {
  updateApi,
  allAppliedCompetitionsApi,
  allCreatedCompetitionsApi,
  allRegisteredCompetitionsApi,
  notificationCountsApi,
  getCompetenceCardApi,
  getUnreadDirectCountApi,
  pendingReviewCountApi,
} from '@/api/api'
import router from '@/router'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const store = useStore()
const localUser = computed(() => store.state.user)
const user = ref({ ...localUser.value })
const saving = ref(false)
const saveToast = ref(false)

// 三栏数据
const registeredProjects = ref([])
const appliedProjects = ref([])
const createdProjects = ref([])

// 徽章数量
const unreadMessageCount = ref(0)
const pendingReviewMap   = ref({})
const unreadDirectCount  = ref(0)

const getPendingCount = (id) => pendingReviewMap.value[id] || 0

const competenceCard = ref({
  skillTags: [],
  radarScores: {
    technicalDepth: 0,
    competitionExperience: 0,
    teamwork: 0,
    learningAbility: 0,
    timeCommitment: 0,
  },
  totalScore: null,
})
const loadingProfile = ref(false)

const radarItems = computed(() => {
  const r = competenceCard.value.radarScores || {}
  return [
    { key: 'technicalDepth',        label: '技术深度', value: r.technicalDepth },
    { key: 'competitionExperience', label: '竞赛经验', value: r.competitionExperience },
    { key: 'teamwork',              label: '团队协作', value: r.teamwork },
    { key: 'learningAbility',       label: '学习能力', value: r.learningAbility },
    { key: 'timeCommitment',        label: '时间投入', value: r.timeCommitment },
  ]
})

// ── 雷达图实例 ──────────────────────────────────────────
let radarChartInstance = null

async function initRadarChart() {
  await nextTick()
  const canvas = document.getElementById('competenceRadar')
  if (!canvas) return

  if (radarChartInstance) {
    radarChartInstance.destroy()
    radarChartInstance = null
  }

  const isDark = matchMedia('(prefers-color-scheme: dark)').matches
  const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'

  radarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: radarItems.value.map(i => i.label),
      datasets: [{
        data: radarItems.value.map(i => i.value || 0),
        backgroundColor: 'rgba(139,92,246,0.13)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: 'transparent',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#6d28d9',
      }],
    },
    options: {
      responsive: false,
      animation: { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.raw + ' 分',
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, display: false },
          grid: { color: gridColor, lineWidth: 0.8 },
          angleLines: { color: gridColor, lineWidth: 0.8 },
          pointLabels: {
            font: { size: 11, family: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif' },
            color: textColor,
          },
        },
      },
    },
  })
}

// ── 数据请求 ────────────────────────────────────────────
const saveUserInfo = async () => {
  saving.value = true
  try {
    const res = await updateApi(user.value)
    if (res.code === 0) {
      store.dispatch('saveUserInfo', user.value)
      saveToast.value = true
      setTimeout(() => saveToast.value = false, 2500)
    }
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

const handleLogout          = () => router.push('/home')
const handleCreateProject   = () => router.push('/create-project')
const toCompetitionDetail   = (id) => router.push({ path: '/project-detail', query: { id } })
const toReview = (id, title) => {
  pendingReviewMap.value = { ...pendingReviewMap.value, [id]: 0 }
  router.push({ path: '/review', query: { id, title } })
}
const goToMessagePage = () => router.push('/message-page')
const goToDmPage      = () => router.push('/dm-page')
const goToAiChat      = () => router.push('/ai-chat')

async function loadRegisteredCompetitions() {
  try { const r = await allRegisteredCompetitionsApi({ userId: localUser.value.userId }); if (r.code === 0) registeredProjects.value = r.data } catch (e) { console.error(e) }
}
async function loadAppliedCompetitions() {
  try { const r = await allAppliedCompetitionsApi({ userId: localUser.value.userId }); if (r.code === 0) appliedProjects.value = r.data } catch (e) { console.error(e) }
}
async function loadCreatedCompetitions() {
  try {
    const r = await allCreatedCompetitionsApi({ userId: localUser.value.userId })
    if (r.code === 0) {
      createdProjects.value = r.data
      await loadPendingReviewCounts()
    }
  } catch (e) { console.error(e) }
}
async function loadNotificationCounts() {
  try {
    const r = await notificationCountsApi({ userId: localUser.value.userId })
    if (r.code === 0 && r.data) {
      unreadMessageCount.value = r.data.unreadMessage || 0
    }
  } catch (e) { console.error(e) }
}
async function loadPendingReviewCounts() {
  const map = {}
  await Promise.all(
      createdProjects.value.map(async (p) => {
        try {
          const r = await pendingReviewCountApi({ competitionId: p.competitionId })
          if (r.code === 0) map[p.competitionId] = r.data || 0
        } catch (e) { console.error(e) }
      })
  )
  pendingReviewMap.value = map
}
async function loadUnreadDirect() {
  try {
    const r = await getUnreadDirectCountApi({ userId: localUser.value.userId })
    if (r.code === 0) unreadDirectCount.value = r.data || 0
  } catch (e) { console.error(e) }
}
async function loadCompetenceCard() {
  try {
    loadingProfile.value = true
    const r = await getCompetenceCardApi()
    if (r.code === 0 && r.data) {
      competenceCard.value = r.data
      initRadarChart()
    }
  } catch (e) { console.error(e) }
  finally { loadingProfile.value = false }
}

onMounted(() => {
  if (localUser.value.userId === -1) { router.replace('/login'); return }
  loadRegisteredCompetitions()
  loadAppliedCompetitions()
  loadCreatedCompetitions()
  loadNotificationCounts()
  loadUnreadDirect()
  loadCompetenceCard()
})

onBeforeUnmount(() => {
  if (radarChartInstance) {
    radarChartInstance.destroy()
    radarChartInstance = null
  }
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.15); top: -120px; right: -80px; }
.blob2 { width: 400px; height: 400px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }

/* ── 导航 ── */
.nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }
.nav-title { position: absolute; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 800; color: #1a1028; }
.nav-actions { margin-left: auto; display: flex; gap: 10px; }
.btn-save, .btn-logout { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-save { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; box-shadow: 0 3px 12px rgba(109,40,217,0.22); }
.btn-save:hover:not(:disabled) { transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-logout { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.15); }
.btn-logout:hover { background: rgba(239,68,68,0.12); }

/* ── 内容区 ── */
.content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 16px; }

/* ── 头像 ── */
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 20px 0 8px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background-image: url(../assets/user.svg); background-size: 80%; background-repeat: no-repeat; background-position: center; background-color: rgba(139,92,246,0.08); border: 3px solid rgba(139,92,246,0.18); margin-bottom: 10px; }
.avatar-name { font-size: 20px; font-weight: 800; color: #1a1028; margin-bottom: 3px; }
.avatar-sub { font-size: 13px; color: #aaa; }

/* ── AI 对话入口横幅 ── */
.ai-banner { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd); border: 1.5px solid rgba(139,92,246,0.2); border-radius: 18px; cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 4px 20px rgba(139,92,246,0.12); position: relative; overflow: hidden; }
.ai-banner::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(167,139,250,0.2), transparent); opacity: 0; transition: opacity 0.25s; }
.ai-banner:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139,92,246,0.2); }
.ai-banner:hover::before { opacity: 1; }
.ai-banner-left { display: flex; align-items: center; gap: 14px; }
.ai-banner-orb { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #a78bfa, #7c3aed); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(124,58,237,0.35); animation: orbFloat 3.5s ease-in-out infinite; }
@keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.ai-banner-text { display: flex; flex-direction: column; gap: 3px; }
.ai-banner-title { font-size: 15px; font-weight: 800; color: #4c1d95; }
.ai-banner-sub { font-size: 12px; color: #7c3aed; opacity: 0.8; }
.ai-banner-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.ai-banner-btn { padding: 6px 14px; border-radius: 16px; background: rgba(124,58,237,0.15); color: #5b21b6; font-size: 13px; font-weight: 700; border: 1px solid rgba(124,58,237,0.25); }
.ai-banner:hover .ai-banner-btn { background: rgba(124,58,237,0.22); }
.ai-banner-right svg { color: #7c3aed; }

/* ── 快捷入口栏 ── */
.shortcut-bar { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.shortcut-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: rgba(255,255,255,0.82); border: 1px solid rgba(255,255,255,0.9); border-radius: 18px; backdrop-filter: blur(12px); box-shadow: 0 2px 16px rgba(100,80,200,0.06); cursor: pointer; transition: all 0.22s; position: relative; text-align: left; }
.shortcut-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(100,80,200,0.1); }
.sc-icon-wrap { width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.sc-icon-purple { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed; }
.sc-icon-blue   { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
.sc-text { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sc-label { font-size: 15px; font-weight: 700; color: #1a1028; }
.sc-sub { font-size: 12px; color: #8b5cf6; font-weight: 500; }
.sc-sub-empty { color: #ccc; font-weight: 400; }
.sc-dm .sc-sub { color: #2563eb; }
.sc-badge { flex-shrink: 0; min-width: 22px; height: 22px; background: #ef4444; color: white; border-radius: 999px; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px; animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.sc-badge-blue { background: #3b82f6; }
.sc-arrow { color: #ccc; flex-shrink: 0; }
.shortcut-card:hover .sc-arrow { color: #8b5cf6; }
.sc-dm:hover .sc-arrow { color: #2563eb; }

/* ── 卡片 ── */
.card { background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-radius: 20px; padding: 20px; backdrop-filter: blur(12px); box-shadow: 0 2px 16px rgba(100,80,200,0.06); }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #222; margin-bottom: 16px; }
.title-bar { width: 3px; height: 16px; background: linear-gradient(180deg, #8b5cf6, #6d28d9); border-radius: 2px; flex-shrink: 0; }
.bar-amber  { background: linear-gradient(180deg, #f59e0b, #d97706); }
.bar-orange { background: linear-gradient(180deg, #f97316, #ea580c); }
.title-actions { margin-left: auto; display: flex; gap: 8px; }

/* ── 个人信息表单 ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1/-1; }
.field label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
.field input, .field select, .field textarea { padding: 10px 13px; background: rgba(245,243,255,0.6); border: 1.5px solid rgba(139,92,246,0.1); border-radius: 10px; font-size: 14px; color: #333; outline: none; transition: all 0.2s; font-family: inherit; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(139,92,246,0.4); background: white; box-shadow: 0 0 0 3px rgba(139,92,246,0.07); }
.field textarea { min-height: 90px; resize: vertical; }

/* ── 三栏竞赛网格 ── */
.competitions-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

/* ── 小操作按钮 ── */
.msg-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: rgba(139,92,246,0.08); color: #7c3aed; border: 1px solid rgba(139,92,246,0.15); border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; margin-left: auto; transition: all 0.2s; position: relative; }
.msg-btn:hover { background: rgba(139,92,246,0.14); }
.btn-green { background: rgba(52,211,153,0.1); color: #059669; border-color: rgba(52,211,153,0.2); }
.btn-green:hover { background: rgba(52,211,153,0.16); }

/* ── 红点徽章 ── */
.badge { position: absolute; top: -7px; right: -7px; min-width: 18px; height: 18px; background: #ef4444; color: white; border-radius: 999px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid white; line-height: 1; animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.badge-sm { position: absolute; top: -6px; right: -6px; min-width: 16px; height: 16px; background: #ef4444; color: white; border-radius: 999px; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid white; line-height: 1; animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.badge-wrap { position: relative; }
@keyframes badge-pop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

/* ── 项目列表 ── */
.project-list { display: flex; flex-direction: column; gap: 2px; }
.project-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; transition: all 0.2s; cursor: pointer; }
.project-item:hover { background: rgba(139,92,246,0.05); }
.project-name { font-size: 14px; color: #333; font-weight: 500; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.project-action { font-size: 13px; color: #aaa; flex-shrink: 0; margin-left: 8px; }
.project-item:hover .project-action { color: #8b5cf6; }
.empty-list { text-align: center; padding: 20px; font-size: 13px; color: #ccc; }
.status-chip { flex-shrink: 0; margin-left: 8px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.chip-pending { background: rgba(249,115,22,0.1); color: #ea580c; border: 1px solid rgba(249,115,22,0.2); }

/* ── 竞赛操作按钮组 ── */
.item-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 8px; }
.item-btn { display: flex; align-items: center; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; position: relative; }
.btn-manage { background: rgba(139,92,246,0.08); color: #7c3aed; border-color: rgba(139,92,246,0.15); }
.btn-manage:hover { background: rgba(139,92,246,0.14); }
.btn-review { background: rgba(245,158,11,0.08); color: #d97706; border-color: rgba(245,158,11,0.2); }
.btn-review:hover { background: rgba(245,158,11,0.14); }

/* ── 能力画像 ── */
.competence-card { margin-top: 4px; }

.tags-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.tags-row .tag { padding: 4px 10px; background: rgba(139,92,246,0.08); color: #7c3aed; border-radius: 999px; font-size: 12px; font-weight: 600; }

/* 雷达图 + 条形并列布局 */
.competence-body { display: flex; align-items: center; gap: 32px; }
.radar-chart-wrap { flex-shrink: 0; }

.radar-list { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.radar-item { display: flex; align-items: center; gap: 10px; }
.radar-label { width: 60px; font-size: 13px; color: #666; flex-shrink: 0; }
.radar-bar { flex: 1; height: 7px; border-radius: 999px; background: rgba(139,92,246,0.08); overflow: hidden; }
.radar-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #c4b5fd, #8b5cf6); transition: width 0.6s cubic-bezier(0.34,1.1,0.64,1); }
.radar-score { width: 32px; text-align: right; font-size: 13px; font-weight: 600; color: #555; flex-shrink: 0; }

.total-chip { margin-left: auto; padding: 3px 10px; border-radius: 999px; background: rgba(16,185,129,0.08); color: #059669; font-size: 12px; font-weight: 600; }

/* ── Toast ── */
.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: rgba(240,253,244,0.96); border: 1px solid rgba(52,211,153,0.3); border-radius: 14px; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #065f46; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 999; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── 响应式 ── */
@media (max-width: 900px) { .competitions-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 700px) {
  .competence-body { flex-direction: column; align-items: center; gap: 20px; }
  .radar-list { width: 100%; }
}
@media (max-width: 600px) {
  .form-grid, .competitions-grid, .shortcut-bar { grid-template-columns: 1fr; }
  .nav { padding: 12px 16px; }
  .ai-banner-sub { display: none; }
}
</style>