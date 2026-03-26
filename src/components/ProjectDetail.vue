<template>
  <div class="competition-detail">
    <!-- 退出按钮 -->
    <button @click="handleExit" class="exit-button">退出</button>
    <h1>{{ competition.title }}</h1>
    <!-- 改为显示title -->
    <div class="info-section">
      <div id="creator">
        <div
          id="creator-icon"
          @click="goToProfile(competitionCreator.userId)"
        ></div>
        &nbsp;{{ competitionCreator.userName }}
      </div>
      <p><strong>竞赛标题:</strong> {{ competition.title }}</p>
      <p>
        <strong>学校要求:</strong> {{ competition.schoolRequirements || "无" }}
      </p>
      <p><strong>截止时间:</strong> {{ formatDate(competition.deadline) }}</p>
      <p><strong>人数:</strong> {{ formatCount(competition.currentCount) }}</p>
      <p
        v-if="
          competition.admittedMemberNames &&
          competition.admittedMemberNames.length > 0
        "
      >
        <strong>已报名成员:</strong>
        {{ competition.admittedMemberNames.join(", ") }}
      </p>
      <!-- 添加标签显示 -->
      <div class="tags-container" v-if="hasTags">
        <strong>标签:</strong>
        <span v-for="tag in activeTags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <!-- 动态按钮 -->
    <button
      v-if="
        !isMine &&
        !(
          competition.currentCount >= competition.maxParticipants &&
          registrationStatus === 0
        )
      "
      @click="handleButtonClick"
      :class="buttonClass"
      :disabled="isDisabled"
    >
      {{ formatButtonValue[registrationStatus] }}
    </button>
    <button v-if="isMine" class="cancel-button" @click="handleDelete">
      解散队伍
    </button>
    <div class="description-section">
      <h2>竞赛详情</h2>
      <p class="description-text">
        {{ competition.competitionDetails || "暂无详细介绍" }}
      </p>
    </div>
    <div
      v-if="isMine && competition.admittedMemberId.length"
      class="info-section"
    >
      <div
        v-for="i in competition.admittedMemberId.length"
        :key="i"
        class="member-list"
      >
        <div
          class="avatar"
          :style="{
            backgroundColor: getRandomColor(
              competition.admittedMemberNames[i - 1]
            ),
          }"
        >
          <span>{{ getInitials(competition.admittedMemberNames[i - 1]) }}</span>
        </div>
        <div class="message-content">
          <div class="message-info">
            <h3 class="username">
              {{ competition.admittedMemberNames[i - 1] }}
            </h3>
          </div>
          <div class="message-actions">
            <button
              @click="goToProfile(competition.admittedMemberId[i - 1])"
              class="action-button profile"
            >
              <p class="icon-user"></p>
              <span>主页</span>
            </button>
            <button @click="removeMember(i - 1)" class="action-button remove">
              <p class="icon-check"></p>
              <span>移除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import {
  competitionDetailApi,
  applyCompetitionApi,
  checkApplicationApi,
  cancelRegistrationApi,
  creatorApi,
  createMessageApi,
  deleteCompetitioinApi,
} from "@/api/api";
import { getRandomColor, getInitials } from "@/utils/auth";
// const competitionId = ref(getToken() || '');
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import router from "@/router";

const route = useRoute();
const store = useStore();
const confirmDialog = inject("confirmDialog");
const competitionId = ref(route.query.id || ""); // 从路由query中获取ID
const localUser = computed(() => store.state.user);
const competitionCreator = ref("");
// 是否已报名
const registrationStatus = ref(0);
// 是否禁用报名按钮
const isDisabled = ref(true);
const isMine = ref(true);
const params = {
  competitionId: competitionId.value,
  userId: localUser.value.userId,
};
const formatButtonValue = ref(["报名", "取消报名", "退出队伍"]);
// 定义竞赛数据
const competition = ref({
  userId: -1,
  title: "",
  tag1: "",
  tag2: "",
  tag3: "",
  tag4: "",
  tag5: "",
  competitionDetails: "",
  schoolRequirements: "",
  deadline: "",
  maxParticipants: 0,
  currentCount: 0,
  admittedMemberNames: [],
  admittedMemberId: [],
});

// 计算属性：是否有标签
const hasTags = computed(() => {
  return (
    competition.value.tag1 ||
    competition.value.tag2 ||
    competition.value.tag3 ||
    competition.value.tag4 ||
    competition.value.tag5
  );
});

// 计算属性：活动的标签
const activeTags = computed(() => {
  const tags = [];
  for (let i = 1; i <= 5; i++) {
    const tag = competition.value[`tag${i}`];
    if (tag) tags.push(tag);
  }
  return tags;
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "未设置截止时间";
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 格式化人数显示
const formatCount = () => {
  return `${competition.value.currentCount || 0}/${
    competition.value.maxParticipants || 0
  }`;
};

const goToProfile = (userId) => {
  router.push({
    path: "/user-page",
    query: { id: userId },
  });
};

async function fetchCompetitionDetail() {
  try {
    console.log("获取竞赛详情中...ID:", competitionId.value);

    await checkApplication(params);
    const res = await competitionDetailApi({
      competitionId: competitionId.value,
    });
    console.log("获取竞赛详情结果", res);

    if (res.code === 0) {
      competition.value = {
        userId: res.data.userId,
        title: res.data.title || "未命名竞赛",
        tag1: res.data.tag1,
        tag2: res.data.tag2,
        tag3: res.data.tag3,
        tag4: res.data.tag4,
        tag5: res.data.tag5,
        competitionDetails: res.data.competitionDetails || "暂无详细介绍",
        schoolRequirements: res.data.schoolRequirements,
        deadline: res.data.deadline,
        maxParticipants: res.data.maxParticipants || 0,
        currentCount: res.data.currentCount || 0,
        admittedMemberNames:
          res.data.admittedMemberNames.map((item) => item.userName) || [],
        admittedMemberId:
          res.data.admittedMemberNames.map((item) => item.userId) || [],
      };
      if (res.data.userId === localUser.value.userId) {
        isMine.value = true;
      } else {
        isMine.value = false;
        if (
          competition.value.admittedMemberId.indexOf(localUser.value.userId) !==
          -1
        ) {
          registrationStatus.value = 2;
        }
      }
    }
  } catch (error) {
    console.error("获取竞赛详情失败", error);
    competition.value.title = "获取竞赛信息失败";
    competition.value.description =
      error.message || "无法加载竞赛详情，请稍后再试";
  }
  //  finally {
  //   removeToken();
  // }
}
async function creator() {
  try {
    const res = await creatorApi({ competitionId: competitionId.value });
    if (res.code === 0) {
      competitionCreator.value = res.data;
    }
  } catch (error) {
    console.error("查询作者失败", error);
  }
}
//报名api
async function applyCompetition() {
  try {
    const message = {
      competitionId: competitionId.value,
      userId: localUser.value.userId,
      messageType: "APPLICATION_SUBMITTED",
      messageContent: "您提交了报名申请",
    };
    const res1 = await applyCompetitionApi(
      competitionId.value,
      localUser.value.userId
    );
    const res2 = await createMessageApi(message);
    console.log(res1 + "\n" + res2);
    if (res1.code === 0) {
      registrationStatus.value = 1;
    }
  } catch (error) {
    console.error("报名失败", error);
  }
}
//取消报名api
async function cancelRegistration(params) {
  try {
    const message = {
      competitionId: competitionId.value,
      userId: localUser.value.userId,
      messageType:
        registrationStatus.value === 2 ? "TEAM_QUIT" : "APPLICATION_CANCELLED",
      messageContent:
        registrationStatus.value === 2 ? "您退出了队伍" : "您取消了报名申请",
    };
    const res1 = await cancelRegistrationApi(params);
    const res2 = await createMessageApi(message);
    console.log(res1 + "\n" + res2);
    if (res1.code === 0) {
      registrationStatus.value = 0;
    }
  } catch (error) {
    console.error("取消失败", error);
  }
}
//踢人api
async function remove(index) {
  try {
    const params = {
      competitionId: competitionId.value,
      userId: competition.value.admittedMemberId[index],
    };
    const message = {
      competitionId: competitionId.value,
      userId: competition.value.admittedMemberId[index],
      messageType: "TEAM_KICKED",
      messageContent: "您被移出了队伍",
    };
    const res1 = await cancelRegistrationApi(params);
    const res2 = await createMessageApi(message);
    console.log(res1, res2);
    if (res1.code === 0) {
      competition.value.admittedMemberId.splice(index, 1);
      competition.value.admittedMemberNames.splice(index, 1);
      competition.value.currentCount -= 1;
    }
  } catch (error) {
    console.error("移除失败", error);
  }
}
//检测是否已经报名api
async function checkApplication(params) {
  try {
    isDisabled.value = true;
    const res = await checkApplicationApi(params);
    console.log(res);
    if (res.code === 0) {
      if (res.data === true) {
        registrationStatus.value = 1;
      } else {
        registrationStatus.value = 0;
      }
      isDisabled.value = false;
    }
  } catch (error) {
    isDisabled.value = true;
    console.error("检测报名状态失败", error);
    // await checkApplication(params);
  }
}
//解散队伍api
async function deleteCompetitioin() {
  try {
    const res = await deleteCompetitioinApi({
      competitionId: competitionId.value,
    });
    console.log(res);
    if (res.code === 0) {
      alert("删除成功");
      router.back();
    }
  } catch (error) {
    console.error("删除失败", error);
  }
}

// 组件挂载时获取数据
onMounted(() => {
  if (localUser.value.userId === -1) {
    router.replace("/login");
  } else {
    creator();
    fetchCompetitionDetail();
  }
});

// 报名/取消报名按钮点击事件
const handleButtonClick = () => {
  isDisabled.value = true;
  if (registrationStatus.value !== 0) {
    // 取消报名逻辑
    cancelRegistration(params);
  } else {
    // 报名逻辑
    applyCompetition();
  }
  setTimeout(() => {
    isDisabled.value = false;
  }, 2000);
};

//踢人函数
const removeMember = async (index) => {
  const isConfirmed = await confirmDialog({
    title: "操作确认",
    message:
      "确定要将" +
      competition.value.admittedMemberNames[index] +
      "移出队伍吗？",
    confirmText: "是的",
    cancelText: "不了",
  });
  if (isConfirmed) {
    console.log("执行删除操作");
    remove(index);
  }
};
//解散队伍按钮
const handleDelete = async () => {
  const isConfirmed = await confirmDialog({
    title: "操作确认",
    message: "确定要解散队伍吗？此操作无法恢复",
    confirmText: "是的",
    cancelText: "不了",
  });
  if (isConfirmed) {
    console.log("执行删除操作");
    deleteCompetitioin();
  }
};

// 动态按钮样式
const buttonClass = computed(() => {
  return registrationStatus.value !== 0 ? "cancel-button" : "sign-up-button";
});

// 退出按钮点击事件
const handleExit = () => {
  if (window.history.length > 1) {
    window.history.back(); // 返回上一页
  } else {
    window.close(); // 关闭当前页面（如果允许）
  }
};
</script>

<style scoped>
.competition-detail {
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  position: relative;
}

h1 {
  text-align: center;
  color: #333;
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.info-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  margin-top: 50px;
}
#creator {
  display: flex;
  align-items: center;
}
#creator-icon {
  display: flex;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 90%;
  background-image: url(../assets/user.svg);
}
.info-section p {
  margin: 10px 0;
  line-height: 1.6;
}

.tags-container {
  margin: 10px 0;
}

.tag {
  display: inline-block;
  background-color: #e0e0e0;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 5px;
  font-size: 0.9em;
}

.description-text {
  white-space: pre-wrap; /* 保留所有空格和换行符 */
}

.sign-up-button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.sign-up-button:hover {
  background-color: rgb(130, 97, 173);
}

.cancel-button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.cancel-button:hover {
  background-color: #cc0000;
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

#members-box {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: white;
  border-radius: 15px;
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: var(--transition);
  padding: 0.5rem;
}

.member-list {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  margin: 0.5rem;
  border-radius: 20px;
  transition: var(--transition);
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  animation: fadeIn 0.3s ease-out forwards;
}
.member-list:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
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

.message-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  margin: 0 10px;
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

.icon-user:before {
  content: "👤";
  padding-right: 0.5rem;
}

.icon-check:before {
  content: "❎";
  padding-right: 0.5rem;
}

.remove {
  background-color: #d91a6d; /* 改为悬停时的颜色 */
}

.remove:hover {
  background-color: #c90a5d; /* 加深颜色 */
  box-shadow: 0 2px 5px rgba(217, 26, 109, 0.3);
}

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

@media (max-width: 480px) {
  .competition-detail {
    width: 90%;
    padding: 10px 15px 15px;
  }

  h1 {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }

  .info-section {
    padding: 12px;
  }

  .sign-up-button,
  .cancel-button {
    font-size: 14px;
    padding: 10px;
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

  .tag {
    font-size: 0.8em;
    padding: 2px 6px;
  }
}
</style>
