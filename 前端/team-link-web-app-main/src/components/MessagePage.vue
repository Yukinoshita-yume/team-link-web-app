<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <nav class="nav">
      <button class="back-btn" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回
      </button>
      <span class="nav-title">我的消息</span>
      <div class="nav-count" v-if="pendingMessages.length > 0">{{ pendingMessages.length }} 条待处理</div>
    </nav>
    <div class="content">

      <!-- 待处理 -->
      <div v-if="pendingMessages.length > 0">
        <div class="section-label">
          <span class="label-dot dot-blue"></span>待处理申请
          <span class="label-count">{{ pendingMessages.length }}</span>
        </div>
        <div class="msg-card pending" v-for="(msg, i) in pendingMessages" :key="i" @click="readMessage(i)">
          <div class="msg-left">
            <div class="msg-avatar" :style="{ background: getRandomColor(msg.userName) }">{{ getInitials(msg.userName) }}</div>
          </div>
          <div class="msg-body">
            <div class="msg-top">
              <span class="msg-name">{{ msg.userName }}</span>
              <span class="msg-time">{{ formatTime(msg.messageCreatedTime) }}</span>
            </div>
            <div class="msg-competition">{{ msg.title || '已解散竞赛' }}</div>
            <div class="msg-content">{{ msg.messageContent }}</div>
          </div>
          <div class="msg-dot"></div>
        </div>
      </div>

      <!-- 历史消息 -->
      <div v-if="historyMessages.length > 0" style="margin-top: 8px;">
        <div class="section-label">
          <span class="label-dot dot-gray"></span>历史消息
        </div>
        <div class="msg-card history" v-for="(msg, i) in historyMessages" :key="i">
          <div class="msg-left">
            <div class="msg-avatar avatar-gray" :style="{ background: getRandomColor(msg.userName || '?') }">{{ getInitials(msg.userName || '?') }}</div>
          </div>
          <div class="msg-body">
            <div class="msg-top">
              <span class="msg-name">{{ msg.userName }}</span>
              <span class="msg-time">{{ formatTime(msg.messageCreatedTime) }}</span>
            </div>
            <div class="msg-competition">{{ msg.title || '已解散竞赛' }}</div>
            <div class="msg-content">{{ msg.messageContent }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="pendingMessages.length === 0 && historyMessages.length === 0">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无消息</div>
        <div class="empty-sub">你目前没有任何消息通知</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { memberMessageApi, readApi } from '@/api/api'
import { formatTime } from '@/utils/auth'

const router = useRouter()
const store = useStore()
const userId = computed(() => store.state.user.userId)
const pendingMessages = ref([])
const historyMessages = ref([])

const getInitials = (name) => name?.charAt(0) || '?'
const getRandomColor = (str) => {
  const colors = ['#8b5cf6','#6d28d9','#7c3aed','#4f46e5','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777']
  return colors[(str?.charCodeAt(0) || 0) % colors.length]
}

async function memberMessage(arr, isRead) {
  try {
    const res = await memberMessageApi({ userId: userId.value, isRead })
    if (res.code === 0) arr.value = res.data
  } catch (e) { console.error(e) }
}
async function read(index) {
  try {
    const res = await readApi({ messageId: pendingMessages.value[index].messageId })
    if (res.code === 0) { historyMessages.value.unshift(pendingMessages.value[index]); pendingMessages.value.splice(index, 1) }
  } catch (e) { console.error(e) }
}
const readMessage = (i) => read(i)
const handleLogout = () => router.back()
onMounted(() => {
  if (userId.value === -1) { router.replace('/login'); return }
  memberMessage(pendingMessages, false)
  memberMessage(historyMessages, true)
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 400px; height: 400px; background: rgba(167,139,250,0.18); top: -100px; right: -80px; }
.blob2 { width: 350px; height: 350px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }
.nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }

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
.section-label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; padding-left: 4px; }
.label-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-blue { background: #8b5cf6; }
.dot-gray { background: #d1d5db; }
.label-count { margin-left: 4px; background: rgba(139,92,246,0.1); color: #7c3aed; padding: 1px 8px; border-radius: 10px; font-size: 11px; }
.msg-card { display: flex; align-items: flex-start; gap: 12px; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-radius: 16px; padding: 16px; margin-bottom: 10px; backdrop-filter: blur(12px); box-shadow: 0 2px 12px rgba(100,80,200,0.05); transition: all 0.2s; position: relative; }
.msg-card.pending { cursor: pointer; border-left: 3px solid #8b5cf6; }
.msg-card.pending:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(139,92,246,0.12); }
.msg-card.history { opacity: 0.75; }
.msg-avatar { width: 40px; height: 40px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
.msg-body { flex: 1; min-width: 0; }
.msg-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
.msg-name { font-size: 14px; font-weight: 700; color: #222; }
.msg-time { font-size: 12px; color: #bbb; }
.msg-competition { font-size: 13px; color: #8b5cf6; font-weight: 500; margin-bottom: 4px; }
.msg-content { font-size: 13px; color: #666; line-height: 1.5; }
.msg-dot { width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; flex-shrink: 0; margin-top: 4px; }
.msg-card.history .msg-dot { display: none; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 10px; }
.empty-icon { font-size: 48px; opacity: 0.3; }
.empty-title { font-size: 17px; font-weight: 600; color: #aaa; }
.empty-sub { font-size: 13px; color: #ccc; }
</style>