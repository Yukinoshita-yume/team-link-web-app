<template>
  <div class="user-detail">
    <!-- 退出按钮 -->
    <button @click="handleExit" class="exit-button">退出</button>
    <div id="user-img"></div>
    <!-- 改为显示title -->
    <div class="info-section">
      <p><strong>姓名:</strong> {{ user.userName }}</p>
      <p><strong>性别:</strong> {{ genderMap(user.userGender) }}</p>
      <p><strong>联系邮箱:</strong> {{ user.userEmail }}</p>
      <p v-if="user.userUniversity">
        <strong>学校:</strong> {{ user.userUniversity }}
      </p>
      <p v-if="user.userMajor"><strong>专业:</strong> {{ user.userMajor }}</p>
    </div>
    <div class="description-section">
      <h2>个人简历</h2>
      <p class="user-description">{{ user.userInformation || "暂无简历" }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userInfoByIdApi } from "@/api/api";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import router from "@/router";

const route = useRoute();
const store = useStore();
const userId = ref(route.query.id || "");
// const localUser = computed(() => store.state.user);
// 定义竞赛数据
const user = ref({
  userName: "张三",
  userEmail: "123@456.com",
  userGender: "male",
  userUniversity: "清华大学",
  userMajor: "数学",
  userInformation:
    "我是张三，我是一名数学专业的学生，我热爱编程，我喜欢研究算法。",
});
const genderMap = (gender) => {
  const map = { female: '女', male: '男', unknown: '其他' };
  return map[gender] || '其他';
};
const handleExit = () => {
  router.back();
};
//查询用户信息
async function userInfoById() {
  try {
    const res = await userInfoByIdApi({ userId: userId.value });
    console.log(res);
    if (res.code === 0) {
      user.value = res.data;
    }
  } catch (error) {
    console.error("用户信息查询失败", error);
  }
}

// 组件挂载时获取数据
onMounted(() => {
  userInfoById();
});
</script>

<style scoped>
.user-description {
  white-space: pre-wrap;
}
.user-detail {
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  position: relative;
}

#user-img {
  display: flex;
  height: 70px;
  width: 70px;
  margin: 10px auto;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: 90%;
  background-position: center;
  background-image: url(../assets/user.svg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  margin-top: 40px;
}

.info-section p {
  margin: 10px 0;
  line-height: 1.6;
}

.exit-button {
  position: fixed;
  top: 20px;
  right: 25px;
  padding: 6px 12px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.exit-button:hover {
  background-color: #cc0000;
}

.description-section {
  margin-top: 50px;
}

.description-section h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.4rem;
}

.description-section p {
  line-height: 1.6;
  color: #555;
  text-align: justify;
}

@media (max-width: 480px) {
  .user-detail {
    width: 90%;
    padding: 10px 15px 15px;
  }

  .info-section {
    padding: 12px;
  }

  .exit-button {
    font-size: 12px;
    padding: 5px 10px;
    top: 15px;
    right: 15px;
  }

  .description-section h2 {
    font-size: 1.2rem;
  }
}
</style>
