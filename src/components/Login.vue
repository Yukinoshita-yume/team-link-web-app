<template>
  <div class="login-container">
    <div class="login-box">
      <h1>登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-field">
          <input type="email" v-model="email" placeholder="邮箱" required />
        </div>
        <div class="input-field">
          <input
            type="password"
            v-model="password"
            placeholder="密码"
            required
          />
        </div>
        <span class="forgot-password-inline" @click="goToResetPassword"
          >忘记密码？</span
        >
        <button type="submit" class="btn">登录</button>
        <p class="register-text" @click="goToRegister">
          还没有账号？<span>点击注册</span>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginApi } from "@/api/api";
import { setToken } from "@/utils/auth";
import { walkIdentifiers } from "vue/compiler-sfc";

const router = useRouter();

const email = ref("");
const password = ref("");

// 处理登录逻辑
const handleLogin = () => {
  // console.log("Logging in with:", email.value, password.value);

  AxiosLogin();
};

// 跳转到注册页面
const goToRegister = () => {
  router.push("/register"); // 这里的 router.push 确保跳转到 /register
};

// 跳转到重置密码
const goToResetPassword = () => {
  router.push("/reset-password");
};
async function AxiosLogin() {
  try {
    const res = await loginApi(email.value, password.value);
    console.log(res.msg);
    console.log(res.data);
    setToken(res.data);
    if (res.code == 0) router.push("/home");
    else if (res.code == 1) {
      alert("登陆失败: " + res.msg);
    }
  } catch (error) {
    console.error("登录失败: ", error);
  }
}
</script>

<style scoped>
/* 登录页面整体样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 登录框 */
.login-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
}

/* 输入框样式 */
.input-field {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  margin: 1rem 0;
  position: relative;
}

.input-field input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
}

/* 右下角忘记密码 */
.forgot-password-inline {
  display: block; /* 让它换行到密码框的下面 */
  text-align: right; /* 让它对齐到右侧 */
  font-size: 0.8rem;
  color: rgb(150, 107, 193);
  cursor: pointer;
  margin-top: 5px; /* 与输入框保持一些间距 */
}

.forgot-password-inline:hover {
  text-decoration: underline;
}

/* 按钮样式 */
.btn {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: 25px;
  background-color: rgb(150, 107, 193);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 1rem;
}

.btn:hover {
  background-color: rgb(130, 97, 173);
}

/* 注册链接 */
.register-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.register-text span {
  color: rgb(150, 107, 193);
}

.register-text span:hover {
  text-decoration: underline;
}

/* 手机设备样式（宽度小于 480px） */
@media (max-width: 480px) {
  .login-box {
    width: 60%;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .input-field {
    padding: 0.4rem 0.8rem;
  }

  .input-field input {
    font-size: 0.85rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .register-text {
    font-size: 0.75rem;
  }

  .forgot-password-inline {
    font-size: 0.75rem;
  }
}
</style>
