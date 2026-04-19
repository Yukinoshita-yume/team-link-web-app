<template>
  <div class="page">
    <!-- 背景装饰 -->
    <div class="bg-blob blob1"></div>
    <div class="bg-blob blob2"></div>

    <!-- 顶部导航 -->
    <nav class="nav">
      <button class="nav-back" @click="handleExit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回
      </button>
      <div class="nav-chip" :class="chipClass">
        <span class="chip-dot"></span>{{ chipText }}
      </div>
    </nav>

    <div class="content">

      <!-- 主卡片 -->
      <div class="hero-card">
        <!-- 标签 -->
        <div class="tag-row" v-if="hasTags">
          <span class="tag-item" v-for="tag in activeTags" :key="tag">{{ tag }}</span>
        </div>
        <!-- 标题 -->
        <h1 class="hero-title">{{ competition.title }}</h1>
        <!-- 元信息 -->
        <div class="hero-meta">
          <div class="meta-pill" :class="{ 'pill-warn': isFull }">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ competition.currentCount }}/{{ competition.maxParticipants }} 人
            <span class="pill-badge" v-if="isFull">已满</span>
          </div>
          <div class="meta-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            截止 {{ formatDate(competition.deadline) }}
          </div>
          <div class="meta-pill" v-if="competition.schoolRequirements">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            {{ competition.schoolRequirements }}
          </div>
        </div>
      </div>

      <!-- 队长卡片 -->
      <div class="captain-card" @click="goToProfile(competitionCreator.userId)">
        <div class="captain-left">
          <div class="captain-avatar"></div>
          <div>
            <div class="captain-role">队长</div>
            <div class="captain-name">{{ competitionCreator.userName || '加载中…' }}</div>
          </div>
        </div>
        <div class="captain-go">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>

      <!-- 操作卡片（非创建者） -->
      <div class="action-card" v-if="!isMine">

        <!-- 未报名 -->
        <template v-if="registrationStatus === 0 && !isFull">
          <div class="status-banner banner-info">
            <div class="banner-icon">🚀</div>
            <div class="banner-text">
              <div class="banner-title">正在招募队员</div>
              <div class="banner-desc">提交申请后，队长审核通过即可加入队伍</div>
            </div>
          </div>
          <button class="action-btn btn-primary" @click="handleButtonClick" :disabled="isDisabled">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            立即报名
          </button>
        </template>

        <!-- 已满员 -->
        <template v-if="registrationStatus === 0 && isFull">
          <div class="status-banner banner-gray">
            <div class="banner-icon">😔</div>
            <div class="banner-text">
              <div class="banner-title">队伍已满员</div>
              <div class="banner-desc">该队伍已达到人数上限，可以关注其他竞赛</div>
            </div>
          </div>
        </template>

        <!-- 待审核 -->
        <template v-if="registrationStatus === 1">
          <div class="status-banner banner-warn">
            <div class="banner-icon">⏳</div>
            <div class="banner-text">
              <div class="banner-title">申请已提交，等待审核</div>
              <div class="banner-desc">队长审核通过后你将收到消息通知，请耐心等待</div>
            </div>
          </div>
          <button class="action-btn btn-ghost-warn" @click="handleButtonClick" :disabled="isDisabled">
            取消申请
          </button>
        </template>

        <!-- 已加入 -->
        <template v-if="registrationStatus === 2">
          <div class="status-banner banner-success">
            <div class="banner-icon">🎉</div>
            <div class="banner-text">
              <div class="banner-title">你已成功加入队伍！</div>
              <div class="banner-desc">祝你们在比赛中发挥出色，取得好成绩</div>
            </div>
          </div>
          <button class="action-btn btn-ghost-danger" @click="handleButtonClick" :disabled="isDisabled">
            退出队伍
          </button>
        </template>
      </div>

      <!-- 操作卡片（创建者） -->
      <div class="action-card" v-if="isMine">
        <div class="status-banner banner-purple">
          <div class="banner-icon">👑</div>
          <div class="banner-text">
            <div class="banner-title">你是这支队伍的队长</div>
            <div class="banner-desc">管理队伍成员，审核成员申请</div>
          </div>
        </div>
        <button class="action-btn btn-review" @click="router.push('/review')" style="margin-bottom: 10px;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          审核申请者
        </button>
        <button class="action-btn btn-ghost-danger" @click="handleDelete">
          解散队伍
        </button>
      </div>

      <!-- 竞赛详情 -->
      <div class="info-card">
        <div class="card-title">
          <div class="title-bar"></div>
          竞赛详情
        </div>
        <div class="card-body-text">{{ competition.competitionDetails || '暂无详细介绍' }}</div>
      </div>

      <!-- 队伍成员（队长可见） -->
      <div class="info-card" v-if="isMine && competition.admittedMemberId.length">
        <div class="card-title">
          <div class="title-bar"></div>
          队伍成员
          <span class="member-count">{{ competition.admittedMemberId.length }}</span>
        </div>
        <div class="member-list">
          <div class="member-item" v-for="i in competition.admittedMemberId.length" :key="i">
            <div class="member-avatar" :style="{ background: getRandomColor(competition.admittedMemberNames[i-1]) }">
              {{ getInitials(competition.admittedMemberNames[i-1]) }}
            </div>
            <span class="member-name">{{ competition.admittedMemberNames[i-1] }}</span>
            <div class="member-btns">
              <button class="mem-btn mem-view" @click="goToProfile(competition.admittedMemberId[i-1])">主页</button>
              <button class="mem-btn mem-kick" @click="removeMember(i-1)">移除</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <transition name="toast">
      <div class="toast-wrap" v-if="toast.show">
        <div class="toast-card" :class="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.icon }}</span>
          <div>
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-desc" v-if="toast.desc">{{ toast.desc }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import {
  competitionDetailApi, applyCompetitionApi, checkApplicationApi,
  cancelRegistrationApi, creatorApi, createMessageApi, deleteCompetitioinApi
} from '@/api/api'
import { getRandomColor, getInitials } from '@/utils/auth'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import router from '@/router'

const route = useRoute()
const store = useStore()
const confirmDialog = inject('confirmDialog')
const competitionId = ref(route.query.id || '')
const localUser = computed(() => store.state.user)
const competitionCreator = ref({ userId: '', userName: '' })
const registrationStatus = ref(0)
const isDisabled = ref(true)
const isMine = ref(false)
const params = { competitionId: competitionId.value, userId: localUser.value.userId }

const competition = ref({
  userId: -1, title: '', tag1: '', tag2: '', tag3: '', tag4: '', tag5: '',
  competitionDetails: '', schoolRequirements: '', deadline: '',
  maxParticipants: 0, currentCount: 0, admittedMemberNames: [], admittedMemberId: []
})

// Toast
const toast = ref({ show: false, type: 'success', icon: '', title: '', desc: '' })
const showToast = (type, icon, title, desc = '') => {
  toast.value = { show: true, type, icon, title, desc }
  setTimeout(() => toast.value.show = false, 3500)
}

const hasTags = computed(() => [1,2,3,4,5].some(i => competition.value[`tag${i}`]))
const activeTags = computed(() => [1,2,3,4,5].map(i => competition.value[`tag${i}`]).filter(Boolean))
const isFull = computed(() => competition.value.currentCount >= competition.value.maxParticipants && competition.value.maxParticipants > 0)

const chipClass = computed(() => {
  if (isMine.value) return 'chip-purple'
  if (registrationStatus.value === 2) return 'chip-success'
  if (registrationStatus.value === 1) return 'chip-warn'
  if (isFull.value) return 'chip-gray'
  return 'chip-green'
})
const chipText = computed(() => {
  if (isMine.value) return '我创建的'
  if (registrationStatus.value === 2) return '已加入'
  if (registrationStatus.value === 1) return '待审核'
  if (isFull.value) return '已满员'
  return '招募中'
})

const formatDate = (d) => {
  if (!d) return '未设置'
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const goToProfile = (userId) => router.push({ path: '/user-page', query: { id: userId } })

async function fetchCompetitionDetail() {
  try {
    await checkApplication(params)
    const res = await competitionDetailApi({ competitionId: competitionId.value })
    if (res.code === 0) {
      competition.value = {
        userId: res.data.userId, title: res.data.title || '未命名竞赛',
        tag1: res.data.tag1, tag2: res.data.tag2, tag3: res.data.tag3,
        tag4: res.data.tag4, tag5: res.data.tag5,
        competitionDetails: res.data.competitionDetails || '暂无详细介绍',
        schoolRequirements: res.data.schoolRequirements, deadline: res.data.deadline,
        maxParticipants: res.data.maxParticipants || 0, currentCount: res.data.currentCount || 0,
        admittedMemberNames: res.data.admittedMemberNames.map(m => m.userName) || [],
        admittedMemberId: res.data.admittedMemberNames.map(m => m.userId) || []
      }
      isMine.value = res.data.userId === localUser.value.userId
      if (!isMine.value && competition.value.admittedMemberId.includes(localUser.value.userId))
        registrationStatus.value = 2
    }
  } catch (e) { console.error(e) }
}

async function creator() {
  try {
    const res = await creatorApi({ competitionId: competitionId.value })
    if (res.code === 0) competitionCreator.value = res.data
  } catch (e) { console.error(e) }
}

async function applyCompetition() {
  try {
    const res = await applyCompetitionApi(competitionId.value, localUser.value.userId)
    await createMessageApi({ competitionId: competitionId.value, userId: localUser.value.userId, messageType: 'APPLICATION_SUBMITTED', messageContent: '您提交了报名申请' })
    if (res.code === 0) {
      registrationStatus.value = 1
      showToast('success', '✅', '报名申请已提交！', '请耐心等待队长审核，审核通过后你将收到通知')
    }
  } catch (e) { showToast('error', '❌', '报名失败，请稍后重试') }
}

async function cancelRegistration(p) {
  try {
    const quitting = registrationStatus.value === 2
    const res = await cancelRegistrationApi(p)
    await createMessageApi({ competitionId: competitionId.value, userId: localUser.value.userId, messageType: quitting ? 'TEAM_QUIT' : 'APPLICATION_CANCELLED', messageContent: quitting ? '您退出了队伍' : '您取消了报名申请' })
    if (res.code === 0) {
      registrationStatus.value = 0
      showToast('info', 'ℹ️', quitting ? '已退出队伍' : '已取消报名申请')
    }
  } catch (e) { showToast('error', '❌', '操作失败，请稍后重试') }
}

async function remove(index) {
  try {
    const p = { competitionId: competitionId.value, userId: competition.value.admittedMemberId[index] }
    const res = await cancelRegistrationApi(p)
    await createMessageApi({ competitionId: competitionId.value, userId: competition.value.admittedMemberId[index], messageType: 'TEAM_KICKED', messageContent: '您被移出了队伍' })
    if (res.code === 0) {
      competition.value.admittedMemberId.splice(index, 1)
      competition.value.admittedMemberNames.splice(index, 1)
      competition.value.currentCount -= 1
      showToast('info', 'ℹ️', '已移除该成员')
    }
  } catch (e) { console.error(e) }
}

async function checkApplication(p) {
  try {
    isDisabled.value = true
    const res = await checkApplicationApi(p)
    if (res.code === 0) { registrationStatus.value = res.data === true ? 1 : 0; isDisabled.value = false }
  } catch (e) { isDisabled.value = true }
}

async function deleteCompetitioin() {
  try {
    const res = await deleteCompetitioinApi({ competitionId: competitionId.value })
    if (res.code === 0) { showToast('success', '✅', '队伍已解散'); setTimeout(() => router.back(), 1500) }
  } catch (e) { console.error(e) }
}

onMounted(() => {
  if (localUser.value.userId === -1) router.replace('/login')
  else { creator(); fetchCompetitionDetail() }
})

const handleButtonClick = () => {
  isDisabled.value = true
  registrationStatus.value !== 0 ? cancelRegistration(params) : applyCompetition()
  setTimeout(() => isDisabled.value = false, 2000)
}

const removeMember = async (index) => {
  const ok = await confirmDialog({ title: '移除成员', message: `确定将 ${competition.value.admittedMemberNames[index]} 移出队伍吗？`, confirmText: '确认移除', cancelText: '取消' })
  if (ok) remove(index)
}

const handleDelete = async () => {
  const ok = await confirmDialog({ title: '解散队伍', message: '解散后所有成员将被移除，此操作无法恢复。', confirmText: '确认解散', cancelText: '再想想' })
  if (ok) deleteCompetitioin()
}

const handleExit = () => window.history.length > 1 ? window.history.back() : window.close()
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f8f4ff 0%, #f0f4ff 50%, #f4f8ff 100%);
  position: relative;
  overflow-x: hidden;
}

.bg-blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.blob1 { width: 480px; height: 480px; background: rgba(167,139,250,0.15); top: -120px; right: -80px; }
.blob2 { width: 400px; height: 400px; background: rgba(147,197,253,0.15); bottom: 40px; left: -60px; }

/* 导航 */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 20px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-back:hover {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.nav-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}
.chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.chip-green  { background: rgba(52,211,153,0.1);  color: #059669; }
.chip-warn   { background: rgba(251,191,36,0.12); color: #d97706; }
.chip-success{ background: rgba(99,102,241,0.1);  color: #4f46e5; }
.chip-gray   { background: rgba(156,163,175,0.1); color: #6b7280; }
.chip-purple { background: rgba(139,92,246,0.1);  color: #7c3aed; }

/* 内容区 */
.content {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 0 auto;
  padding: 20px 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 通用卡片 */
.hero-card, .captain-card, .action-card, .info-card {
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06), 0 1px 4px rgba(0,0,0,0.04);
}

/* 主卡片 */
.hero-card { padding: 24px 22px 20px; }

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
}
.tag-item {
  padding: 4px 13px;
  background: rgba(139,92,246,0.08);
  color: #7c3aed;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(139,92,246,0.12);
}

.hero-title {
  font-size: clamp(22px, 4.5vw, 30px);
  font-weight: 800;
  color: #1a1028;
  line-height: 1.25;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.meta-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: rgba(0,0,0,0.04);
  border-radius: 20px;
  font-size: 13px;
  color: #666;
}
.meta-pill svg { opacity: 0.6; flex-shrink: 0; }
.pill-warn { background: rgba(239,68,68,0.07); color: #dc2626; }
.pill-badge {
  padding: 1px 7px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}

/* 队长卡片 */
.captain-card {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
}
.captain-card:hover { box-shadow: 0 4px 20px rgba(100,80,200,0.1); transform: translateY(-1px); }
.captain-left { display: flex; align-items: center; gap: 12px; }
.captain-avatar {
  width: 46px; height: 46px;
  border-radius: 50%;
  background-image: url(../assets/user.svg);
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(139,92,246,0.08);
  border: 2px solid rgba(139,92,246,0.15);
  flex-shrink: 0;
}
.captain-role { font-size: 11px; color: #aaa; font-weight: 500; margin-bottom: 2px; }
.captain-name { font-size: 16px; font-weight: 700; color: #222; }
.captain-go { color: #ccc; transition: all 0.2s; }
.captain-card:hover .captain-go { color: #8b5cf6; transform: translateX(3px); }

/* 操作卡片 */
.action-card { padding: 18px; overflow: hidden; }

.status-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.banner-icon { font-size: 22px; flex-shrink: 0; line-height: 1; margin-top: 1px; }
.banner-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
.banner-desc { font-size: 13px; line-height: 1.5; opacity: 0.75; }

.banner-info    { background: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.07)); color: #4338ca; }
.banner-warn    { background: rgba(251,191,36,0.1);  color: #92400e; }
.banner-success { background: rgba(52,211,153,0.1);  color: #065f46; }
.banner-gray    { background: rgba(156,163,175,0.1); color: #374151; }
.banner-purple  { background: rgba(139,92,246,0.08); color: #5b21b6; }

/* 按钮 */
.action-btn {
  width: 100%;
  padding: 13px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 18px rgba(109,40,217,0.28);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(109,40,217,0.35); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-ghost-warn {
  background: transparent;
  border: 1.5px solid rgba(245,158,11,0.3);
  color: #d97706;
}
.btn-ghost-warn:hover:not(:disabled) { background: rgba(245,158,11,0.06); }

.btn-ghost-danger {
  background: transparent;
  border: 1.5px solid rgba(239,68,68,0.2);
  color: #dc2626;
}
.btn-ghost-danger:hover { background: rgba(239,68,68,0.05); }
.btn-review {
  background: linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%);
  color: white;
  box-shadow: 0 4px 18px rgba(57,73,171,0.28);
}
.btn-review:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(57,73,171,0.35); }
/* 信息卡片 */
.info-card { padding: 20px 22px; }
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin-bottom: 14px;
}
.title-bar {
  width: 3px; height: 17px;
  background: linear-gradient(180deg, #8b5cf6, #6d28d9);
  border-radius: 2px;
  flex-shrink: 0;
}
.member-count {
  margin-left: 2px;
  background: rgba(139,92,246,0.1);
  color: #7c3aed;
  padding: 1px 9px;
  border-radius: 10px;
  font-size: 12px;
}

.card-body-text {
  font-size: 14px;
  line-height: 1.85;
  color: #555;
  white-space: pre-wrap;
  background: rgba(0,0,0,0.02);
  padding: 14px 16px;
  border-radius: 12px;
}

/* 成员列表 */
.member-list { display: flex; flex-direction: column; gap: 10px; }
.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  transition: all 0.2s;
}
.member-item:hover { background: rgba(139,92,246,0.05); }
.member-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.member-name { flex: 1; font-size: 14px; font-weight: 600; color: #333; }
.member-btns { display: flex; gap: 7px; }
.mem-btn {
  padding: 5px 13px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.mem-view { background: rgba(99,102,241,0.08); color: #4f46e5; }
.mem-view:hover { background: rgba(99,102,241,0.14); }
.mem-kick { background: rgba(239,68,68,0.08); color: #dc2626; }
.mem-kick:hover { background: rgba(239,68,68,0.14); }

/* Toast */
.toast-wrap {
  position: fixed;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  width: calc(100% - 48px);
  max-width: 400px;
}
.toast-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px 18px;
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
}
.toast-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.toast-title { font-size: 14px; font-weight: 600; color: #222; }
.toast-desc { font-size: 13px; color: #666; margin-top: 2px; line-height: 1.4; }

.toast-success { background: rgba(240,253,244,0.96); border: 1px solid rgba(52,211,153,0.25); }
.toast-error   { background: rgba(254,242,242,0.96); border: 1px solid rgba(239,68,68,0.25); }
.toast-info    { background: rgba(239,246,255,0.96); border: 1px solid rgba(99,102,241,0.2); }

.toast-enter-active, .toast-leave-active { transition: all 0.32s cubic-bezier(.34,1.56,.64,1); }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.94); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.97); }

@media (max-width: 480px) {
  .hero-title { font-size: 20px; }
  .content { padding: 16px 12px 80px; gap: 12px; }
}
</style>