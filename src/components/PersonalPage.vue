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

      <!-- 竞赛信息 -->
      <div class="competitions-grid">
        <!-- 我报名的 -->
        <div class="card">
  <div class="card-title">
    <div class="title-bar bar-amber"></div>
    我报名的项目
    <button class="msg-btn" @click="goToMessagePage">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      消息
    </button>
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
            <div class="empty-list" v-if="appliedProjects.length === 0">暂无报名项目</div>
          </div>
        </div>

        <!-- 我创办的 -->
        <div class="card">
          <div class="card-title">
            <div class="title-bar"></div>
            我创办的项目
            <!-- ✅ 保留「创办」按钮，❌ 已移除「消息」按钮 -->
            <div class="title-actions">
              <button class="msg-btn btn-green" @click="handleCreateProject">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                创办
              </button>
            </div>
          </div>
          <div class="project-list">
            <!-- ✅ 每个竞赛项新增「管理」「审核」按钮，替代原来的整行点击跳转 -->
            <div
              class="project-item"
              v-for="p in createdProjects"
              :key="p.competitionId"
            >
              <span class="project-name">{{ p.title }}</span>
              <!-- ✅ 新增：竞赛操作按钮组 -->
              <div class="item-actions">
                <button class="item-btn btn-manage" @click.stop="toCompetitionDetail(p.competitionId)">
                  管理
                </button>
                <button class="item-btn btn-review" @click.stop="toReview(p.competitionId)">
                  审核
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

        <div class="tags-row">
          <div
            class="tag"
            v-for="tag in competenceCard.skillTags"
            :key="tag"
          >
            {{ tag }}
          </div>
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

    <!-- 保存成功 Toast -->
    <transition name="toast">
      <div class="toast" v-if="saveToast">
        <span>✅</span> 保存成功
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  updateApi,
  allAppliedCompetitionsApi,
  allCreatedCompetitionsApi,
  getCompetenceCardApi,
} from '@/api/api'
import router from '@/router'

const store = useStore()
const localUser = computed(() => store.state.user)
const user = ref({ ...localUser.value })
const saving = ref(false)
const saveToast = ref(false)
const appliedProjects = ref([])
const createdProjects = ref([])

const competenceCard = ref({
  skillTags: [],
  radarScores: {
    technicalDepth: 0,
    competitionExperience: 0,
    teamwork: 0,
    learningAbility: 0,
    timeCommitment: 0
  },
  totalScore: null,
  expertiseAreas: [],
  availabilityHeatmap: {},
  llmSnapshot: ''
})
const loadingProfile = ref(false)

const radarItems = computed(() => {
  const r = competenceCard.value.radarScores || {}
  return [
    { key: 'technicalDepth', label: '技术深度', value: r.technicalDepth },
    { key: 'competitionExperience', label: '竞赛经验', value: r.competitionExperience },
    { key: 'teamwork', label: '团队协作', value: r.teamwork },
    { key: 'learningAbility', label: '学习能力', value: r.learningAbility },
    { key: 'timeCommitment', label: '时间投入', value: r.timeCommitment }
  ]
})

const saveUserInfo = async () => {
  saving.value = true
  try {
    const res = await updateApi(user.value)
    if (res.code === 0) { store.dispatch('saveUserInfo', user.value); saveToast.value = true; setTimeout(() => saveToast.value = false, 2500) }
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}
const handleLogout = () => router.push('/home')
const handleCreateProject = () => router.push('/create-project')
const toCompetitionDetail = (id) => router.push({ path: '/project-detail', query: { id } })

// ✅ 新增：跳转到该竞赛的独立审核页面
const toReview = (id) => router.push({ path: '/review', query: { id } })
const goToMessagePage = () => router.push('/message-page')

// ❌ 已移除：goToMessagePage / goToMessagePage2（原消息审核入口）

async function allAppliedCompetitions() {
  try { const res = await allAppliedCompetitionsApi({ userId: localUser.value.userId }); if (res.code === 0) appliedProjects.value = res.data } catch (e) { console.error(e) }
}
async function allCreatedCompetitions() {
  try { const res = await allCreatedCompetitionsApi({ userId: localUser.value.userId }); if (res.code === 0) createdProjects.value = res.data } catch (e) { console.error(e) }
}
async function loadCompetenceCard() {
  try {
    loadingProfile.value = true
    const res = await getCompetenceCardApi()
    if (res.code === 0 && res.data) {
      competenceCard.value = res.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingProfile.value = false
  }
}

onMounted(() => {
  if (localUser.value.userId === -1) { router.replace('/login'); return }
  allAppliedCompetitions(); allCreatedCompetitions(); loadCompetenceCard()
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.15); top: -120px; right: -80px; }
.blob2 { width: 400px; height: 400px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }

.nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }
.nav-title { position: absolute; left: 50%; transform: translateX(-50%); font-size: 22px; font-weight: 800; color: #1a1028; }
.nav-actions { margin-left: auto; display: flex; gap: 10px; }
.btn-save, .btn-logout { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-save { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; box-shadow: 0 3px 12px rgba(109,40,217,0.22); }
.btn-save:hover:not(:disabled) { transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-logout { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.15); }
.btn-logout:hover { background: rgba(239,68,68,0.12); }

.content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 16px; }

.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 20px 0 8px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background-image: url(../assets/user.svg); background-size: 80%; background-repeat: no-repeat; background-position: center; background-color: rgba(139,92,246,0.08); border: 3px solid rgba(139,92,246,0.18); margin-bottom: 10px; }
.avatar-name { font-size: 20px; font-weight: 800; color: #1a1028; margin-bottom: 3px; }
.avatar-sub { font-size: 13px; color: #aaa; }

.card { background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-radius: 20px; padding: 20px; backdrop-filter: blur(12px); box-shadow: 0 2px 16px rgba(100,80,200,0.06); }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; color: #222; margin-bottom: 16px; }
.title-bar { width: 3px; height: 16px; background: linear-gradient(180deg, #8b5cf6, #6d28d9); border-radius: 2px; flex-shrink: 0; }
.bar-amber { background: linear-gradient(180deg, #f59e0b, #d97706); }
.title-actions { margin-left: auto; display: flex; gap: 8px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1/-1; }
.field label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
.field input, .field select, .field textarea {
  padding: 10px 13px; background: rgba(245,243,255,0.6);
  border: 1.5px solid rgba(139,92,246,0.1); border-radius: 10px;
  font-size: 14px; color: #333; outline: none; transition: all 0.2s; font-family: inherit;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: rgba(139,92,246,0.4); background: white; box-shadow: 0 0 0 3px rgba(139,92,246,0.07); }
.field textarea { min-height: 90px; resize: vertical; }

.competitions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.msg-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: rgba(139,92,246,0.08); color: #7c3aed; border: 1px solid rgba(139,92,246,0.15); border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; margin-left: auto; transition: all 0.2s; }
.msg-btn:hover { background: rgba(139,92,246,0.14); }
.btn-green { background: rgba(52,211,153,0.1); color: #059669; border-color: rgba(52,211,153,0.2); }
.btn-green:hover { background: rgba(52,211,153,0.16); }

.project-list { display: flex; flex-direction: column; gap: 2px; }
.project-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; transition: all 0.2s; }
.project-item:hover { background: rgba(139,92,246,0.05); }
.project-name { font-size: 14px; color: #333; font-weight: 500; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.project-action { font-size: 13px; color: #aaa; flex-shrink: 0; margin-left: 8px; }
.project-item:hover .project-action { color: #8b5cf6; }
.empty-list { text-align: center; padding: 20px; font-size: 13px; color: #ccc; }

/* ✅ 新增：竞赛操作按钮组样式，与 .msg-btn 风格保持一致 */
.item-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 8px; }
.item-btn { display: flex; align-items: center; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.btn-manage { background: rgba(139,92,246,0.08); color: #7c3aed; border-color: rgba(139,92,246,0.15); }
.btn-manage:hover { background: rgba(139,92,246,0.14); }
.btn-review { background: rgba(245,158,11,0.08); color: #d97706; border-color: rgba(245,158,11,0.2); }
.btn-review:hover { background: rgba(245,158,11,0.14); }

.competence-card {
  margin-top: 4px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.tags-row .tag {
  padding: 4px 10px;
  background: rgba(139,92,246,0.08);
  color: #7c3aed;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.tag-input {
  min-width: 140px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #555;
}

.radar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radar-label {
  width: 84px;
  font-size: 12px;
  color: #777;
}

.radar-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(139,92,246,0.08);
  overflow: hidden;
}

.radar-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

.radar-score {
  width: 36px;
  text-align: right;
  font-size: 12px;
  color: #555;
}

.total-chip {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16,185,129,0.08);
  color: #059669;
  font-size: 12px;
  font-weight: 600;
}

.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: rgba(240,253,244,0.96); border: 1px solid rgba(52,211,153,0.3); border-radius: 14px; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #065f46; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); z-index: 999; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 600px) {
  .form-grid, .competitions-grid { grid-template-columns: 1fr; }
  .nav { padding: 12px 16px; }
}
</style>