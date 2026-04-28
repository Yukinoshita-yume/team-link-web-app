<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>

    <!-- 顶部导航 -->
    <nav class="nav">
      <button class="btn-back" @click="router.back()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </button>
      <div class="nav-center">
        <div class="nav-avatar">{{ getInitial(otherUserName) }}</div>
        <span class="nav-name">{{ otherUserName }}</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <!-- 消息列表 -->
    <div class="msg-list" ref="msgListRef">
      <div class="load-tip" v-if="loading">加载中…</div>
      <div class="empty-tip" v-else-if="messages.length === 0">
        暂无消息，发送第一条消息开始对话吧 👋
      </div>

      <template v-for="(msg, i) in messages" :key="msg.messageId">
        <!-- 时间分割线（相邻消息超过5分钟显示） -->
        <div class="time-divider" v-if="showTimeDivider(i)">
          {{ formatTime(msg.messageCreatedTime) }}
        </div>

        <!-- 气泡 -->
        <div class="bubble-row" :class="{ 'is-self': msg.senderId === myUserId }">

          <div
              class="bubble-avatar"
              :style="{
    background: msg.senderId === myUserId
      ? avatarColor(myUserName)
      : avatarColor(otherUserName)
  }"
          >
            {{ msg.senderId === myUserId
              ? getInitial(myUserName)
              : getInitial(otherUserName)
            }}
          </div>
          <div class="bubble" :class="msg.senderId === myUserId ? 'bubble-self' : 'bubble-other'">
            {{ msg.messageContent }}
          </div>

        </div>
      </template>
    </div>

    <!-- 输入框 -->
    <div class="input-bar">
      <textarea
        class="input-box"
        v-model="inputText"
        placeholder="输入消息…"
        rows="1"
        @keydown.enter.exact.prevent="sendMessage"
        @keydown.enter.shift.exact="inputText += '\n'"
        @input="autoResize"
        ref="textareaRef"
      ></textarea>
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="!inputText.trim() || sending"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import router from '@/router'
import { getConversationApi, sendDirectMessageApi } from '@/api/api'

const route  = useRoute()
const store  = useStore()

const myUserId   = computed(() => store.state.user.userId)
const myUserName = computed(() => store.state.user.userName || '我')
const otherUserId   = ref(Number(route.query.userId))
const otherUserName = ref(route.query.userName || '对方')

const messages   = ref([])
const inputText  = ref('')
const sending    = ref(false)
const loading    = ref(false)
const msgListRef = ref(null)
const textareaRef = ref(null)

let pollTimer = null

// ── 头像色 ──
const COLORS = ['#8b5cf6','#6d28d9','#2563eb','#0891b2','#059669','#d97706','#dc2626','#db2777']
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
const getInitial  = (name) => name?.charAt(0)?.toUpperCase() || '?'

// ── 时间处理 ──
function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  const hm = d.toTimeString().slice(0, 5)
  if (diffDays === 0) return hm
  if (diffDays === 1) return `昨天 ${hm}`
  if (diffDays < 7)  return `${['日','一','二','三','四','五','六'][d.getDay()]} ${hm}`
  return `${d.getMonth()+1}/${d.getDate()} ${hm}`
}

// 相邻两条消息超过 5 分钟才显示时间分割线
function showTimeDivider(i) {
  if (i === 0) return true
  const prev = new Date(messages.value[i - 1].messageCreatedTime)
  const curr = new Date(messages.value[i].messageCreatedTime)
  return (curr - prev) > 5 * 60 * 1000
}

// ── 滚动到底部 ──
async function scrollToBottom(smooth = false) {
  await nextTick()
  if (msgListRef.value) {
    msgListRef.value.scrollTo({ top: msgListRef.value.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }
}

// ── 拉取对话 ──
async function loadMessages(silent = false) {
  if (!silent) loading.value = true
  try {
    const res = await getConversationApi({
      userId: myUserId.value,
      otherUserId: otherUserId.value
    })
    if (res.code === 0) {
      const prev = messages.value.length
      messages.value = res.data || []
      // 有新消息才滚动
      if (messages.value.length !== prev) scrollToBottom(silent)
    }
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

// ── 发送消息 ──
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || sending.value) return
  sending.value = true
  try {
    const res = await sendDirectMessageApi(myUserId.value, otherUserId.value, text)
    if (res.code === 0) {
      inputText.value = ''
      // 乐观插入，立刻显示
      messages.value.push({
        messageId: Date.now(),
        senderId: myUserId.value,
        senderName: myUserName.value,
        receiverId: otherUserId.value,
        messageContent: text,
        isRead: false,
        messageCreatedTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
      })
      scrollToBottom(true)
      // 重置 textarea 高度
      if (textareaRef.value) { textareaRef.value.style.height = 'auto' }
    }
  } catch (e) { console.error(e) }
  finally { sending.value = false }
}

// ── textarea 自适应高度 ──
function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

onMounted(() => {
  if (myUserId.value === -1) { router.replace('/login'); return }
  loadMessages()
  // 每 4 秒静默轮询新消息
  pollTimer = setInterval(() => loadMessages(true), 4000)
})

onUnmounted(() => {
  clearInterval(pollTimer)
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page {
  display: flex; flex-direction: column;
  height: 100vh; overflow: hidden;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  position: relative;
}
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 400px; height: 400px; background: rgba(167,139,250,0.14); top: -100px; right: -80px; }
.blob2 { width: 350px; height: 350px; background: rgba(196,181,253,0.1);  bottom: 0; left: -60px; }

/* ── 顶部导航 ── */
.nav {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255,255,255,0.88); backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
}
.btn-back {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px; background: rgba(139,92,246,0.08); color: #7c3aed;
  border: 1px solid rgba(139,92,246,0.15); border-radius: 16px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: rgba(139,92,246,0.14); }
.nav-center { display: flex; align-items: center; gap: 8px; position: absolute; left: 50%; transform: translateX(-50%); }
.nav-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #8b5cf6; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.nav-name { font-size: 16px; font-weight: 800; color: #1a1028; }
.nav-spacer { width: 72px; }

/* ── 消息列表 ── */
.msg-list {
  flex: 1; overflow-y: auto; padding: 16px 16px 8px;
  display: flex; flex-direction: column; gap: 2px;
  position: relative; z-index: 1;
}
.load-tip, .empty-tip { text-align: center; padding: 40px 0; font-size: 14px; color: #ccc; }

/* 时间分割线 */
.time-divider {
  text-align: center; font-size: 11px; color: #bbb;
  margin: 10px 0 6px; position: relative;
}
.time-divider::before, .time-divider::after {
  content: ''; position: absolute; top: 50%;
  width: calc(50% - 40px); height: 1px;
  background: rgba(0,0,0,0.06);
}
.time-divider::before { left: 0; }
.time-divider::after  { right: 0; }

/* 气泡行 */
.bubble-row {
  display: flex; align-items: flex-end; gap: 8px;
  margin: 4px 0;
}
.bubble-row.is-self { flex-direction: row-reverse; }

/* 头像 */
.bubble-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  color: white; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 2px;
}

/* 气泡 */
.bubble {
  max-width: 65%; padding: 10px 14px;
  border-radius: 18px; font-size: 14px; line-height: 1.6;
  word-break: break-word; white-space: pre-wrap;
}
.bubble-other {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.06);
  color: #222;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.bubble-self {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 10px rgba(124,58,237,0.25);
}

/* ── 输入框 ── */
.input-bar {
  flex-shrink: 0; position: relative; z-index: 10;
  display: flex; align-items: flex-end; gap: 10px;
  padding: 10px 16px 14px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0,0,0,0.05);
}
.input-box {
  flex: 1; resize: none; overflow: hidden;
  padding: 10px 14px;
  background: rgba(245,243,255,0.7);
  border: 1.5px solid rgba(139,92,246,0.15); border-radius: 20px;
  font-size: 14px; color: #333; font-family: inherit; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  line-height: 1.5; min-height: 42px; max-height: 120px;
}
.input-box:focus {
  border-color: rgba(139,92,246,0.4);
  box-shadow: 0 0 0 3px rgba(139,92,246,0.07);
  background: white;
}
.input-box::placeholder { color: #ccc; }
.send-btn {
  width: 42px; height: 42px; flex-shrink: 0;
  border: none; border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(124,58,237,0.3);
  transition: all 0.2s;
}
.send-btn:hover:not(:disabled) { transform: scale(1.08); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
</style>
