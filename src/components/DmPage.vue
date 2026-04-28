<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>

    <!-- 导航 -->
    <nav class="nav">
      <button class="btn-back" @click="router.back()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </button>
      <div class="nav-center">
        <span class="nav-title">私信</span>
        <span class="nav-badge" v-if="totalUnread > 0">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
      </div>
      <div style="width:64px"></div>
    </nav>

    <!-- 骨架屏 -->
    <div class="content" v-if="loading">
      <div class="skeleton" v-for="n in 4" :key="n" :style="{ animationDelay: n * 0.08 + 's' }">
        <div class="sk-avatar"></div>
        <div class="sk-body">
          <div class="sk-line sk-name"></div>
          <div class="sk-line sk-preview"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-wrap" v-else-if="chatSessions.length === 0">
      <div class="empty-bubbles">
        <div class="ebubble eb1">你好 👋</div>
        <div class="ebubble eb2">在吗？</div>
        <div class="ebubble eb3">一起组队！</div>
      </div>
      <p class="empty-title">还没有对话</p>
      <p class="empty-sub">去其他用户主页点击「发私信」开始聊天</p>
    </div>

    <!-- 会话列表 -->
    <div class="content" v-else>
      <!-- 搜索框 -->
      <div class="search-wrap">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" v-model="keyword" placeholder="搜索联系人…" />
      </div>

      <div
        class="session"
        v-for="(s, i) in filtered"
        :key="s.otherUserId"
        :style="{ animationDelay: i * 0.04 + 's' }"
        @click="openChat(s)"
      >
        <!-- 左侧未读指示条 -->
        <div class="unread-bar" v-if="s.unreadCount > 0"></div>

        <!-- 头像 -->
        <div class="avatar-wrap">
          <div class="avatar" :style="{ background: avatarGradient(s.otherUserName) }">
            {{ initial(s.otherUserName) }}
          </div>
          <div class="unread-dot" v-if="s.unreadCount > 0"></div>
        </div>

        <!-- 正文 -->
        <div class="session-body">
          <div class="row-top">
            <span class="session-name">{{ s.otherUserName }}</span>
            <span class="session-time">{{ formatTime(s.lastTime) }}</span>
          </div>
          <div class="row-bottom">
            <span class="session-preview" :class="{ bold: s.unreadCount > 0 }">{{ s.lastMessage }}</span>
            <span class="unread-chip" v-if="s.unreadCount > 0">{{ s.unreadCount > 99 ? '99+' : s.unreadCount }}</span>
          </div>
        </div>

        <svg class="chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <div class="no-result" v-if="filtered.length === 0 && keyword">
        没有找到「{{ keyword }}」相关的联系人
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getChatSessionsApi } from '@/api/api'

const router = useRouter()
const store  = useStore()
const userId = ref(store.state.user.userId)
const chatSessions = ref([])
const loading = ref(false)
const keyword = ref('')

const totalUnread = computed(() => chatSessions.value.reduce((s, c) => s + (c.unreadCount || 0), 0))
const filtered = computed(() => {
  if (!keyword.value.trim()) return chatSessions.value
  return chatSessions.value.filter(s => s.otherUserName?.includes(keyword.value.trim()))
})

const GRADIENTS = [
  'linear-gradient(135deg,#c4b5fd,#8b5cf6)',
  'linear-gradient(135deg,#93c5fd,#3b82f6)',
  'linear-gradient(135deg,#6ee7b7,#10b981)',
  'linear-gradient(135deg,#fca5a5,#ef4444)',
  'linear-gradient(135deg,#fdba74,#f97316)',
  'linear-gradient(135deg,#f9a8d4,#ec4899)',
  'linear-gradient(135deg,#a5f3fc,#06b6d4)',
  'linear-gradient(135deg,#d8b4fe,#9333ea)',
]
const avatarGradient = (s) => GRADIENTS[(s?.charCodeAt(0) || 0) % GRADIENTS.length]
const initial = (s) => s?.charAt(0)?.toUpperCase() || '?'

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t), now = new Date(), diff = now - d
  if (diff < 60000)     return '刚刚'
  if (diff < 3600000)   return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000)  return d.toTimeString().slice(0, 5)
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return '周' + '日一二三四五六'[d.getDay()]
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function openChat(session) {
  session.unreadCount = 0
  router.push({ path: '/chat', query: { userId: session.otherUserId, userName: session.otherUserName } })
}

onMounted(async () => {
  if (userId.value === -1) { router.replace('/login'); return }
  loading.value = true
  try {
    const r = await getChatSessionsApi({ userId: userId.value })
    if (r.code === 0) chatSessions.value = r.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%);
  position: relative; overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* 背景光晕 */
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 480px; height: 480px; background: rgba(167,139,250,0.16); top: -120px; right: -80px; }
.blob2 { width: 380px; height: 380px; background: rgba(196,181,253,0.13); bottom: -80px; left: -60px; }
.blob3 { width: 280px; height: 280px; background: rgba(147,197,253,0.1); top: 45%; left: 40%; }

/* ── 导航 ── */
.nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 20px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139,92,246,0.08);
}
.btn-back {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 15px;
  background: rgba(139,92,246,0.06);
  border: 1px solid rgba(139,92,246,0.14);
  border-radius: 20px;
  font-size: 13px; font-weight: 700; color: #7c3aed;
  cursor: pointer; font-family: inherit; transition: all 0.18s;
}
.btn-back:hover { background: rgba(139,92,246,0.12); transform: translateX(-2px); }

.nav-center {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 7px;
}
.nav-icon {
  width: 26px; height: 26px; border-radius: 8px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  display: flex; align-items: center; justify-content: center;
  color: white; box-shadow: 0 2px 8px rgba(109,40,217,0.28);
}
.nav-title { font-size: 20px; font-weight: 800; color: #1a1028; letter-spacing: -0.2px; }
.nav-badge {
  background: #ef4444; color: white;
  font-size: 10px; font-weight: 800;
  border-radius: 999px; padding: 1px 6px; min-width: 18px; text-align: center;
  box-shadow: 0 2px 6px rgba(239,68,68,0.35);
  animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes badge-pop { from { transform: scale(0); } to { transform: scale(1); } }

/* ── 内容区 ── */
.content {
  position: relative; z-index: 1;
  max-width: 640px; margin: 0 auto;
  padding: 18px 16px 60px;
  display: flex; flex-direction: column; gap: 8px;
}

/* ── 搜索框 ── */
.search-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid rgba(139,92,246,0.1);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  margin-bottom: 4px;
  transition: all 0.2s;
}
.search-wrap:focus-within {
  border-color: rgba(139,92,246,0.35);
  background: white;
  box-shadow: 0 0 0 3px rgba(139,92,246,0.07);
}
.search-icon { color: #c4b5fd; flex-shrink: 0; }
.search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 14px; color: #333; font-family: inherit;
}
.search-input::placeholder { color: #d8b4fe; }

/* ── 会话卡片 ── */
.session {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 16px;
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.95);
  border-radius: 18px;
  backdrop-filter: blur(14px);
  box-shadow: 0 2px 12px rgba(109,40,217,0.05);
  cursor: pointer;
  transition: all 0.2s;
  position: relative; overflow: hidden;
  animation: slide-in 0.32s both ease-out;
}
.session:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 0 8px 28px rgba(109,40,217,0.1);
  border-color: rgba(139,92,246,0.2);
}
@keyframes slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 未读左侧指示条 */
.unread-bar {
  position: absolute; left: 0; top: 20%; height: 60%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #a78bfa, #7c3aed);
}

/* ── 头像 ── */
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar {
  width: 50px; height: 50px; border-radius: 16px;
  color: white; font-size: 20px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.12);
}
.unread-dot {
  position: absolute; bottom: -1px; right: -1px;
  width: 11px; height: 11px;
  background: #8b5cf6; border-radius: 50%;
  border: 2px solid white;
  animation: dot-pulse 1.8s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.3); opacity: 0.8; }
}

/* ── 文字区域 ── */
.session-body { flex: 1; min-width: 0; }
.row-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.session-name { font-size: 15px; font-weight: 800; color: #1a1028; }
.session-time { font-size: 11px; color: #c4b5fd; font-weight: 600; }
.row-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.session-preview {
  font-size: 13px; color: #a78bfa99;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis; flex: 1;
  font-weight: 500;
}
.session-preview.bold { color: #6d28d9; font-weight: 700; }
.unread-chip {
  flex-shrink: 0;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border-radius: 999px;
  font-size: 10px; font-weight: 800;
  padding: 2px 7px; min-width: 20px; text-align: center;
  box-shadow: 0 2px 6px rgba(109,40,217,0.3);
}

/* ── 箭头 ── */
.chevron { color: #e9d5ff; flex-shrink: 0; transition: all 0.18s; }
.session:hover .chevron { color: #8b5cf6; transform: translateX(3px); }

/* ── 搜索无结果 ── */
.no-result { text-align: center; padding: 24px 0; font-size: 13px; color: #c4b5fd; }

/* ── 骨架屏 ── */
.skeleton {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 16px;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 18px;
  animation: sk-pulse 1.4s ease-in-out infinite;
}
.sk-avatar { width: 50px; height: 50px; border-radius: 16px; background: rgba(196,181,253,0.3); flex-shrink: 0; }
.sk-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 10px; border-radius: 6px; background: rgba(196,181,253,0.25); }
.sk-name    { width: 30%; }
.sk-preview { width: 60%; }
@keyframes sk-pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

/* ── 空状态 ── */
.empty-wrap {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px 40px; gap: 12px;
}
.empty-bubbles {
  position: relative; width: 200px; height: 110px; margin-bottom: 20px;
}
.ebubble {
  position: absolute;
  padding: 8px 14px; border-radius: 18px;
  font-size: 13px; font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(109,40,217,0.1);
  animation: float 3s ease-in-out infinite;
}
.eb1 {
  background: rgba(255,255,255,0.85); color: #7c3aed;
  border: 1px solid rgba(139,92,246,0.2);
  top: 0; left: 0; animation-delay: 0s;
  border-radius: 18px 18px 18px 4px;
}
.eb2 {
  background: rgba(255,255,255,0.85); color: #2563eb;
  border: 1px solid rgba(96,165,250,0.25);
  top: 10px; right: 0; animation-delay: 0.7s;
  border-radius: 18px 18px 4px 18px;
}
.eb3 {
  background: rgba(255,255,255,0.85); color: #059669;
  border: 1px solid rgba(52,211,153,0.25);
  bottom: 0; left: 25px; animation-delay: 1.3s;
  border-radius: 18px 18px 18px 4px;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-7px); }
}
.empty-title { font-size: 18px; font-weight: 800; color: #6d28d9; }
.empty-sub   { font-size: 13px; color: #a78bfa; font-weight: 500; text-align: center; line-height: 1.7; }

@media (max-width: 600px) {
  .content { padding: 14px 12px 60px; }
}
</style>
