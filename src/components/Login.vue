<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="card">
      <div class="logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h1>欢迎回来</h1>
      <p class="subtitle">登录你的竞赛组队账号</p>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>邮箱</label>
          <input type="email" v-model="email" placeholder="请输入邮箱" required autocomplete="email"/>
        </div>
        <div class="field">
          <label>密码</label>
          <input type="password" v-model="password" placeholder="请输入密码" required autocomplete="current-password"/>
        </div>
        <div class="forgot" @click="goToResetPassword">忘记密码？</div>
        <button type="submit" class="btn-primary">登录</button>
      </form>
      <div class="divider"><span>或者</span></div>
      <div class="link-text" @click="goToRegister">还没有账号？<span>立即注册</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/api'
import { setToken } from '@/utils/auth'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const res = await loginApi(email.value, password.value)
    setToken(res.data)
    if (res.code === 0) router.push('/home')
    else alert('登录失败: ' + res.msg)
  } catch (e) { console.error(e) }
}
const goToRegister = () => router.push('/register')
const goToResetPassword = () => router.push('/reset-password')
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.2); top: -150px; right: -100px; }
.blob2 { width: 400px; height: 400px; background: rgba(196,181,253,0.15); bottom: -100px; left: -80px; }
.card {
  position: relative; z-index: 1;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 24px;
  padding: 40px 36px;
  width: 100%; max-width: 400px;
  box-shadow: 0 8px 40px rgba(120,80,220,0.1), 0 2px 8px rgba(0,0,0,0.06);
}
.logo {
  width: 56px; height: 56px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: white; margin: 0 auto 20px;
}
h1 { text-align: center; font-size: 24px; font-weight: 800; color: #1a1028; margin-bottom: 6px; }
.subtitle { text-align: center; font-size: 14px; color: #999; margin-bottom: 28px; }
.field { margin-bottom: 18px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 7px; }
.field input {
  width: 100%; padding: 12px 16px;
  background: rgba(245,243,255,0.7);
  border: 1.5px solid rgba(139,92,246,0.12);
  border-radius: 12px; font-size: 14px; color: #333; outline: none;
  transition: all 0.2s;
}
.field input:focus { border-color: rgba(139,92,246,0.5); background: white; box-shadow: 0 0 0 3px rgba(139,92,246,0.08); }
.field input::placeholder { color: #ccc; }
.forgot { text-align: right; font-size: 13px; color: #8b5cf6; cursor: pointer; margin-bottom: 22px; }
.forgot:hover { text-decoration: underline; }
.btn-primary {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 18px rgba(109,40,217,0.28);
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(109,40,217,0.35); }
.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.07); }
.divider span { font-size: 13px; color: #ccc; }
.link-text { text-align: center; font-size: 14px; color: #888; cursor: pointer; }
.link-text span { color: #8b5cf6; font-weight: 600; }
.link-text span:hover { text-decoration: underline; }
</style>