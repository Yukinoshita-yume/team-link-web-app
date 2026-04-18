<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="card">
      <button class="back-btn" @click="goToLogin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        <span>返回登录</span>
      </button>
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1>重置密码</h1>
      <p class="subtitle">验证邮箱后设置新密码</p>
      <form @submit.prevent="handleReset">
        <div class="field">
          <label>邮箱</label>
          <input type="email" v-model="email" placeholder="请输入注册邮箱" required/>
        </div>
        <div class="field">
          <label>验证码</label>
          <div class="code-row">
            <input type="text" v-model="code" placeholder="请输入验证码" required/>
            <button type="button" class="code-btn" @click="sendVerificationCode" :disabled="isSendingCode">
              {{ isSendingCode ? countdown + 's' : '获取验证码' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>新密码</label>
          <input type="password" v-model="password" placeholder="5-16位字符" required autocomplete="new-password"/>
        </div>
        <div class="field">
          <label>确认新密码</label>
          <input type="password" v-model="confirmPassword" placeholder="再次输入新密码" required autocomplete="new-password"/>
        </div>
        <button type="submit" class="btn-primary">确认重置</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendResetCodeApi, changePasswordApi } from '@/api/api'

const router = useRouter()
const email = ref(''), code = ref(''), password = ref(''), confirmPassword = ref('')
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
const handleReset = async () => {
  if (password.value !== confirmPassword.value) { alert('两次密码不一致'); return }
  await changePassword()
}
const goToLogin = () => router.push('/login')
async function sendCode() {
  try {
    const res = await sendResetCodeApi(email.value)
    if (res.code === 1) alert(res.msg)
  } catch (e) { console.error(e) }
}
async function changePassword() {
  try {
    const res = await changePasswordApi(email.value, password.value, confirmPassword.value, code.value)
    if (res.code === 1) alert(res.msg)
    else goToLogin()
  } catch (e) { console.error(e) }
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
.back-btn {
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

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
  color: #7c3aed;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
}

.back-btn:hover svg {
  transform: translateX(-3px);
}

.back-btn:active {
  transform: scale(0.96);
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
  padding: 11px 14px; background: rgba(139,92,246,0.1); color: #7c3aed;
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
</style>