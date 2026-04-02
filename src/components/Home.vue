<template>
  <header>
    <button id="logout-btn" v-if="hasLogin" @click="logout">退出登录</button>
    <div id="select-box">
      <input
        type="search"
        id="search"
        v-model="content"
        placeholder="这是搜索框"
        autocomplete="off"
      />
      <div id="serch-icon" @click="search"></div>
    </div>
    <button id="ai-search-btn" @click="goToAiSearch">✦ AI 搜索</button>
    <div id="user" v-if="hasLogin" @click="goToUser()"></div>
    <div
      id="user-login"
      v-if="!hasLogin && !loading"
      @click="goToLogin()"
    ></div>
  </header>
  <!-- <div id="empty-box"></div> -->
  <div id="items-box">
    <div
      class="item-box"
      v-for="item in competitions"
      :key="item.competitionId"
      @click="goToDetail(item.competitionId)"
    >
      <div class="main-part">
        <div class="left-part">
          <div class="name-part">{{ item.title }}</div>
          <div class="config-part">
            <div v-if="item.schoolRequirements">
              院校要求：{{ item.schoolRequirements }}&nbsp;&nbsp;|&nbsp;&nbsp;
            </div>
            <div>截止时间：{{ item.deadline.split(" ")[0] }}</div>
          </div>
        </div>
        <div class="right-part">
          <div class="item-user"></div>
          <p>{{ item.userName }}</p>
        </div>
      </div>
      <div class="tags-part">
        <div v-if="item.tag1">{{ item.tag1 }}</div>
        <div v-if="item.tag2">{{ item.tag2 }}</div>
        <div v-if="item.tag3">{{ item.tag3 }}</div>
        <div v-if="item.tag4">{{ item.tag4 }}</div>
        <div v-if="item.tag5">{{ item.tag5 }}</div>
      </div>
    </div>
    <div id="empty-item" v-if="competitions.length % 2"></div>
    <div class="loadingPage" v-if="loading">加载中 ~~~</div>
  </div>
  <div id="page-select-box">
    <div id="page-buttons-box">
      <button @click="prevPage()" :disabled="page === 1"></button>
      <button
        v-for="item in pages"
        :key="item"
        @click="goToPage(item)"
        :class="{ active: item === page }"
      >
        {{ item }}
      </button>
      <button
        @click="nextPage()"
        :disabled="page === totalPages || total === 0"
      >
        >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { selectPageApi, userInfoApi } from "@/api/api";
import { removeToken } from "@/utils/auth";

const router = useRouter();
const store = useStore();
const loading = ref(true);
const content = ref(""); //输入框的内容
// const boxRef = ref(null); //裁剪item
const page = ref(1); //当前页码
const pageSize = ref(10); //每页数量
const hasLogin = ref(false);
const total = ref(0); //总数据量
const competitions = ref([]); //当前页数据集合

const totalPages = computed(() => Math.ceil(total.value / pageSize.value)); //总页数
const pages = computed(() => {
  const range = 2; // 显示当前页码前后 2 页
  const start = Math.max(1, page.value - range);
  const end = Math.min(totalPages.value, page.value + range);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}); //显示页数集合
const search = () => {
  console.log(content.value);
  selectPage();
};
const goToPage = (item) => {
  page.value = item;
};
const prevPage = () => {
  if (page.value != 1) page.value--;
};
const nextPage = () => {
  if (page.value != totalPages) page.value++;
};
const goToLogin = () => {
  router.push("/login");
};
const goToUser = () => {
  router.push("/personal-page");
};
const keyEnter = (event) => {
  if (event.key === "Enter") {
    console.log(content.value);
    selectPage();
  }
};

// const goToDetail = (competitionId) => {
//     setToken(competitionId)
//     router.push(`/project-detail`);
// }

const goToDetail = (competitionId) => {
  router.push({
    path: "/project-detail",
    query: { id: competitionId }, // 使用query传递参数
  });
};

const logout = () => {
  removeToken();
  localStorage.removeItem("local-user");
  hasLogin.value = false;
  router.replace("/home"); // 跳转到登录页面
};
/*const itemUser= async (competitionId)=>{
    const params={
        competitionId:competitionId
    };
    const value={data:""};
    await getCompetitionCreator(params,value);
    console.log(value);
}*/
// const handleScroll = () => {
//     if (boxRef.value) {
//         const headerHeight = 100;
//         const scrollTop = boxRef.value.scrollTop;

//         boxRef.value.style.clipPath = `inset( 1000px 0 0 0)`;
//     }
// };
onMounted(() => {
  selectPage();
  userInfo();
  // if (boxRef.value) {
  //     boxRef.value.addEventListener('scroll', handleScroll);
  // }
});
window.addEventListener("keydown", keyEnter);
watch([page, pageSize], ([newPage, newPageSize], [oldPage, oldPageSize]) => {
  console.log("page 变化：", newPage);
  console.log("pageSize 变化：", newPageSize);
  selectPage(); // 重新加载数据
});
async function selectPage() {
  try {
    loading.value = true;
    const res = await selectPageApi(page.value, pageSize.value, content.value);
    console.log(res);
    if (res.code === 0) {
      loading.value = false;
      total.value = res.data.total;
      competitions.value = res.data.rows;
    }
  } catch (error) {
    console.error("查询失败:", error);
  }
}
// async function getCompetitionCreator(params,value) {
//     try {
//         const res=await creatorApi(params);
//         console.log(res);
//         value.data=res.data.userName;
//         // console.log(value);
//     } catch (error) {
//         console.error("查询作者失败",error)
//     }
// }
async function userInfo() {
  try {
    const res = await userInfoApi();
    console.log(res);
    const user = {
      userId: -1,
      userName: "",
      userGender: "",
      userUniversity: "",
      userMajor: "",
      userInformation: "",
    };
    for (const key in user) {
      if (key in res.data) {
        user[key] = res.data[key];
      }
    }
    console.log(user);
    await store.dispatch("saveUserInfo", user);
    hasLogin.value = true;
  } catch (error) {
    console.log("未登录", error);
    localStorage.removeItem("local-user");
  }
}

const goToAiSearch = () => {
  if (!hasLogin.value) {
    router.push('/login')
    return
  }
  router.push('/search')
}
</script>

<style scoped>
div {
  box-sizing: border-box;
  /* border: 1px solid black; */
  margin: 0;
  padding: 0;
}
header {
  display: flex;
  position: fixed;
  align-items: center;
  width: 100%;
  /* border: 1px solid black; */
  height: 100px;
  z-index: 10;
  background: linear-gradient(
    to top,
    rgba(248, 237, 226, 1),
    rgba(255, 240, 221, 1)
  );
}
#empty-box {
  display: flex;
  height: 100px;
}
#select-box {
  display: flex;
  position: absolute;
  left: 30%;
  width: 40%;
  height: 50%;
}
#user,
#user-login {
  display: flex;
  position: absolute;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  right: 50px;
  background-repeat: no-repeat;
  background-position: center;
}
#user {
  background-size: 90%;
  background-image: url(../assets/user.svg);
}
#user-login {
  background-size: cover;
  background-image: url(../assets/login.svg);
}
#search {
  border: none;
  display: flex;
  padding-inline-start: 25px;
  border-top-left-radius: 25px;
  border-bottom-left-radius: 25px;
  background-color: rgba(255, 255, 255, 1);
  outline: none;
  box-sizing: border-box;
  flex: 1;
  font-size: 16px;
  text-overflow: ellipsis;
  min-width: 0;
}
/* 隐藏搜索框的清除按钮 */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}
#serch-icon {
  height: 100%;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
  width: 60px;
  background-color: rgba(255, 255, 255, 1);
  background-image: url(../assets/search.svg);
  background-size: 60%;
  background-repeat: no-repeat;
  background-position: 0, center;
}
#items-box {
  z-index: 1;
  display: flex;
  /* flex-direction: column; */
  flex-wrap: wrap;
  width: 100%;

  margin-top: 100px;
  /* padding: 10px; */
  justify-content: center;
}
.item-box {
  display: flex;
  width: 40%;
  /* max-width: 600px; */
  height: 200px;
  flex-direction: column;
  margin: 10px;
  background-color: rgba(248, 255, 255, 0.3);
  border-radius: 10px;
  /* box-shadow: 2px 2px 10px 0 gray; */
}
.item-box:hover {
  position: relative;
  top: -5px;
  left: -5px;
  box-shadow: 5px 5px 5px 0 rgba(225, 214, 240, 1);
}
#empty-item {
  border: none;
  display: flex;
  width: 40%;
  height: 200px;
  margin: 10px;
}
.main-part {
  display: flex;
  height: 160px;
  width: 100%;
}
.tags-part {
  display: flex;
  height: 40px;
  width: 100%;
  padding-inline-start: 16px;
}
.tags-part div {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 40px;
  margin-right: 16px;
}
.left-part {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  container-type: inline-size;
  flex: 1;
}
.right-part {
  display: flex;
  width: 100px;
  font-size: 18px;
  color: rgba(240, 135, 132, 0.6);
  flex-direction: column;
  align-items: center;
}
.right-part p {
  margin-top: 20px;
}
.item-user {
  display: flex;
  height: 70px;
  width: 70px;
  border-radius: 50%;
  right: 50px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 90%;
  background-image: url(../assets/user.svg);
}
.name-part {
  /* display: flex; */
  padding-inline-start: 16px;
  padding-inline-end: 16px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100cqw;
  font-size: 24px;
}
.config-part {
  padding-inline-start: 16px;
  color: gray;
  width: 100%;
}
#page-select-box {
  display: flex;
  height: 60px;
  justify-content: center;
}
#page-buttons-box {
  display: flex;
  align-items: center;
}
#page-buttons-box button {
  border: 0;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  margin: 5px;
}
#page-buttons-box button:disabled:hover {
  background-color: initial;
  color: initial;
}
#page-buttons-box button.active,
#page-buttons-box button:hover {
  background-color: rgba(177, 211, 203, 1);
  color: #fff;
}
#page-buttons-box button:disabled {
  /* pointer-events: none; */
  cursor: not-allowed;
  opacity: 0.5;
}
.loadingPage {
  display: flex;
  height: 600px;
  width: 100%;
  max-width: 1200px;
  color: #999;
  font-size: 4.2em;
  font-style: italic;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}
@media (max-width: 750px) {
  #user {
    right: 25px;
  }
  .item-box {
    width: 100%;
    margin: 10px 30px;
  }
}
#logout-btn {
  position: absolute;
  left: 2%;
  top: 30%;
  padding: 8px 16px;
  background-color: #dbdbf9; /* 淡黄色背景 */
  color: #333; /* 文字颜色 */
  border: none;
  border-radius: 20px; /* 圆角 */
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease; /* 平滑过渡效果 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

/* 悬停效果 */
#logout-btn:hover {
  transform: scale(1.05); /* 轻微放大 */
  background-color: #d4dbff; /* 悬停时颜色稍深 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 阴影加深 */
}

/* 点击效果 */
#logout-btn:active {
  transform: scale(0.98); /* 点击时轻微缩小 */
}

/* 调整搜索框位置以适应新按钮 */
#select-box {
  left: 35%; /* 调整左边距为按钮留出空间 */
  width: 40%;
}

#ai-search-btn {
  position: absolute;
  right: 140px;
  padding: 8px 18px;
  background-color: rgba(177, 211, 203, 0.6);
  color: #2a7a5e;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}
#ai-search-btn:hover {
  background-color: rgba(177, 211, 203, 1);
  transform: scale(1.05);
}
</style>
