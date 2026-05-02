<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="grid-overlay"></div>

    <!-- 导航 -->
    <nav class="nav">
      <div class="nav-row1">
        <div class="nav-logo">
          <div class="logo-icon">🏆</div>
          <span class="logo-text">COMPETEHUB</span>
        </div>

        <div class="nav-center">
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" v-model="content" placeholder="搜索感兴趣的竞赛…" autocomplete="off" @keydown.enter="search"/>
            <button class="search-btn" @click="search">搜索</button>
          </div>
        </div>

        <div class="nav-right">
          <button class="btn-ai" @click="goToAiSearch">
            <span class="ai-icon">✦</span>
            <span>AI 搜索</span>
          </button>
          <!-- AI 对话入口（导航栏） -->
          <button class="btn-ai-chat" @click="goToAiChat" title="AI 对话助手">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            <span>AI 助手</span>
          </button>
          <div class="avatar-btn" v-if="hasLogin" @click="goToUser()" title="个人主页">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <button class="btn-login" v-if="!hasLogin && !loading" @click="goToLogin()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>登录</span>
          </button>
          <button class="btn-logout" v-if="hasLogin" @click="logout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>退出</span>
          </button>
        </div>
      </div>

      <div class="nav-row2">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" v-model="content" placeholder="搜索竞赛…" autocomplete="off" @keydown.enter="search"/>
          <button class="search-btn" @click="search">搜索</button>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <div class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          发现你的下一场挑战
        </div>
        <h1 class="hero-title">找到最适合你的<br/><span class="hero-highlight">竞赛项目</span></h1>
        <p class="hero-sub">汇聚全国高校竞赛资源，组队参赛，共创荣耀</p>
        <div class="hero-actions">
          <button class="hero-btn-ai" @click="goToAiSearch">
            <span class="ai-icon">✦</span>
            用 AI 智能匹配
          </button>
          <!-- AI 对话入口（Hero 区） -->
          <button class="hero-btn-chat" @click="goToAiChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
            问问 AI 助手
          </button>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-num">{{ total }}</span>
              <span class="stat-label">个竞赛</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <span class="stat-num">实时</span>
              <span class="stat-label">更新</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-deco">
        <div class="deco-ring ring1"></div>
        <div class="deco-ring ring2"></div>
        <div class="deco-emoji e1">🥇</div>
        <div class="deco-emoji e2">💡</div>
        <div class="deco-emoji e3">🚀</div>
        <div class="deco-emoji e4">⭐</div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="content">
      <div class="result-bar" v-if="!loading">
        共 <strong>{{ total }}</strong> 个竞赛
        <span class="result-keyword" v-if="content">· 关键词「{{ content }}」</span>
      </div>

      <div class="loading-wrap" v-if="loading">
        <div class="loading-ring"></div>
        <p>正在加载竞赛数据…</p>
      </div>

      <div class="items-grid" v-else>
        <div
            class="item-card"
            v-for="item in competitions"
            :key="item.competitionId"
            @click="goToDetail(item.competitionId)"
        >
          <div class="card-body">
            <div class="card-top">
              <div class="card-title-text">{{ item.title }}</div>
              <div class="card-creator">
                <div class="creator-avatar">{{ item.userName ? item.userName.charAt(0) : '?' }}</div>
                <span class="creator-name">{{ item.userName }}</span>
              </div>
            </div>

            <div class="card-metas">
              <div class="meta-badge meta-school" v-if="item.schoolRequirements">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                {{ item.schoolRequirements }}
              </div>
              <div class="meta-badge meta-open" v-else>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                不限学校
              </div>
              <div class="meta-badge meta-deadline">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ item.deadline.split(" ")[0] }} 截止
              </div>
            </div>

            <div class="card-tags">
              <span class="tag" v-if="item.tag1">{{ item.tag1 }}</span>
              <span class="tag" v-if="item.tag2">{{ item.tag2 }}</span>
              <span class="tag" v-if="item.tag3">{{ item.tag3 }}</span>
              <span class="tag" v-if="item.tag4">{{ item.tag4 }}</span>
              <span class="tag" v-if="item.tag5">{{ item.tag5 }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="view-btn">
              查看详情
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </div>

        <div class="empty-state" v-if="competitions.length === 0">
          <div class="empty-icon">🔍</div>
          <p class="empty-title">没有找到相关竞赛</p>
          <p class="empty-sub">换个关键词试试看吧～</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="!loading && total > 0">
        <button class="page-btn arrow" @click="prevPage()" :disabled="page === 1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="page-btn" v-for="item in pages" :key="item" @click="goToPage(item)" :class="{ active: item === page }">{{ item }}</button>
        <button class="page-btn arrow" @click="nextPage()" :disabled="page === totalPages || total === 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <span class="page-total">共 {{ totalPages }} 页</span>
      </div>
    </div>

    <!-- 悬浮 AI 助手按钮 -->
    <button class="fab-ai" @click="goToAiChat" title="AI 对话助手">
      <div class="fab-orb">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
      </div>
      <span class="fab-label">AI 助手</span>
    </button>

    <footer class="footer">CompeteHub · 让每一次挑战都有意义 🏆</footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { selectPageApi, userInfoApi } from "@/api/api"
import { removeToken } from "@/utils/auth"

const router = useRouter()
const store = useStore()
const loading = ref(true)
const content = ref("")
const page = ref(1)
const pageSize = ref(10)
const hasLogin = ref(false)
const total = ref(0)
const competitions = ref([])

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const pages = computed(() => {
  const range = 2, start = Math.max(1, page.value - range), end = Math.min(totalPages.value, page.value + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const search = () => { page.value = 1; selectPage() }
const goToPage = (item) => { page.value = item }
const prevPage = () => { if (page.value !== 1) page.value-- }
const nextPage = () => { if (page.value !== totalPages.value) page.value++ }
const goToLogin = () => router.push("/login")
const goToUser = () => router.push("/personal-page")
const goToDetail = (id) => router.push({ path: "/project-detail", query: { id } })
const logout = () => { removeToken(); localStorage.removeItem("local-user"); hasLogin.value = false; router.replace("/home") }
const goToAiSearch = () => { if (!hasLogin.value) { router.push("/login"); return } router.push("/search") }
const goToAiChat = () => { if (!hasLogin.value) { router.push("/login"); return } router.push("/ai-chat") }

onMounted(() => { selectPage(); userInfo() })
window.addEventListener("keydown", (e) => { if (e.key === "Enter") { page.value = 1; selectPage() } })
watch([page, pageSize], () => selectPage())

async function selectPage() {
  try { loading.value = true; const res = await selectPageApi(page.value, pageSize.value, content.value); if (res.code === 0) { total.value = res.data.total; competitions.value = res.data.rows } }
  catch (e) { console.error(e) } finally { loading.value = false }
}
async function userInfo() {
  try {
    const res = await userInfoApi()
    const user = { userId: -1, userName: "", userGender: "", userUniversity: "", userMajor: "", userInformation: "" }
    for (const key in user) { if (key in res.data) user[key] = res.data[key] }
    await store.dispatch("saveUserInfo", user); hasLogin.value = true
  } catch (e) { console.log("未登录", e); localStorage.removeItem("local-user") }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 55%, #fff4f8 100%);
  position: relative; overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 480px; height: 480px; background: rgba(167,139,250,0.16); top: -120px; right: -80px; }
.blob2 { width: 380px; height: 380px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }
.blob3 { width: 300px; height: 300px; background: rgba(251,146,60,0.07); bottom: 30%; right: 10%; }

.grid-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: linear-gradient(rgba(139,92,246,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.035) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* ── 导航 ── */
.nav {
  position: sticky; top: 0; z-index: 50; display: flex; flex-direction: column;
  background: rgba(255,255,255,0.88); backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(139,92,246,0.08);
}
.nav-row1 { display: flex; align-items: center; padding: 0 20px; height: 64px; gap: 10px; position: relative; }
.nav-row2 { display: none; padding: 0 16px 10px; }
.nav-logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.logo-icon { font-size: 20px; }
.logo-text { font-size: 16px; font-weight: 800; color: #1a1028; white-space: nowrap; }
.nav-center { position: absolute; left: 50%; transform: translateX(-50%); width: min(420px, 38%); }
.nav-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.search-wrap {
  display: flex; align-items: center;
  background: rgba(245,243,255,0.8); border: 1.5px solid rgba(139,92,246,0.15);
  border-radius: 26px; padding: 0 6px 0 14px; height: 40px; transition: all 0.2s;
}
.search-wrap:focus-within { border-color: rgba(139,92,246,0.45); background: white; box-shadow: 0 0 0 3px rgba(139,92,246,0.08); }
.search-icon { color: rgba(139,92,246,0.45); flex-shrink: 0; margin-right: 8px; }
.search-wrap input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #333; min-width: 0; font-family: inherit; }
.search-wrap input::placeholder { color: #ccc; }
input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; }
.search-btn { padding: 6px 16px; white-space: nowrap; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border: none; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 3px 10px rgba(109,40,217,0.22); }
.search-btn:hover { transform: translateY(-1px); }

.btn-ai {
  display: flex; align-items: center; gap: 6px; padding: 7px 15px;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6, #6d28d9);
  background-size: 200% 200%; animation: aiGradient 4s ease infinite;
  color: white; border: none; border-radius: 20px;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.25s;
  box-shadow: 0 4px 18px rgba(139,92,246,0.35); white-space: nowrap;
}
.btn-ai:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(138,72,236,0.4); }
@keyframes aiGradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
.ai-icon { font-size: 12px; animation: aiSpin 3s linear infinite; }
@keyframes aiSpin { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(180deg)} }

/* AI 对话按钮（导航） */
.btn-ai-chat {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px;
  background: rgba(124,58,237,0.08); border: 1.5px solid rgba(124,58,237,0.2);
  color: #7c3aed; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.btn-ai-chat:hover { background: rgba(124,58,237,0.14); transform: translateY(-1px); }

.avatar-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(139,92,246,0.08); border: 1.5px solid rgba(139,92,246,0.15); display: flex; align-items: center; justify-content: center; color: #7c3aed; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.avatar-btn:hover { transform: scale(1.08); background: rgba(139,92,246,0.14); }
.btn-login { display: flex; align-items: center; gap: 5px; padding: 7px 16px; white-space: nowrap; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border: none; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 3px 12px rgba(109,40,217,0.25); }
.btn-login:hover { transform: translateY(-1px); }
.btn-logout { display: flex; align-items: center; gap: 5px; padding: 7px 14px; white-space: nowrap; background: rgba(239,68,68,0.07); color: #dc2626; border: 1px solid rgba(239,68,68,0.15); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-logout:hover { background: rgba(239,68,68,0.12); }

@media (max-width: 1100px) { .nav-center { width: min(340px, 36%); } }
@media (max-width: 900px) { .nav-center { width: min(260px, 32%); } .btn-ai-chat span { display: none; } .btn-ai-chat { padding: 7px 10px; } }
@media (max-width: 780px) { .logo-text { display: none; } }
@media (max-width: 640px) { .nav-center { display: none; } .nav-row2 { display: flex; } .nav-row2 .search-wrap { flex: 1; } }
@media (max-width: 450px) { .btn-ai span:last-child { display: none; } .btn-ai { padding: 7px 10px; } .btn-login span, .btn-logout span { display: none; } }

/* ── Hero ── */
.hero { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; max-width: 1100px; margin: 0 auto; padding: 44px 28px 30px; gap: 20px; }
.hero-content { flex: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 20px; font-size: 13px; font-weight: 600; color: #ea580c; margin-bottom: 16px; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #f97316; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

.hero-title { font-size: 38px; font-weight: 900; color: #1a1028; line-height: 1.2; letter-spacing: -1px; margin-bottom: 12px; }
.hero-highlight { background: linear-gradient(135deg, #58468e, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-sub { font-size: 15px; color: #7c6f8a; margin-bottom: 24px; }

.hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.hero-btn-ai {
  display: flex; align-items: center; gap: 8px; padding: 12px 24px;
  background: linear-gradient(135deg, #ac96ea, #8b5cf6, #6d28d9);
  background-size: 200% 200%; animation: aiGradient 4s ease infinite;
  color: white; border: none; border-radius: 14px;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s;
  box-shadow: 0 6px 24px rgba(139,92,246,0.35);
}
.hero-btn-ai:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 10px 32px rgba(139,92,246,0.45); }

/* AI 对话按钮（Hero） */
.hero-btn-chat {
  display: flex; align-items: center; gap: 8px; padding: 12px 22px;
  background: rgba(124,58,237,0.08); border: 1.5px solid rgba(124,58,237,0.22);
  color: #7c3aed; border-radius: 14px;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s;
}
.hero-btn-chat:hover { background: rgba(124,58,237,0.15); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.15); }

.hero-stats { display: flex; align-items: center; gap: 16px; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 20px; font-weight: 800; color: #1a1028; }
.stat-label { font-size: 11px; color: #9a8faa; }
.stat-div { width: 1px; height: 28px; background: rgba(139,92,246,0.15); }

.hero-deco { position: relative; width: 220px; height: 170px; flex-shrink: 0; }
.deco-ring { position: absolute; border-radius: 50%; border-style: solid; border-color: transparent; }
.ring1 { width: 150px; height: 150px; top: 10px; left: 30px; border-width: 2px; border-top-color: rgba(139,92,246,0.3); border-right-color: rgba(236,72,153,0.2); animation: ringRot 8s linear infinite; }
.ring2 { width: 100px; height: 100px; top: 35px; left: 55px; border-width: 2px; border-bottom-color: rgba(249,115,22,0.25); border-left-color: rgba(139,92,246,0.2); animation: ringRot 5s linear infinite reverse; }
@keyframes ringRot { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
.deco-emoji { position: absolute; font-size: 22px; animation: floatUp 3s ease-in-out infinite; }
.e1{top:0;left:75px;animation-delay:0s} .e2{top:48px;left:150px;animation-delay:.8s}
.e3{top:95px;left:80px;animation-delay:1.6s} .e4{top:38px;left:16px;animation-delay:.4s}
@keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

@media (max-width: 680px) { .hero { flex-direction: column; text-align: center; padding: 32px 18px 18px; } .hero-content { display: flex; flex-direction: column; align-items: center; } .hero-deco { display: none; } }

/* ── 主内容 ── */
.content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 20px 100px; }
.result-bar { margin-bottom: 18px; padding: 8px 4px; font-size: 13px; color: #999; }
.result-bar strong { color: #8b5cf6; font-weight: 700; }
.result-keyword { color: #c4b5fd; margin-left: 4px; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: rgba(139,92,246,0.4); gap: 14px; font-size: 14px; }
.loading-ring { width: 40px; height: 40px; border-radius: 50%; border: 3px solid rgba(139,92,246,0.1); border-top-color: #8b5cf6; animation: ringRot 0.8s linear infinite; }

.items-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (max-width: 760px) { .items-grid { grid-template-columns: 1fr; } }

.item-card {
  position: relative; overflow: hidden; display: flex; flex-direction: column;
  border-radius: 20px; cursor: pointer;
  background: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.95);
  backdrop-filter: blur(14px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06), 0 1px 4px rgba(0,0,0,0.03);
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
}
.item-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(139,92,246,0.13); }
.item-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #c4b5fd, #a78bfa, #8b5cf6); border-radius: 20px 20px 0 0; }

.card-body { padding: 20px 20px 12px; flex: 1; display: flex; flex-direction: column; gap: 12px; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.card-title-text { font-size: 16px; font-weight: 700; color: #1a1028; line-height: 1.45; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-creator { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.creator-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #6d28d9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(109,40,217,0.2); }
.creator-name { font-size: 11px; color: #bbb; max-width: 48px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.card-metas { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-badge { display: flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 9px; font-size: 11px; font-weight: 600; }
.meta-school { background: rgba(245,158,11,0.09); color: #b45309; }
.meta-open { background: rgba(16,185,129,0.09); color: #047857; }
.meta-deadline { background: rgba(139,92,246,0.08); color: #7c3aed; border: 1px solid rgba(139,92,246,0.12); }

.card-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tag { padding: 3px 10px; background: rgba(139,92,246,0.07); color: #7c3aed; border: 1px solid rgba(139,92,246,0.13); border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; max-width: 90px; overflow: hidden; text-overflow: ellipsis; }
.card-footer { padding: 10px 20px 14px; display: flex; justify-content: flex-end; border-top: 1px solid rgba(139,92,246,0.07); }
.view-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #a78bfa; transition: all 0.2s; }
.item-card:hover .view-btn { color: #8b5cf6; gap: 8px; }

.empty-state { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 10px; }
.empty-icon { font-size: 52px; margin-bottom: 4px; }
.empty-title { font-size: 18px; font-weight: 700; color: #555; }
.empty-sub { font-size: 14px; color: #bbb; }

/* ── 分页 ── */
.pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding-top: 36px; flex-wrap: wrap; }
.page-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid rgba(139,92,246,0.12); background: rgba(255,255,255,0.8); font-size: 13px; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled):not(.active) { border-color: rgba(139,92,246,0.3); color: #7c3aed; background: rgba(139,92,246,0.05); transform: translateY(-1px); }
.page-btn.active { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(109,40,217,0.28); }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-btn.arrow { color: #c4b5fd; }
.page-total { font-size: 12px; color: #c4b5fd; margin-left: 6px; }

/* ── 悬浮 AI 按钮 ── */
.fab-ai {
  position: fixed; bottom: 28px; right: 24px; z-index: 100;
  display: flex; align-items: center; gap: 8px;
  padding: 0 18px 0 0; height: 52px;
  background: linear-gradient(135deg, #a78bfa, #7c3aed, #5b21b6);
  border: none; border-radius: 999px; cursor: pointer;
  box-shadow: 0 8px 30px rgba(124,58,237,0.45);
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  animation: fabBreath 3s ease-in-out infinite;
}
.fab-ai:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 14px 40px rgba(124,58,237,0.55); }
@keyframes fabBreath { 0%,100%{box-shadow:0 8px 30px rgba(124,58,237,0.45)} 50%{box-shadow:0 12px 40px rgba(124,58,237,0.6)} }
.fab-orb {
  width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.15);
}
.fab-label { font-size: 14px; font-weight: 700; color: white; white-space: nowrap; }

/* ── Footer ── */
.footer { position: relative; z-index: 1; text-align: center; padding: 20px; font-size: 13px; color: #c4b5fd; border-top: 1px solid rgba(139,92,246,0.07); }
</style>