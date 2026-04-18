<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <nav class="nav">
      <button class="back-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回
      </button>
      <span class="nav-title">待处理申请</span>
      <div class="nav-count" v-if="pendingMessages.length > 0">{{ pendingMessages.length }} 条</div>
    </nav>
    <div class="content">

      <!-- 待处理申请 -->
      <div v-if="pendingMessages.length > 0">
        <div class="section-label">
          <span class="label-dot"></span>待审核成员
          <span class="label-count">{{ pendingMessages.length }}</span>
        </div>
        <div class="msg-card" v-for="(msg, i) in pendingMessages" :key="i">
          <div class="msg-avatar" :style="{ background: getRandomColor(msg.userName) }">{{ getInitials(msg.userName) }}</div>
          <div class="msg-body">
            <div class="msg-top">
              <span class="msg-name">{{ msg.userName }}</span>
              <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="msg-competition">申请加入：{{ msg.title }}</div>
          </div>
          <div class="msg-actions">
            <button class="action-btn btn-view" @click="goToProfile(msg.userId)">主页</button>
            <button class="action-btn btn-agree" @click="handleAgree(msg.competitionId, msg.userId, i)">同意</button>
            <button class="action-btn btn-reject" @click="handleReject(msg.competitionId, msg.userId, i)">拒绝</button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="pendingMessages.length === 0">
        <div class="empty-icon">✅</div>
        <div class="empty-title">暂无待处理申请</div>
        <div class="empty-sub">所有申请已处理完毕</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { unadmittedMembersApi, cancelRegistrationApi, joinCompetitionApi, createMessageApi } from '@/api/api'
import { formatTime } from '@/utils/auth'

const router = useRouter()
const store = useStore()
const userId = computed(() => store.state.user.userId)
const pendingMessages = ref([])

const getInitials = (name) => name?.charAt(0) || '?'
const getRandomColor = (str) => {
  const colors = ['#8b5cf6','#6d28d9','#4f46e5','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777']
  return colors[(str?.charCodeAt(0) || 0) % colors.length]
}
const goToProfile = (id) => router.push({ path: '/user-page', query: { id } })
const handleAgree = (cid, uid, i) => joinCompetition(cid, uid, i)
const handleReject = (cid, uid, i) => cancelRegistration(cid, uid, i)
const handleLogout = () => router.back()

async function unadmittedMembers() {
  try {
    const res = await unadmittedMembersApi({ userId: userId.value })
    if (res.code === 0) pendingMessages.value = res.data
  } catch (e) { console.error(e) }
}
async function joinCompetition(cid, uid, i) {
  try {
    const res1 = await joinCompetitionApi(cid, uid)
    const res2 = await createMessageApi({ competitionId: cid, userId: uid, messageType: 'APPLICATION_APPROVED', messageContent: '您的报名申请已被通过' })
    if (res1.code === 0 && res2.code === 0) pendingMessages.value.splice(i, 1)
  } catch (e) { console.error(e) }
}
async function cancelRegistration(cid, uid, i) {
  try {
    const res1 = await cancelRegistrationApi({ competitionId: cid, userId: uid })
    const res2 = await createMessageApi({ competitionId: cid, userId: uid, messageType: 'APPLICATION_REJECTED', messageContent: '您的报名申请已被拒绝' })
    if (res1.code === 0 && res2.code === 0) pendingMessages.value.splice(i, 1)
  } catch (e) { console.error(e) }
}
onMounted(() => {
  if (userId.value === -1) { router.replace('/login'); return }
  unadmittedMembers()
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 400px; height: 400px; background: rgba(167,139,250,0.18); top: -100px; right: -80px; }
.blob2 { width: 350px; height: 350px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }
.nav { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }
.back-btn {
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
.back-btn:hover {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}
.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 800;
  color: #1a1028;
  pointer-events: none;
}
.nav-count { padding: 4px 12px; background: rgba(139,92,246,0.1); color: #7c3aed; border-radius: 20px; font-size: 12px; font-weight: 600; }
.content { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 20px 16px 60px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
.label-dot { width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; flex-shrink: 0; }
.label-count { background: rgba(139,92,246,0.1); color: #7c3aed; padding: 1px 8px; border-radius: 10px; font-size: 11px; }
.msg-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-left: 3px solid #8b5cf6; border-radius: 16px; padding: 14px 16px; margin-bottom: 10px; backdrop-filter: blur(12px); box-shadow: 0 2px 12px rgba(100,80,200,0.05); transition: all 0.2s; }
.msg-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.1); }
.msg-avatar { width: 42px; height: 42px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
.msg-body { flex: 1; min-width: 0; }
.msg-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
.msg-name { font-size: 14px; font-weight: 700; color: #222; }
.msg-time { font-size: 12px; color: #bbb; }
.msg-competition { font-size: 13px; color: #8b5cf6; font-weight: 500; }
.msg-actions { display: flex; gap: 7px; flex-shrink: 0; }
.action-btn { padding: 6px 12px; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.btn-view { background: rgba(99,102,241,0.1); color: #4f46e5; }
.btn-view:hover { background: rgba(99,102,241,0.16); }
.btn-agree { background: rgba(52,211,153,0.12); color: #059669; }
.btn-agree:hover { background: rgba(52,211,153,0.2); }
.btn-reject { background: rgba(239,68,68,0.08); color: #dc2626; }
.btn-reject:hover { background: rgba(239,68,68,0.14); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 10px; }
.empty-icon { font-size: 48px; opacity: 0.3; }
.empty-title { font-size: 17px; font-weight: 600; color: #aaa; }
.empty-sub { font-size: 13px; color: #ccc; }
@media (max-width: 480px) { .msg-card { flex-wrap: wrap; } .msg-actions { width: 100%; margin-top: 8px; justify-content: flex-end; } }
</style>