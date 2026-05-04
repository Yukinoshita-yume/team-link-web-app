<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="grid-overlay"></div>

    <!-- 顶部导航 -->
    <nav class="nav">
      <button class="btn-back" @click="router.back()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        返回
      </button>
      <div class="nav-center">
        <div class="nav-ai-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
        </div>
        <div class="nav-info">
          <span class="nav-title">AI 竞赛助手</span>
          <span class="nav-online"><span class="online-dot"></span>在线</span>
        </div>
      </div>
      <button class="btn-new" @click="startNewChat" v-if="phase === 'chat'" title="新对话">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新对话
      </button>
      <div style="width:80px" v-else></div>
    </nav>

    <!-- ══════════════ 初始页 ══════════════ -->
    <transition name="phase">
      <div class="welcome-screen" v-if="phase === 'welcome'" key="welcome">
        <div class="welcome-hero">
          <div class="hero-orb">
            <div class="orb-inner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            </div>
            <div class="orb-ring ring-a"></div>
            <div class="orb-ring ring-b"></div>
            <div class="orb-ring ring-c"></div>
          </div>
          <h1 class="welcome-title">你好，我是 AI 竞赛助手</h1>
          <p class="welcome-desc">基于通义千问，专为 CompeteHub 打造<br/>为你提供竞赛推荐、组队策略、申请指导</p>
        </div>

        <div class="feature-grid">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <div class="feature-icon" :style="{ background: f.bg }">{{ f.icon }}</div>
            <div class="feature-text">
              <span class="feature-title">{{ f.title }}</span>
              <span class="feature-desc">{{ f.desc }}</span>
            </div>
          </div>
        </div>

        <div class="quick-section">
          <p class="quick-label">快速开始 · 点击提问</p>
          <div class="quick-grid">
            <button class="quick-card" v-for="q in quickQuestions" :key="q.text" @click="startWithQuestion(q.text)">
              <span class="quick-emoji">{{ q.emoji }}</span>
              <span class="quick-text">{{ q.text }}</span>
              <svg class="quick-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div class="welcome-input-wrap">
          <div class="input-box-wrap" :class="{ focused: inputFocused }">
            <textarea
                ref="inputRef"
                class="the-input"
                v-model="inputText"
                placeholder="或者直接输入你的问题…"
                rows="1"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
                @keydown.enter.exact.prevent="handleSend"
                @input="autoResize"
            ></textarea>
            <button class="send-btn" :class="{ active: inputText.trim() }" :disabled="!inputText.trim()" @click="handleSend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <p class="input-tip">Enter 发送 · Shift+Enter 换行</p>
        </div>
      </div>
    </transition>

    <!-- ══════════════ 对话页 ══════════════ -->
    <transition name="phase">
      <div class="chat-screen" v-if="phase === 'chat'" key="chat">
        <div class="msg-list" ref="msgListRef">
          <div class="chat-start-tip">
            <span>对话开始 · {{ sessionStartTime }}</span>
          </div>

          <template v-for="(msg, i) in messages" :key="i">
            <!-- AI 消息：已完成，渲染 Markdown -->
            <div class="msg-row msg-ai" v-if="msg.role === 'assistant'">
              <div class="msg-avatar ai-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
              </div>
              <div class="msg-content">
                <div class="bubble bubble-ai" v-html="renderMarkdown(msg.content)"></div>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>

            <!-- 用户消息 -->
            <div class="msg-row msg-user" v-else>
              <div class="msg-content msg-content-right">
                <div class="bubble bubble-user">{{ msg.content }}</div>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </template>

          <!-- 打字等待动画 -->
          <div class="msg-row msg-ai" v-if="aiTyping && !streamingText">
            <div class="msg-avatar ai-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            </div>
            <div class="bubble bubble-ai typing-bubble">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>

          <!--
            ★ 核心修复：流式阶段用纯文本展示，完全不做 Markdown 解析
            用 <pre> 保留换行，white-space:pre-wrap 自动折行，彻底消灭逐字换行 bug
          -->
          <div class="msg-row msg-ai" v-if="aiTyping && streamingText">
            <div class="msg-avatar ai-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            </div>
            <div class="msg-content">
              <div class="bubble bubble-ai">
                <pre class="streaming-pre">{{ streamingText }}<span class="stream-cursor">▋</span></pre>
              </div>
            </div>
          </div>

          <div class="error-tip" v-if="errorMsg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMsg }}
          </div>
        </div>

        <!-- 底部输入区 -->
        <div class="chat-input-area">
          <div class="follow-ups" v-if="messages.length > 0 && messages.length < 4 && !aiTyping">
            <button class="follow-btn" v-for="f in followUps" :key="f" @click="startWithQuestion(f)">{{ f }}</button>
          </div>
          <div class="input-row">
            <div class="input-box-wrap" :class="{ focused: inputFocused, disabled: aiTyping }">
              <div class="input-left">
                <div class="input-ai-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
                </div>
              </div>
              <textarea
                  ref="chatInputRef"
                  class="the-input"
                  v-model="inputText"
                  :placeholder="aiTyping ? 'AI 正在思考中…' : '继续提问，或按 Enter 发送…'"
                  :disabled="aiTyping"
                  rows="1"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                  @keydown.enter.exact.prevent="handleSend"
                  @input="autoResize"
              ></textarea>
              <div class="input-actions">
                <span class="input-char-hint" v-if="inputText.length > 0 && !aiTyping">{{ inputText.length }}</span>
                <button
                    class="send-btn"
                    :class="{ active: inputText.trim() && !aiTyping }"
                    :disabled="!inputText.trim() || aiTyping"
                    @click="handleSend"
                    title="发送 (Enter)"
                >
                  <svg v-if="!aiTyping" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
                </button>
              </div>
            </div>
          </div>
          <p class="input-tip">
            <kbd>Enter</kbd> 发送 &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> 换行 &nbsp;·&nbsp; 本次对话仅保存在当前页面
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { aiChatApi } from '@/api/api'

const router = useRouter()
const store = useStore()

const phase = ref('welcome')
const messages = ref([])
const inputText = ref('')
const inputFocused = ref(false)
const aiTyping = ref(false)
const streamingText = ref('')
const errorMsg = ref('')
const msgListRef = ref(null)
const inputRef = ref(null)
const chatInputRef = ref(null)
const sessionStartTime = ref('')

const userInitial = computed(() => {
  const name = store.state.user?.userName || store.state.userInfo?.userName || '我'
  return name.charAt(0).toUpperCase()
})

const features = [
  { icon: '🏆', title: '竞赛推荐', desc: '根据你的专业和技能精准匹配竞赛', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
  { icon: '👥', title: '组队策略', desc: '帮你找到互补的队友，提升胜率', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
  { icon: '📝', title: '申请指导', desc: '撰写高质量申请书和自我介绍', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
  { icon: '🚀', title: '技能规划', desc: '制定竞赛备战路线和学习计划', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
]

const quickQuestions = [
  { emoji: '🔍', text: '根据我的专业推荐适合的竞赛' },
  { emoji: '👥', text: '如何快速组建一支优秀的队伍？' },
  { emoji: '📝', text: '帮我写一份竞赛报名申请书模板' },
  { emoji: '📅', text: '竞赛备战应该如何安排时间？' },
  { emoji: '💡', text: '参加竞赛有哪些新手必知技巧？' },
  { emoji: '🎯', text: '如何评估自己适合哪类竞赛？' },
]

const followUps = ['继续追问', '换个角度', '给我更多细节', '还有其他建议吗？']

const getNowTime = () => {
  const d = new Date()
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const startNewChat = () => {
  messages.value = []
  inputText.value = ''
  errorMsg.value = ''
  streamingText.value = ''
  phase.value = 'welcome'
}

const startWithQuestion = (text) => {
  inputText.value = text
  handleSend()
}

// ★ 流式输出：只更新纯文本，不做任何 HTML 渲染
const simulateStreaming = async (fullText) => {
  streamingText.value = ''
  const chunkSize = 8
  let i = 0
  return new Promise((resolve) => {
    const tick = () => {
      if (i >= fullText.length) { resolve(); return }
      streamingText.value = fullText.slice(0, i + chunkSize)
      i += chunkSize
      scrollToBottom()
      const ch = fullText[i] || ''
      const delay = /[。！？\n]/.test(ch) ? 50 : 16
      setTimeout(tick, delay)
    }
    tick()
  })
}

const callAiWithRetry = async (history, maxRetries = 2) => {
  let lastErr
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await aiChatApi(history)
      if (res.code === 0 && res.data) return res
      throw new Error(res.message || '响应异常')
    } catch (e) {
      lastErr = e
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw lastErr
}

const handleSend = async () => {
  const content = inputText.value.trim()
  if (!content || aiTyping.value) return

  if (phase.value === 'welcome') {
    sessionStartTime.value = getNowTime()
    phase.value = 'chat'
  }

  messages.value.push({ role: 'user', content, time: getNowTime() })
  inputText.value = ''
  resetInputHeight()
  errorMsg.value = ''
  streamingText.value = ''
  await scrollToBottom()
  aiTyping.value = true

  try {
    const history = messages.value.map(m => ({ role: m.role, content: m.content }))
    const res = await callAiWithRetry(history, 2)
    // 流式阶段：纯文本展示
    await simulateStreaming(res.data)
    streamingText.value = ''
    // 流式结束：存入 messages，此时 renderMarkdown 才介入渲染
    messages.value.push({ role: 'assistant', content: res.data, time: getNowTime() })
  } catch (e) {
    streamingText.value = ''
    errorMsg.value = '网络请求失败，已自动重试，请稍后再试。'
    messages.value.push({ role: 'assistant', content: '抱歉，我遇到了一点问题，请检查网络连接后重试。', time: getNowTime() })
  } finally {
    aiTyping.value = false
    await scrollToBottom()
    await nextTick()
    chatInputRef.value?.focus()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (msgListRef.value) {
    msgListRef.value.scrollTo({ top: msgListRef.value.scrollHeight, behavior: 'smooth' })
  }
}

const autoResize = (e) => {
  const el = e?.target || inputRef.value || chatInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 130) + 'px'
}

const resetInputHeight = () => {
  const el = chatInputRef.value || inputRef.value
  if (el) el.style.height = 'auto'
}

/**
 * ★ Markdown 渲染（仅用于已完成的消息，流式阶段完全不调用）
 * 支持：# 标题、**粗体**、`代码`、有序/无序列表、段落
 */
const renderMarkdown = (text) => {
  if (!text) return ''

  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 行内格式：粗体、行内代码
  const inline = (s) => escape(s)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')

  const lines = text.split('\n')
  const out = []
  let inOl = false, inUl = false

  const closeList = () => {
    if (inOl) { out.push('</ol>'); inOl = false }
    if (inUl) { out.push('</ul>'); inUl = false }
  }

  for (const raw of lines) {
    const line = raw.trim()

    // 标题 # / ## / ###
    const hm = line.match(/^(#{1,3})\s+(.+)/)
    if (hm) {
      closeList()
      const lvl = hm[1].length
      const tag = ['h3','h4','h5'][lvl - 1]
      out.push(`<${tag} class="md-h md-h${lvl}">${inline(hm[2])}</${tag}>`)
      continue
    }

    // 有序列表 1. xxx
    const om = line.match(/^(\d+)\.\s+(.+)/)
    if (om) {
      if (!inOl) { closeList(); out.push('<ol class="md-ol">'); inOl = true }
      out.push(`<li>${inline(om[2])}</li>`)
      continue
    }

    // 无序列表 - xxx 或 * xxx
    const um = line.match(/^[-*]\s+(.+)/)
    if (um) {
      if (!inUl) { closeList(); out.push('<ul class="md-ul">'); inUl = true }
      out.push(`<li>${inline(um[1])}</li>`)
      continue
    }

    // 空行
    if (!line) {
      closeList()
      if (out.length && out[out.length - 1] !== '<div class="md-gap"></div>') {
        out.push('<div class="md-gap"></div>')
      }
      continue
    }

    // 普通段落
    closeList()
    out.push(`<p class="md-p">${inline(line)}</p>`)
  }

  closeList()
  return out.join('')
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 55%, #fff4f8 100%);
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', sans-serif;
}

/* ── 背景装饰 ── */
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.18); top: -150px; right: -100px; }
.blob2 { width: 420px; height: 420px; background: rgba(196,181,253,0.13); bottom: -60px; left: -80px; }
.blob3 { width: 280px; height: 280px; background: rgba(251,146,60,0.06); top: 40%; right: 5%; }
.grid-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px);
  background-size: 44px 44px;
}

/* ── 导航 ── */
.nav {
  position: relative; z-index: 10; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 60px;
  background: rgba(255,255,255,0.88); backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139,92,246,0.1);
}
.btn-back {
  display: flex; align-items: center; gap: 5px; padding: 7px 13px;
  border-radius: 20px; border: 1.5px solid rgba(139,92,246,0.15);
  background: rgba(139,92,246,0.06); color: #7c3aed;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: rgba(139,92,246,0.13); }
.nav-center { display: flex; align-items: center; gap: 10px; }
.nav-ai-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(124,58,237,0.35);
}
.nav-info { display: flex; flex-direction: column; }
.nav-title { font-size: 15px; font-weight: 800; color: #1a1028; line-height: 1.2; }
.nav-online { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #10b981; font-weight: 500; }
.online-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.7)} }
.btn-new {
  display: flex; align-items: center; gap: 5px; padding: 7px 13px;
  border-radius: 20px; border: 1.5px solid rgba(139,92,246,0.2);
  background: rgba(139,92,246,0.07); color: #7c3aed;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-new:hover { background: rgba(139,92,246,0.14); transform: translateY(-1px); }

/* ── 页面过渡 ── */
.phase-enter-active { transition: all 0.45s cubic-bezier(0.22,1,0.36,1); }
.phase-leave-active { transition: all 0.3s ease; position: absolute; inset: 60px 0 0; }
.phase-enter-from { opacity: 0; transform: translateY(24px); }
.phase-leave-to   { opacity: 0; transform: translateY(-16px); }

/* ═══════════ 初始页 ═══════════ */
.welcome-screen {
  flex: 1; overflow-y: auto; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 20px 24px; gap: 28px;
}
.welcome-screen::-webkit-scrollbar { width: 0; }
.welcome-hero { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.hero-orb { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.orb-inner {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #7c3aed, #5b21b6);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 40px rgba(124,58,237,0.45);
  animation: orbFloat 3.5s ease-in-out infinite;
  z-index: 1; position: relative;
}
@keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
.orb-ring { position: absolute; border-radius: 50%; border: 1.5px solid transparent; border-top-color: rgba(167,139,250,0.5); }
.ring-a { width: 88px; height: 88px; animation: spin 4s linear infinite; }
.ring-b { width: 100px; height: 100px; border-top-color: rgba(236,72,153,0.25); animation: spin 6s linear infinite reverse; }
.ring-c { width: 112px; height: 112px; border-top-color: rgba(251,146,60,0.2); animation: spin 8s linear infinite; }
@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
.welcome-title { font-size: 26px; font-weight: 900; color: #1a1028; text-align: center; letter-spacing: -0.5px; }
.welcome-desc { font-size: 14px; color: #7c6f8a; text-align: center; line-height: 1.7; }

.feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; max-width: 520px; }
.feature-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.95);
  border-radius: 16px; backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(100,80,200,0.06);
}
.feature-icon { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.feature-text { display: flex; flex-direction: column; gap: 2px; }
.feature-title { font-size: 13px; font-weight: 700; color: #1a1028; }
.feature-desc { font-size: 11px; color: #9ca3af; line-height: 1.4; }

.quick-section { width: 100%; max-width: 520px; }
.quick-label { font-size: 11px; font-weight: 700; color: #c4b5fd; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.quick-card {
  display: flex; align-items: center; gap: 8px; padding: 12px 14px;
  background: rgba(255,255,255,0.75); border: 1.5px solid rgba(139,92,246,0.12);
  border-radius: 14px; cursor: pointer; text-align: left;
  transition: all 0.2s; box-shadow: 0 1px 6px rgba(139,92,246,0.06);
}
.quick-card:hover { background: rgba(139,92,246,0.05); border-color: rgba(139,92,246,0.3); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(139,92,246,0.12); }
.quick-emoji { font-size: 17px; flex-shrink: 0; }
.quick-text { flex: 1; font-size: 13px; font-weight: 500; color: #374151; line-height: 1.4; }
.quick-arrow { color: #d4c4fb; flex-shrink: 0; }
.quick-card:hover .quick-arrow { color: #8b5cf6; }
.welcome-input-wrap { width: 100%; max-width: 520px; }

/* ═══════════ 对话页 ═══════════ */
.chat-screen { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 1; }
.msg-list {
  flex: 1; overflow-y: auto; padding: 20px 16px;
  display: flex; flex-direction: column; gap: 18px;
  scroll-behavior: smooth;
}
.msg-list::-webkit-scrollbar { width: 4px; }
.msg-list::-webkit-scrollbar-track { background: transparent; }
.msg-list::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.15); border-radius: 2px; }

.chat-start-tip {
  text-align: center; font-size: 11px; color: #d4c4fb;
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.chat-start-tip::before, .chat-start-tip::after { content: ''; flex: 1; height: 1px; background: rgba(196,181,253,0.25); }

.msg-row { display: flex; gap: 10px; align-items: flex-start; max-width: 760px; width: 100%; }
.msg-ai  { align-self: flex-start; }
.msg-user { align-self: flex-end; flex-direction: row-reverse; margin-left: auto; }

.msg-avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.ai-avatar { background: linear-gradient(135deg, #a78bfa, #7c3aed); box-shadow: 0 4px 12px rgba(124,58,237,0.3); }

.msg-content { display: flex; flex-direction: column; gap: 4px; max-width: calc(100% - 44px); }
.msg-content-right { align-items: flex-end; }

.bubble { padding: 13px 16px; border-radius: 18px; font-size: 14px; line-height: 1.75; word-break: break-word; }
.bubble-ai {
  background: rgba(255,255,255,0.92); color: #1a1028;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.8);
}
.bubble-user {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border-bottom-right-radius: 5px;
  box-shadow: 0 4px 18px rgba(109,40,217,0.3);
}

/* ★ 流式纯文本区域：pre + white-space:pre-wrap 保证正常折行 */
.streaming-pre {
  margin: 0;
  padding: 0;
  font-family: inherit;       /* 不使用等宽字体，保持正文风格 */
  font-size: 14px;
  line-height: 1.75;
  color: #1a1028;
  white-space: pre-wrap;      /* 保留换行，超长自动折行 */
  word-break: break-word;
  overflow-wrap: break-word;
  background: transparent;
  border: none;
}

/* 流式光标 */
.stream-cursor {
  display: inline-block;
  color: #8b5cf6;
  animation: cursorBlink 0.75s step-start infinite;
  margin-left: 1px;
  font-size: 13px;
  vertical-align: baseline;
}
@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Markdown 渲染样式（仅已完成消息） ── */
.bubble-ai :deep(.md-h) { font-weight: 700; color: #3b0fa0; line-height: 1.4; margin: 6px 0 2px; }
.bubble-ai :deep(.md-h3) { font-size: 15px; }
.bubble-ai :deep(.md-h4) { font-size: 14px; }
.bubble-ai :deep(.md-h5) { font-size: 13px; color: #5b21b6; }
.bubble-ai :deep(.md-p)  { margin: 0; line-height: 1.75; }
.bubble-ai :deep(.md-gap) { height: 6px; }
.bubble-ai :deep(strong) { font-weight: 700; color: #5b21b6; }
.bubble-ai :deep(code) {
  background: rgba(139,92,246,0.08); padding: 1px 6px; border-radius: 5px;
  font-family: 'JetBrains Mono','SF Mono',monospace; font-size: 13px; color: #7c3aed;
}

/* 有序列表 —— 用原生 padding + list-style，彻底避免 grid 宽度计算问题 */
.bubble-ai :deep(.md-ol) {
  list-style: decimal;
  margin: 6px 0;
  padding-left: 1.6em;
  display: block;
}
.bubble-ai :deep(.md-ol li) {
  display: list-item;
  line-height: 1.75;
  color: #374151;
  word-break: break-word;
  padding-left: 4px;
}
.bubble-ai :deep(.md-ol li::marker) { color: #8b5cf6; font-weight: 700; }

/* 无序列表 —— 同上，原生 disc + padding */
.bubble-ai :deep(.md-ul) {
  list-style: disc;
  margin: 6px 0;
  padding-left: 1.4em;
  display: block;
}
.bubble-ai :deep(.md-ul li) {
  display: list-item;
  line-height: 1.75;
  color: #374151;
  word-break: break-word;
}
.bubble-ai :deep(.md-ul li::marker) { color: #8b5cf6; }

.msg-time { font-size: 10px; color: #d1d5db; padding: 0 2px; }

/* 打字动画 */
.typing-bubble { display: flex; align-items: center; gap: 5px; padding: 16px 20px; min-width: 68px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(139,92,246,0.35); animation: dotBounce 1.3s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: 0.22s; }
.dot:nth-child(3) { animation-delay: 0.44s; }
@keyframes dotBounce { 0%,70%,100%{transform:translateY(0);opacity:0.35} 35%{transform:translateY(-7px);opacity:1} }

.error-tip {
  display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-radius: 10px;
  background: rgba(254,242,242,0.8); color: #dc2626; font-size: 12px;
  border: 1px solid rgba(239,68,68,0.15); align-self: center;
}

/* ═══════════ 底部输入区 ═══════════ */
.chat-input-area {
  flex-shrink: 0; padding: 10px 16px 14px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(24px);
  border-top: 1px solid rgba(139,92,246,0.08); z-index: 2;
}
.follow-ups { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.follow-btn {
  padding: 5px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;
  background: rgba(139,92,246,0.07); border: 1.5px solid rgba(139,92,246,0.15);
  color: #7c3aed; cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.follow-btn:hover { background: rgba(139,92,246,0.14); transform: translateY(-1px); }

.input-row { display: flex; gap: 10px; }
.input-box-wrap {
  flex: 1; display: flex; align-items: center; gap: 0;
  padding: 6px 6px 6px 0; background: #fff;
  border: 1.5px solid rgba(139,92,246,0.18); border-radius: 16px;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 2px 12px rgba(139,92,246,0.07), 0 1px 3px rgba(0,0,0,0.04);
  position: relative; min-height: 46px;
}
.input-box-wrap.focused { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 0 3px rgba(139,92,246,0.1), 0 4px 20px rgba(139,92,246,0.13); }
.input-box-wrap.disabled { background: rgba(249,246,255,0.8); border-color: rgba(139,92,246,0.1); }

.input-left { display: flex; align-items: center; padding: 0 8px 0 12px; flex-shrink: 0; align-self: center; }
.input-ai-icon {
  width: 24px; height: 24px; border-radius: 8px;
  background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(124,58,237,0.12));
  border: 1px solid rgba(139,92,246,0.15);
  display: flex; align-items: center; justify-content: center; color: #8b5cf6; flex-shrink: 0;
}
.the-input {
  flex: 1; border: none; outline: none; resize: none;
  font-size: 14px; color: #1a1028; background: transparent;
  font-family: inherit; line-height: 1.5;
  min-height: 22px; max-height: 130px; padding: 0; align-self: center;
}
.the-input::placeholder { color: #c4b5fd; }
.the-input:disabled { cursor: not-allowed; color: #a78bfa; }

.input-actions { display: flex; align-items: center; gap: 6px; padding: 0; flex-shrink: 0; align-self: center; }
.input-char-hint { font-size: 10px; color: #ddd6fe; min-width: 20px; text-align: center; }

.send-btn {
  width: 34px; height: 34px; border-radius: 11px; flex-shrink: 0;
  border: none; display: flex; align-items: center; justify-content: center;
  background: rgba(139,92,246,0.09); color: rgba(167,139,250,0.5);
  cursor: not-allowed; transition: all 0.2s;
}
.send-btn.active { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; cursor: pointer; box-shadow: 0 4px 16px rgba(109,40,217,0.32); }
.send-btn.active:hover { transform: scale(1.08) translateY(-1px); box-shadow: 0 6px 22px rgba(109,40,217,0.42); }
.send-btn.active:active { transform: scale(0.96); }

.input-tip {
  font-size: 11px; color: #e2d9f3; text-align: center; margin-top: 8px;
  display: flex; align-items: center; justify-content: center; gap: 2px;
}
kbd {
  display: inline-flex; align-items: center; padding: 1px 5px; border-radius: 4px;
  font-family: inherit; font-size: 10px;
  background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.15); color: #a78bfa;
}

@media (max-width: 520px) {
  .feature-grid, .quick-grid { grid-template-columns: 1fr; }
  .welcome-title { font-size: 22px; }
}
</style>