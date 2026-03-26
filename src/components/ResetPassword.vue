<template>
  <div class="reset-container">
    <div class="reset-box">
      <h1>重置密码</h1>
      <form @submit.prevent="handleReset">
        <!-- 邮箱 -->
        <div class="input-field">
          <input type="email" v-model="email" placeholder="邮箱" required />
        </div>
        <div id="code-container-box">
          <!-- 验证码 -->
          <div class="code-container">
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

        <!-- 新密码 -->
        <div class="input-field">
          <input
            type="password"
            v-model="password"
            autocomplete="new-password"
            placeholder="新密码"
            required
          />
        </div>

        <!-- 确认新密码 -->
        <div class="input-field">
          <input
            type="password"
            v-model="confirmPassword"
            autocomplete="0"
            placeholder="确认密码"
            required
          />
        </div>

        <!-- 确认按钮 -->
        <button type="submit" class="btn">确认</button>
      </form>

      <!-- 返回登录 -->
      <p class="login-text" @click="goToLogin">
        记得密码了？<span>点击登录</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { sendResetCodeApi, changePasswordApi } from "@/api/api";

const router = useRouter();

const email = ref("");
const code = ref("");
const password = ref("");
const confirmPassword = ref("");
const isSendingCode = ref(false); // 控制验证码发送按钮的状态
const countdown = ref(60); // 倒计时初始值
let timer = null; // 定时器ID

// 处理重置密码逻辑
const handleReset = () => {
  if (password.value !== confirmPassword.value) {
    alert("密码和确认密码不匹配！");
    return;
  }
  console.log("Resetting password for:", email.value);
  changePassword();
};

// 发送验证码的逻辑
const sendVerificationCode = () => {
  if (!email.value) {
    alert("请输入邮箱地址！");
    return;
  }

  isSendingCode.value = true; // 禁用按钮，防止重复点击

  sendCode();
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

// 跳转到登录页面
const goToLogin = () => {
  router.push("/login");
};
async function sendCode() {
  try {
    const res = await sendResetCodeApi(email.value);
    console.log(res);
    if(res.code === 1){
      alert(res.msg);
    }
  } catch (error) {
    console.error("发送验证码失败", error);
  }
}
async function changePassword() {
  try {
    const res = await changePasswordApi(email.value, password.value, confirmPassword.value, code.value);
    console.log(res);
    if(res.code === 1){
      alert(res.msg);
    }
    else{
      goToLogin();
    }
  } catch (error) {
    console.error("重置密码失败", error);
  }
}
</script>

<style scoped>
/* 页面整体样式 */
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 重置密码框 */
.reset-box {
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

/* 输入框内的文本 */
.input-field input {
  border: none;
  background: none;
  outline: none;
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
  width: 100%;
}

button.send-code-btn {
  width: 35%;
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

/* 确认按钮样式 */
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
  .reset-container {
    padding: 1rem;
    height: auto;
    min-height: 100vh;
  }

  .reset-box {
    width: 60%;
    max-width: 90%;
    padding: 1.5rem;
    box-shadow: none;
    border-radius: 10px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .input-field {
    flex-direction: row;
    padding: 0.4rem 0.8rem;
  }

  .input-field input {
    font-size: 0.85rem;
  }

  #code-container-box {
    display: flex;
    gap: 0.5rem;
  }

  .code-container {
    width: 50%;
    padding-left: 0.8rem;
  }

  .code-container input {
    font-size: 0.85rem;
  }

  button.send-code-btn {
    width: 40%;
    font-size: 0.8rem;
  }

  .btn {
    font-size: 0.8rem;
    padding: 0.6rem;
  }

  .login-text {
    font-size: 0.75rem;
  }
}
</style>
