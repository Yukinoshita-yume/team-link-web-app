<template>
  <div class="personal-page">
    <div class="action-buttons">
      <button class="save-button" @click="saveUserInfo">
        <svg class="save-icon" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"
          />
        </svg>
        保存
      </button>
      <button class="logout-button" @click="handleLogout()">
        <svg class="logout-icon" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
          />
        </svg>
        退出
      </button>
    </div>

    <div id="user-img"></div>

    <main class="content-container">
      <!-- 个人信息板块 -->
      <div class="profile-card">
        <h2 class="card-title">
          <svg class="user-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"
            />
          </svg>
          个人信息
        </h2>

        <!-- 用户名 -->
        <div class="username-section">
          <label class="section-label">用户名</label>
          <input type="text" v-model="user.userName" class="styled-input" />
        </div>

        <!-- 基本信息 -->
        <div class="basic-info-grid">
          <div class="info-item">
            <label>性别</label>
            <div class="select-wrapper">
              <select v-model="user.userGender" class="styled-select">
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="unknown">其他</option>
              </select>
              <div class="select-arrow"></div>
            </div>
          </div>

          <div class="info-item">
            <label>学校</label>
            <input
              type="text"
              v-model="user.userUniversity"
              placeholder="请输入学校"
              class="styled-input"
            />
          </div>

          <div class="info-item">
            <label>专业</label>
            <input
              type="text"
              v-model="user.userMajor"
              placeholder="请输入专业"
              class="styled-input"
            />
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="bio-section">
          <label class="section-label">个人简介</label>
          <textarea
            v-model="user.userInformation"
            placeholder="介绍一下你自己..."
            class="styled-textarea"
          ></textarea>
        </div>
      </div>

      <!-- 竞赛信息板块 -->
      <div class="competition-card">
        <h2 class="card-title">
          <svg class="trophy-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M18 2c-.9 0-2 1-2 2H8c0-1-1.1-2-2-2H2v9c0 1 1 2 2 2h2.2c.4 2 1.7 3.7 4.8 4v2.1c-2.2.2-3 2.3-3 3.9h8c0-1.6-.8-3.7-3-3.9V17c3.1-.3 4.4-2 4.8-4H20c1 0 2-1 2-2V2h-4M6 11H4V4h2v7m14 0h-2V4h2v7z"
            />
          </svg>
          竞赛信息
        </h2>

        <div class="projects-grid">
          <!-- 已报项目 -->
          <div class="project-category">
            <h3 class="project-title">
              <span class="status-badge applied"></span>
              我报名的项目
              <div class="project-status message" @click="goToMessagePage">
                消息
              </div>
            </h3>
            <ul class="project-list">
              <li
                v-for="project in appliedProjects"
                :key="project.id"
                class="project-item"
              >
                <div class="project-name">{{ project.title }}</div>
                <div
                  class="project-status"
                  @click="toCompetitionDetail(project.competitionId)"
                >
                  查看
                </div>
              </li>
              <li v-if="appliedProjects.length === 0" class="empty-project">
                暂无已报项目
              </li>
            </ul>
          </div>

          <!-- 我创办的项目 -->
          <div class="project-category">
            <h3 class="project-title">
              <span class="status-badge created"></span>
              我创办的项目
              <div
                class="project-status create-btn"
                @click="handleCreateProject"
              >
                创办
              </div>
              <div class="project-status message" @click="goToMessagePage2">
                消息
              </div>
            </h3>
            <ul class="project-list">
              <li
                v-for="project in createdProjects"
                :key="project.id"
                class="project-item"
              >
                <div class="project-name">{{ project.title }}</div>
                <div
                  class="project-status"
                  @click="toCompetitionDetail(project.competitionId)"
                >
                  管理
                </div>
              </li>
              <li v-if="createdProjects.length === 0" class="empty-project">
                暂无创办项目
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  updateApi,
  allAppliedCompetitionsApi,
  allCreatedCompetitionsApi,
} from "@/api/api";
import { setId } from "@/utils/auth";
import router from "@/router";
import { useStore } from "vuex";

const goToMessagePage = () => {
  router.push("/message-page");
};

// 跳转到MessagePage2
const goToMessagePage2 = () => {
  router.push("/message-page2");
};

const store = useStore();
// 用户数据
const localUser = computed(() => store.state.user);
const user = ref(localUser.value);

// 状态管理
const saveStatus = ref("");

// 项目数据
const appliedProjects = ref([]);

const createdProjects = ref([]);

// 保存用户信息
const saveUserInfo = () => {
  saveStatus.value = "保存中...";
  update();
  store.dispatch("saveUserInfo", user);
  setTimeout(() => (saveStatus.value = ""), 2000);
};

// 退出按钮逻辑
const handleLogout = () => {
  router.push('/home');
};
//创办项目
const handleCreateProject = () => {
  router.push("/create-project");
};
//查询竞赛详情按钮逻辑
const toCompetitionDetail = (competitionId) => {
  router.push({
    path: "/project-detail",
    query: { id: competitionId }, // 使用query传递参数
  });
};
//更新api调用函数
async function update() {
  try {
    const res = await updateApi(user.value);
    console.log(res);
    if (res.code == 0) {
      saveStatus.value = "保存成功!";
    } else {
      saveStatus.value = "保存失败";
    }
  } catch (error) {
    console.error("update error", error);
  }
}
//获取参加的比赛
async function allAppliedCompetitions() {
  try {
    const res = await allAppliedCompetitionsApi({
      userId: localUser.value.userId,
    });
    console.log(res);
    if (res.code === 0) {
      appliedProjects.value = res.data;
      console.log(appliedProjects.value);
    }
  } catch (error) {
    console.error("获取参与竞赛失败", error);
  }
}
//获取创建的比赛
async function allCreatedCompetitions() {
  try {
    const res = await allCreatedCompetitionsApi({
      userId: localUser.value.userId,
    });
    console.log(res);
    if (res.code === 0) {
      createdProjects.value = res.data;
      console.log(createdProjects.value);
    }
  } catch (error) {
    console.error("获取创建的竞赛失败", error);
  }
}
onMounted(() => {
  if (localUser.value.userId === -1) {
    router.replace("/login");
  }
  allAppliedCompetitions();
  allCreatedCompetitions();
});
</script>

<style scoped>
/* 基础样式 */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --success-color: #4cc9f0;
  --danger-color: #f72585;
  --warning-color: #f8961e;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --border-radius: 12px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
}

/* 页面布局 */
.personal-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.action-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 1rem;
  z-index: 10;
}

#user-img {
  display: flex;
  height: 70px;
  width: 70px;
  margin: 20px auto;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-size: 90%;
  background-position: center;
  background-image: url(../assets/user.svg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-container {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 卡片样式 */
.profile-card,
.competition-card {
  background-color: white;
  border-radius: 20px;
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2.5rem;
  transition: var(--transition);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  font-size: 1.5rem;
  font-weight: 600;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
}

.user-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.trophy-icon {
  width: 24px;
  height: 24px;
  color: var(--warning-color);
}

.save-icon,
.logout-icon {
  width: 18px;
  height: 18px;
}

/* 按钮样式 */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border: none;
  border-radius: 13px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  color: white;
}

.save-button {
  background-color: #5d8f69;
  color: white;
}

.logout-button {
  background-color: #e26b76;
  color: white;
}

.save-button:hover {
  background-color: #4c7f5a;
}

.logout-button:hover {
  background-color: #d64d57;
}

/*创办*/
.create-btn {
  position: absolute;
  right: 60px;
  background-color: #4CAF50 ;
  color: white ;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
}

.create-btn:hover {
  background-color: #3e8e41 ;
}

.message {
  right: 0;
}

/* 表单元素样式 */
.section-label,
.info-item label {
  display: block;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.styled-input,
.styled-select,
.styled-textarea {
  font-family: inherit;
  font-size: 1rem;
  color: var(--dark-color);
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: var(--transition);
}

.styled-input:focus,
.styled-select:focus,
.styled-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.styled-textarea {
  min-height: 120px;
  resize: vertical;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--gray-color);
  pointer-events: none;
}

/* 竞赛信息样式 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-category {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.project-category:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.project-title {
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  font-size: 1.2rem;
  color: var(--dark-color);
}

.status-badge {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-badge.applied {
  background-color: var(--warning-color);
}

.status-badge.created {
  background-color: var(--primary-color);
}
.message {
  position: absolute;
  right: 0;
}

.project-list {
  list-style: none;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
}

.project-name {
  font-weight: 500;
  color: var(--dark-color);
}

.project-status {
  font-size: 0.85rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: var(--gray-color);
  cursor: pointer;
  transition: var(--transition);
}

.project-status:hover {
  background-color: #e0e0e0;
}

.empty-project {
  text-align: center;
  color: var(--gray-color);
  padding: 1rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    position: static;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .basic-info-grid {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .content-container {
    padding: 1rem;
  }

  .profile-card,
  .competition-card {
    padding: 1.5rem;
  }
}
</style>
