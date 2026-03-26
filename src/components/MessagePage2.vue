<template>
  <div class="message-page">
    <div class="header">
      <div class="header-content">
        <h1 class="page-title">我的消息</h1>
        <div class="subtitle">管理您的团队申请消息</div>
      </div>
      <button class="logout-button" @click="handleLogout">
        <svg class="logout-icon" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
          />
        </svg>
        退出
      </button>
    </div>

    <div class="message-container">
      <!-- 待处理消息 -->
      <div class="message-section">
        <div class="section-header">
          <h2>待处理申请</h2>
          <div class="badge">{{ pendingMessages.length }} 条</div>
        </div>

        <div v-if="pendingMessages.length > 0" class="message-list">
          <div
            v-for="(message, index) in pendingMessages"
            :key="index"
            class="message-card"
          >
            <div
              class="avatar"
              :style="{ backgroundColor: getRandomColor(message.userName) }"
            >
              <span>{{ getInitials(message.userName) }}</span>
            </div>
            <div class="message-content">
              <div class="message-info">
                <h3 class="username">{{ message.userName }}</h3>
                <p class="application-status">
                  申请加入您的{{ message.title }}
                </p>
                <p class="timestamp">{{ formatTime(message.timestamp) }}</p>
              </div>
              <div class="message-actions">
                <button
                  @click="goToProfile(message.userId)"
                  class="action-button profile"
                >
                  <p class="icon-user"></p>
                  <span>主页</span>
                </button>
                <button
                  @click="
                    handleAgree(message.competitionId, message.userId, index)
                  "
                  class="action-button agree"
                >
                  <p class="icon-check"></p>
                  <span>同意</span>
                </button>
                <button
                  @click="
                    handleReject(message.competitionId, message.userId, index)
                  "
                  class="action-button reject"
                >
                  <p class="icon-close"></p>
                  <span>拒绝</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <p class="icon-inbox"></p>
          </div>
          <h3>暂无待处理消息</h3>
          <p>当前没有待处理的申请</p>
        </div>
      </div>

      <!-- 已处理消息 -->
      <!-- <div class="message-section processed-section">
        <div class="section-header">
          <h2>已处理申请</h2>
          <div class="badge processed-badge">
            {{ processedMessages.length }} 条
          </div>
        </div>

        <div v-if="processedMessages.length > 0" class="message-list">
          <div
            v-for="message in processedMessages"
            :key="message.id"
            class="message-card processed-card"
            :class="{
              accepted: message.status === 'accepted',
              rejected: message.status === 'rejected',
            }"
          >
            <div
              class="avatar"
              :style="{ backgroundColor: getRandomColor(message.username) }"
            >
              <span>{{ getInitials(message.username) }}</span>
            </div>
            <div class="message-content">
              <div class="message-info">
                <h3 class="username">{{ message.username }}</h3>
                <p class="application-status">
                  <span
                    v-if="message.status === 'accepted'"
                    class="status-tag accepted-tag"
                  >
                    <p class="icon-check"></p>
                    已同意
                  </span>
                  <span v-else class="status-tag rejected-tag">
                    <p class="icon-close"></p>
                    已拒绝
                  </span>
                </p>
                <p class="timestamp">{{ formatTime(message.processedTime) }}</p>
              </div>
              <div class="message-actions">
                <button
                  @click="goToProfile(message.userId)"
                  class="action-button profile"
                >
                  <p class="icon-user"></p>
                  <span>主页</span>
                </button>
                <button
                  v-if="
                    message.status === 'rejected' ||
                    message.status === 'accepted'
                  "
                  @click="undoReject(message.id)"
                  class="action-button undo"
                >
                  <p class="icon-undo"></p>
                  <span>撤销</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <p class="icon-check-circle"></p>
          </div>
          <h3>暂无已处理消息</h3>
          <p>您还没有处理任何申请</p>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  unadmittedMembersApi,
  cancelRegistrationApi,
  joinCompetitionApi,
  createMessageApi,
} from "@/api/api";
import { formatTime } from "@/utils/auth";

const router = useRouter();
const store = useStore();

const userId = computed(() => store.state.user.userId);
// 模拟消息数据
const messages = ref([]);
// 计算属性：待处理消息
const pendingMessages = ref([]);

// 计算属性：已处理消息
// const processedMessages = ref(
//   messages.value.filter((m) => m.status !== "pending")
// );

// 获取用户名的首字母
const getInitials = (name) => {
  return name.length > 0 ? name.charAt(0) : "?";
};

// 生成随机颜色
const getRandomColor = (str) => {
  const colors = [
    "#55cada",
    "#78a8cf",
    "#4895ef",
    "#4cc9f0",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
    "#db95b5",
    "#e989da",
    "#c682f3",
    "#b38fdb",
    "#4cc9f0",
    "#456d9c",
    "#6a82f0",
    "#6f6ade",
  ];
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

// 处理同意
const handleAgree = (competitionId, userId, index) => {
  joinCompetition(competitionId, userId, index);
};

// 处理拒绝
const handleReject = (competitionId, userId, index) => {
  cancelRegistration(competitionId, userId, index);
};

// // 撤销拒绝
// const undoReject = (messageId) => {
//   const index = messages.value.findIndex((m) => m.id === messageId);
//   if (index !== -1) {
//     messages.value[index].status = "pending";

//     // 更新计算属性
//     pendingMessages.value = messages.value.filter(
//       (m) => m.status === "pending"
//     );
//     processedMessages.value = messages.value.filter(
//       (m) => m.status !== "pending"
//     );
//   }
// };

// 跳转到个人主页
const goToProfile = (userId) => {
  router.push({
    path: "/user-page",
    query: { id: userId },
  });
};

async function unadmittedMembers() {
  try {
    const params = {
      userId: userId.value,
    };
    const res = await unadmittedMembersApi(params);
    console.log(res);
    if (res.code === 0) messages.value = res.data;
    pendingMessages.value = messages.value;
    console.log(pendingMessages.value);
  } catch (error) {
    console.error("信息获取失败", error);
  }
}
//同意user加入队伍
async function joinCompetition(competitionId, userId, index) {
  try {
    const message = {
      competitionId: competitionId,
      userId: userId,
      messageType: "APPLICATION_APPROVED",
      messageContent: "您的报名申请已被通过",
    };
    console.log(message);
    const res1 = await joinCompetitionApi(competitionId, userId);
    const res2 = await createMessageApi(message);
    console.log(res1, "\n", res2);
    if (res1.code === 0 && res2.code === 0) {
      pendingMessages.value.splice(index, 1);
    }
  } catch (error) {
    console.log("加入失败", error);
  }
}
//拒绝user加入队伍
async function cancelRegistration(competitionId, userId, index) {
  try {
    const message = {
      competitionId: competitionId,
      userId: userId,
      messageType: "APPLICATION_REJECTED",
      messageContent: "您的报名申请已被拒绝",
    };
    console.log(message);
    const res1 = await cancelRegistrationApi({
      competitionId: competitionId,
      userId: userId,
    });
    const res2 = await createMessageApi(message);
    console.log(res1, "\n", res2);
    if (res1.code === 0 && res2.code === 0) {
      pendingMessages.value.splice(index, 1);
    }
  } catch (error) {
    console.log("拒绝失败", error);
  }
}

const handleLogout = () => {
  router.back();
};

onMounted(() => {
  if (userId.value === -1) {
    router.replace("/login");
  }
  unadmittedMembers();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap");

:root {
  --avatar-colors: #55cada, #78a8cf, #4895ef, #4cc9f0, #7209b7, #560bad, #480ca8,
    #3a0ca3, #db95b5, #e989da, #c682f3, #b38fdb, #4cc9f0, #456d9c, #6a82f0,
    #6f6ade;
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --box-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Noto Sans SC", sans-serif;
  background-color: #f5f7fb;
  color: var(--dark-color);
  line-height: 1.6;
}

.message-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  display: inline-block;
}

.subtitle {
  font-size: 1rem;
  color: var(--gray-color);
  font-weight: 400;
}

.message-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-section {
  background-color: white;
  border-radius: 15px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: var(--transition);
}

.message-section.processed-section {
  background-color: white;
}

.section-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
}

.processed-section .section-header {
  background-color: white;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--dark-color);
}

.badge {
  background-color: var(--primary-color);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

.processed-badge {
  background-color: var(--gray-color);
}

.message-list {
  padding: 0.5rem;
}

.message-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  margin: 0.5rem;
  border-radius: 20px;
  transition: var(--transition);
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
}

.message-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.message-card.processed-card {
  background-color: var(--light-color);
}

.message-card.accepted {
  border-left: 4px solid var(--success-color);
}

.message-card.rejected {
  border-left: 4px solid var(--danger-color);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 1.25rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-info {
  flex: 1;
}

.username {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.application-status {
  font-size: 0.9rem;
  color: var(--gray-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.accepted-tag {
  background-color: var(--success-light);
  color: var(--success-color);
}

.rejected-tag {
  background-color: var(--danger-light);
  color: var(--danger-color);
}

.timestamp {
  font-size: 0.8rem;
  color: var(--gray-color);
  margin-top: 0.25rem;
}

.message-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  color: white; /* 修改文字颜色为白色 */
}

.profile {
  background-color: #3a7bd5; /* 改为悬停时的颜色 */
}

.profile:hover {
  background-color: #2a6bc5; /* 加深颜色 */
  box-shadow: 0 2px 5px rgba(58, 123, 213, 0.3);
}

.agree {
  background-color: #3aa8d8; /* 改为悬停时的颜色 */
}

.agree:hover {
  background-color: #2a98c8; /* 加深颜色 */
  box-shadow: 0 2px 5px rgba(60, 179, 213, 0.3);
}

.reject {
  background-color: #d91a6d; /* 改为悬停时的颜色 */
}

.reject:hover {
  background-color: #c90a5d; /* 加深颜色 */
  box-shadow: 0 2px 5px rgba(217, 26, 109, 0.3);
}

.undo {
  background-color: #e07e0c; /* 改为悬停时的颜色 */
}

.undo:hover {
  background-color: #d06e0c; /* 加深颜色 */
  box-shadow: 0 2px 5px rgba(224, 126, 12, 0.3);
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  background-color: rgb(248, 250, 251);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.processed-section .empty-state {
  background-color: var(--light-color);
}

.empty-icon {
  font-size: 3rem;
  color: #babad8;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-color);
  font-size: 0.95rem;
}

/* 图标字体 */
.icon-user:before {
  content: "👤";
  padding-right: 0.5rem;
}

.icon-check:before {
  content: "✅ ";
  padding-right: 0.5rem;
}

.icon-close:before {
  content: "❎ ";
  padding-right: 0.5rem;
}

.icon-inbox:before {
  content: "📥";
  font-size: 50px;
}

.icon-check-circle:before {
  content: "✅";
  font-size: 50px;
}

.icon-undo:before {
  content: "↩️";
  padding-right: 0.5rem;
}

/* 修改header样式 */
.header {
  position: relative;
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 0 50px;
}

.header-content {
  display: inline-block;
}

/* 退出按钮样式 */
.logout-button {
  position: absolute;
  top: 20px;
  right: 0px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #d32f2f;
  transform: translateY(-50%) scale(1.05);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header {
    padding: 0 20px;
  }

  .logout-button {
    right: 20px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .logout-button {
    right: 10px;
    top: 20px;
    transform: none;
  }

  .header-content {
    margin-top: 40px;
  }
}
/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-card {
  animation: fadeIn 0.3s ease-out forwards;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-page {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .message-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.3rem;
  }

  .avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .message-content {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .message-actions {
    width: 100%;
    margin-top: 1rem;
    justify-content: flex-end;
  }

  .action-button {
    flex: 1;
    min-width: 100px;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.6rem;
  }

  .message-actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .action-button {
    flex: 1;
    min-width: 100px;
  }
}
</style>
