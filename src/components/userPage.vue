<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <nav class="nav">
      <button class="back-btn" @click="handleExit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        返回
      </button>
    </nav>
    <div class="content">
      <div class="avatar-section">
        <div class="avatar"></div>
        <h1 class="name">{{ user.userName }}</h1>
        <div class="gender-badge">{{ genderMap(user.userGender) }}</div>
      </div>
      <div class="info-card">
        <div class="card-title"><div class="title-bar"></div>基本信息</div>
        <div class="info-list">
          <div class="info-row" v-if="user.userEmail">
            <div class="info-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
              邮箱
            </div>
            <div class="info-value">{{ user.userEmail }}</div>
          </div>
          <div class="info-row" v-if="user.userUniversity">
            <div class="info-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              学校
            </div>
            <div class="info-value">{{ user.userUniversity }}</div>
          </div>
          <div class="info-row" v-if="user.userMajor">
            <div class="info-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              专业
            </div>
            <div class="info-value">{{ user.userMajor }}</div>
          </div>
        </div>
      </div>
      <div class="info-card" v-if="user.userInformation">
        <div class="card-title"><div class="title-bar"></div>个人简介</div>
        <div class="bio-text">{{ user.userInformation }}</div>
      </div>
      <div class="empty-bio" v-else>
        <div class="empty-icon">📝</div>
        <div>该用户还没有填写个人简介</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userInfoByIdApi } from '@/api/api'
import { useRoute } from 'vue-router'
import router from '@/router'

const route = useRoute()
const userId = ref(route.query.id || '')
const user = ref({ userName: '', userEmail: '', userGender: '', userUniversity: '', userMajor: '', userInformation: '' })
const genderMap = (g) => ({ female: '女', male: '男', unknown: '其他' }[g] || '其他')
const handleExit = () => router.back()

async function userInfoById() {
  try {
    const res = await userInfoByIdApi({ userId: userId.value })
    if (res.code === 0) user.value = res.data
  } catch (e) { console.error(e) }
}
onMounted(() => userInfoById())
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 400px; height: 400px; background: rgba(167,139,250,0.18); top: -100px; right: -80px; }
.blob2 { width: 350px; height: 350px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }
.nav { position: sticky; top: 0; z-index: 10; padding: 14px 20px; background: rgba(255,255,255,0.82); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,0,0,0.05); }
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
.content { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 14px; }
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 28px 0 8px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; background-image: url(../assets/user.svg); background-size: 80%; background-repeat: no-repeat; background-position: center; background-color: rgba(139,92,246,0.08); border: 3px solid rgba(139,92,246,0.2); margin-bottom: 12px; }
.name { font-size: 24px; font-weight: 800; color: #1a1028; margin-bottom: 8px; }
.gender-badge { padding: 4px 14px; background: rgba(139,92,246,0.1); color: #7c3aed; border-radius: 20px; font-size: 13px; font-weight: 500; }
.info-card { background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9); border-radius: 18px; padding: 20px; backdrop-filter: blur(12px); box-shadow: 0 2px 16px rgba(100,80,200,0.06); }
.card-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #333; margin-bottom: 14px; }
.title-bar { width: 3px; height: 16px; background: linear-gradient(180deg, #8b5cf6, #6d28d9); border-radius: 2px; flex-shrink: 0; }
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row { display: flex; align-items: center; padding: 11px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.info-row:last-child { border-bottom: none; }
.info-label { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #999; width: 70px; flex-shrink: 0; }
.info-label svg { opacity: 0.6; }
.info-value { font-size: 14px; color: #333; font-weight: 500; }
.bio-text { font-size: 14px; line-height: 1.85; color: #555; white-space: pre-wrap; background: rgba(0,0,0,0.02); padding: 14px; border-radius: 10px; }
.empty-bio { text-align: center; padding: 28px; color: #ccc; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-icon { font-size: 32px; opacity: 0.4; }
</style>