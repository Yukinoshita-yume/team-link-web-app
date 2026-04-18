<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="card">
      <button class="home-btn" @click="goToHome">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        <span>返回首页</span>
      </button>
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      </div>
      <h1>创建账号</h1>
      <p class="subtitle">加入竞赛组队平台</p>
      <form @submit.prevent="handleRegister">
        <div class="field">
          <label>用户名</label>
          <input type="text" v-model="username" placeholder="请输入用户名" required autocomplete="off"/>
        </div>
        <div class="field">
          <label>邮箱</label>
          <input type="email" v-model="email" placeholder="请输入邮箱" required autocomplete="off"/>
        </div>
        <div class="field">
          <label>验证码</label>
          <div class="code-row">
            <input type="text" v-model="code" placeholder="请输入验证码" required autocomplete="off"/>
            <button type="button" class="code-btn" @click="sendVerificationCode" :disabled="isSendingCode">
              {{ isSendingCode ? countdown + 's' : '获取验证码' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>密码</label>
          <input type="password" v-model="password" placeholder="5-16位字符" required autocomplete="new-password"/>
        </div>
        <div class="field">
          <label>确认密码</label>
          <input type="password" v-model="confirmPassword" placeholder="再次输入密码" required autocomplete="new-password"/>
        </div>
        <button type="submit" class="btn-primary">注册</button>
      </form>
      <div class="link-text" @click="goToLogin">已有账号？<span>立即登录</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendCodeApi, registerApi } from '@/api/api'

const router = useRouter()
const username = ref(''), email = ref(''), password = ref(''), confirmPassword = ref(''), code = ref('')
const isSendingCode = ref(false), countdown = ref(60)
let timer = null

const sendVerificationCode = () => {
  if (!email.value) { alert('请先输入邮箱'); return }
  isSendingCode.value = true
  sendCode()
  setTimeout(() => {
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) { clearInterval(timer); isSendingCode.value = false; countdown.value = 60 }
    }, 1000)
  }, 1000)
}
const handleRegister = async () => {
  if (password.value !== confirmPassword.value) { alert('两次密码不一致'); return }
  await register()
}
const goToHome = () => router.push('/home')
const goToLogin = () => router.push('/login')
async function sendCode() {
  try { await sendCodeApi(email.value) } catch (e) { console.error(e) }
}
async function register() {
  try {
    const res = await registerApi(username.value, password.value, email.value, code.value)
    if (res.code === 0) goToLogin()
    else alert('注册失败: ' + res.msg)
  } catch (e) { alert('注册失败') }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%);
  position: relative; overflow: hidden; padding: 20px;
}
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.2); top: -150px; right: -100px; }
.blob2 { width: 400px; height: 400px; background: rgba(196,181,253,0.15); bottom: -100px; left: -80px; }
.card {
  position: relative; z-index: 1;
  background: rgba(255,255,255,0.82); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9); border-radius: 24px;
  padding: 36px; width: 100%; max-width: 420px;
  box-shadow: 0 8px 40px rgba(120,80,220,0.1), 0 2px 8px rgba(0,0,0,0.06);
}
.logo {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: white; margin: 0 auto 16px;
}
h1 { text-align: center; font-size: 22px; font-weight: 800; color: #1a1028; margin-bottom: 4px; }
.subtitle { text-align: center; font-size: 13px; color: #999; margin-bottom: 24px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; }
.field input {
  width: 100%; padding: 11px 14px;
  background: rgba(245,243,255,0.7); border: 1.5px solid rgba(139,92,246,0.12);
  border-radius: 10px; font-size: 14px; color: #333; outline: none; transition: all 0.2s;
}
.field input:focus { border-color: rgba(139,92,246,0.5); background: white; box-shadow: 0 0 0 3px rgba(139,92,246,0.08); }
.field input::placeholder { color: #ccc; }
.code-row { display: flex; gap: 10px; }
.code-row input { flex: 1; }
.code-btn {
  padding: 11px 16px; background: rgba(139,92,246,0.1); color: #7c3aed;
  border: 1.5px solid rgba(139,92,246,0.2); border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.code-btn:hover:not(:disabled) { background: rgba(139,92,246,0.16); }
.code-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  width: 100%; padding: 13px; margin-top: 4px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 18px rgba(109,40,217,0.28); transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(109,40,217,0.35); }
.link-text { text-align: center; font-size: 14px; color: #888; cursor: pointer; margin-top: 18px; }
.link-text span { color: #8b5cf6; font-weight: 600; }
.link-text span:hover { text-decoration: underline; }
.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 10px;
  padding: 6px 12px;
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.home-btn svg {
  transition: transform 0.3s ease;
}

.home-btn:hover {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
  color: #7c3aed;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
}

.home-btn:hover svg {
  transform: translateX(-3px);
}

.home-btn:active {
  transform: scale(0.96);
}
</style>