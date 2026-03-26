<template>
  <div class="register-container">
    <div class="register-box">
      <h1>注册</h1>
      <form @submit.prevent="handleRegister">
        <div class="input-field">
          <i class="fas fa-user"></i>
          <input
            type="text"
            v-model="username"
            autocomplete="new"
            placeholder="用户名"
            required
          />
        </div>
        <div class="input-field">
          <i class="fas fa-envelope"></i>
          <input
            type="email"
            v-model="email"
            autocomplete="0"
            placeholder="邮箱"
            required
          />
        </div>

        <div id="code-container-box">
          <!-- 验证码 -->
          <div class="code-container">
            <!-- 左侧验证码输入框 -->
            <input
              type="text"
              v-model="code"
              autocomplete="new"
              placeholder="验证码"
              class="code-input"
              required
            />
          </div>
          <button
            type="button"
            class="btn send-code-btn"
            @click="sendVerificationCode"
            :disabled="isSendingCode"
          >
            {{ isSendingCode ? countdown + "s" : "获取验证码" }}
          </button>
        </div>

        <div class="input-field">
          <i class="fas fa-lock"></i>
          <input
            type="password"
            v-model="password"
            autocomplete="new-password"
            placeholder="密码"
            required
          />
        </div>
        <div class="input-field">
          <!-- <i class="fas fa-lock"></i> -->
          <input
            type="password"
            v-model="confirmPassword"
            autocomplete="new-password"
            placeholder="确认密码"
            required
          />
        </div>
        <button type="submit" class="btn">注册</button>
        <p class="login-text" @click="goToLogin">
          已有账号？<span>点击登录</span>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { sendCodeApi, registerApi } from "@/api/api";
const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isSendingCode = ref(false); // 控制验证码发送按钮的状态
const code = ref("");
const countdown = ref(60); // 倒计时初始值
let timer = null; // 定时器ID

// 发送验证码的逻辑
const sendVerificationCode = () => {
  if (!email.value) {
    alert("请输入邮箱地址！");
    return;
  }

  isSendingCode.value = true; // 禁用按钮，防止重复点击

  sendCode(); //   模拟发送验证码的过程（实际中应调用后台接口）
  setTimeout(() => {
    startCountdown(); // 开始倒计时
  }, 1000); // 模拟1秒钟后发送完成
};

// 倒计时逻辑
const startCountdown = () => {
  if (timer) clearInterval(timer); // 清除之前的定时器（如果有的话）

  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer); // 清除定时器
      isSendingCode.value = false; // 启用按钮
      countdown.value = 60; // 恢复倒计时
    }
  }, 1000); // 每秒更新一次
};

// 处理注册逻辑
const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert("密码和确认密码不匹配！");
    return;
  }
  console.log("Registering with:", username.value, email.value, password.value);
  register();
};

// 跳转到登录页面
const goToLogin = () => {
  router.push("/login");
};

async function sendCode() {
  try {
    const res = await sendCodeApi(email.value);
    console.log(res);
  } catch (error) {
    console.error("发送失败", error);
  }
}
async function register() {
  try {
    const res = await registerApi(
      username.value,
      password.value,
      email.value,
      code.value
    );
    console.log(res.code);
    if (res.code == 0) {
      goToLogin();
    }
  } catch (error) {
    console.error("注册失败", error);
    alert("注册失败: ",error)
  }
}
</script>

<style scoped>
/* 注册页面整体样式 */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 注册框 */
.register-box {
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
}

.input-field i {
  color: #777;
}

.input-field input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
}

/* 验证码输入框 */
#code-container-box {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
}

/* 验证码输入框和按钮分开 */
.code-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f0f0;
  border-radius: 25px;
  padding-left: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 55%;
}

.code-container input {
  border: none;
  background: none;
  outline: none;
  font-size: 1rem;
  width: 100%; /* 设置输入框占用宽度 */
}

button.send-code-btn {
  width: 35%; /* 设置按钮宽度 */
  padding: 0.5rem;
  border: none;
  background-color: rgb(150, 107, 193);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.3s;
  margin: 0;
}

.send-code-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background-color: #ccc;
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

/* 登录链接 */
.login-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.login-text span {
  color: rgb(150, 107, 193);
}

.login-text span:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-box {
    width: 60%;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .input-field {
    padding: 0.4rem 0.85rem;
  }

  .input-field input {
    font-size: 0.85rem;
  }

  .code-container input {
    font-size: 0.85rem;
    display: flex;
  }

  #code-container-box {
    flex-direction: flex;
    gap: 0.5rem;
  }

  .code-container {
    width: 40%;
    padding: 0.4rem 1rem;
  }

  button.send-code-btn {
    width: 40%;
    font-size: 0.75rem;
    padding: 0.5rem;
  }

  .btn {
    font-size: 0.75rem;
    padding: 0.5rem;
  }

  .login-text {
    font-size: 0.7rem;
  }
}
</style>
