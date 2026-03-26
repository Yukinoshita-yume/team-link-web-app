<template>
  <div class="message-page">
    <div class="header-container">
      <h1 class="page-title">我的消息</h1>
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
      <div class="message-section combined-section">
        <div class="message-list">
          <!-- 待处理消息 -->
          <div v-if="pendingMessages.length > 0" class="message-group">
            <h2 class="pending-title">待处理</h2>
            <div
              v-for="(message, index) in pendingMessages"
              :key="'p' + index"
              class="message-item pending-item"
              @click="readMessage(index)"
            >
              <div class="message-info">
                <span class="competition-name">{{
                  message.title || "已解散竞赛"
                }}</span>
                <span class="username">{{
                  formatTime(message.messageCreatedTime)
                }}</span>
              </div>
              <div class="message-content">
                {{ message.messageContent }}
              </div>
            </div>
          </div>

          <!-- 历史消息 -->
          <div v-if="historyMessages.length > 0" class="message-group">
            <h2 class="agreed-title">历史消息</h2>
            <div
              v-for="message in historyMessages"
              :key="'a' + message.id"
              class="message-item agreed-item"
            >
              <div class="message-info">
                <span class="competition-name">{{
                  message.title || "已解散竞赛"
                }}</span>
                <span class="username">{{
                  formatTime(message.messageCreatedTime)
                }}</span>
              </div>
              <div class="message-content">
                {{ message.messageContent }}
              </div>
            </div>
          </div>

          <!-- 拒绝消息
          <div v-if="rejectedMessages.length > 0" class="message-group">
            <h2 class="rejected-title">拒绝</h2>
            <div
              v-for="message in rejectedMessages"
              :key="'r'+message.id"
              class="message-item rejected-item"
            >
              <div class="message-info">
                <span class="competition-name">{{ message.competitionName }}</span>
                <span class="username">{{ message.username }}</span>
              </div>
              <div class="message-content">
                {{ message.content }}
              </div>
            </div>
          </div> -->

          <!-- 无消息提示 -->
          <div
            v-if="pendingMessages.length === 0 && historyMessages.length === 0"
            class="no-messages"
          >
            暂无消息
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { memberMessageApi, readApi } from "@/api/api";
import { setId, formatTime } from "@/utils/auth";

const router = useRouter();
const store = useStore();
const userId = computed(() => store.state.user.userId);
// 模拟数据（可以从 API 或 Vuex 获取）
const pendingMessages = ref([]);

const historyMessages = ref([]);
//获取message,分为已读未读
async function memberMessage(messageArray, isread) {
  try {
    const params = {
      userId: userId.value,
      isRead: isread,
    };
    const res = await memberMessageApi(params);
    console.log(res);
    if (res.code === 0) {
      messageArray.value = res.data;
    }
  } catch (error) {
    console.error("消息获取失败", error);
  }
}
//标记信息为已读
async function read(index) {
  try {
    const res = await readApi({
      messageId: pendingMessages.value[index].messageId,
    });
    console.log(res);
    if (res.code === 0) {
      historyMessages.value.unshift(pendingMessages.value[index]);
      pendingMessages.value.splice(index, 1);
    }
  } catch (error) {
    console.error("标记为已读失败", error);
  }
}
const readMessage = (index) => {
  read(index);
};

const handleLogout = () => {
  router.back();
};

onMounted(() => {
  if (userId.value === -1) {
    router.replace("/login");
  }
  memberMessage(pendingMessages, false);
  memberMessage(historyMessages, true);
});
</script>

<style scoped>
.message-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-title {
  text-align: center;
  margin: 20px 0 30px;
  font-size: 2rem;
  color: #333;
}

.message-container {
  display: flex;
  justify-content: center;
  padding: 0 50px;
}

.message-section {
  width: 100%;
  max-width: 900px;
  border: none;
  border-radius: 12px;
  padding: 30px;
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.message-group {
  margin-bottom: 30px;
}

.message-group:last-child {
  margin-bottom: 0;
}

.pending-title {
  color: #2196f3;
  font-size: 1.6em;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.agreed-title {
  color: #4caf50;
  font-size: 1.6em;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.rejected-title {
  color: #f44336;
  font-size: 1.6em;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.message-item {
  padding: 16px 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pending-item {
  background-color: rgba(33, 150, 243, 0.08);
  border-left: 4px solid #2196f3;
}

.agreed-item {
  background-color: rgba(76, 175, 80, 0.08);
  border-left: 4px solid #4caf50;
}

.rejected-item {
  background-color: rgba(244, 67, 54, 0.08);
  border-left: 4px solid #f44336;
}

.message-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.competition-name {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

.username {
  font-size: 1em;
  color: #666;
}

.message-content {
  font-size: 1.05em;
  color: #444;
  line-height: 1.5;
  word-break: break-word;
}

.no-messages {
  color: #999;
  font-size: 1.2em;
  font-style: italic;
  text-align: center;
  padding: 40px 0;
}

/* 头部容器样式 */
.header-container {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
}

/* 头部容器样式 */
.header-container {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  padding: 0 50px; /* 添加与内容区相同的水平间距 */
}

/* 退出按钮样式 */
.logout-button {
  position: absolute;
  top: 20px;
  right: 0px;
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
  transform: translateY(-2px);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .logout-button {
    right: 10px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
/* 响应式设计 */
@media (max-width: 992px) {
  .message-container {
    padding: 0 30px;
  }

  .message-section {
    padding: 25px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }

  .message-container {
    padding: 0 20px;
  }

  .message-section {
    padding: 20px;
    border-radius: 10px;
  }

  .pending-title,
  .agreed-title,
  .rejected-title {
    font-size: 1.4em;
  }
}

@media (max-width: 480px) {
  .message-page {
    padding: 15px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .message-container {
    padding: 0 15px;
  }

  .message-section {
    padding: 15px;
  }

  .message-item {
    padding: 14px;
  }
}
</style>
