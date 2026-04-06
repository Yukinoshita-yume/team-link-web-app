import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import ResetPassword from "../components/ResetPassword.vue";
import CreateProject from "@/components/CreateProject.vue";
import Home from "../components/Home.vue";
import PersonalPage from "@/components/PersonalPage.vue";
import ProjectDetail from "@/components/ProjectDetail.vue";
import MessagePage from "@/components/MessagePage.vue";
import MessagePage2 from "@/components/MessagePage2.vue";
import userPage from "@/components/userPage.vue";
import SearchPage from "@/components/SearchPage.vue";

const routes = [
  { path: "/", redirect: "/home" }, // 默认跳转到登录页
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/reset-password", component: ResetPassword },
  { path: "/create-project", component: CreateProject },
  { path: "/home", component: Home },
  { path: "/personal-page", component: PersonalPage },
  { path: "/project-detail", component: ProjectDetail },
  { path: "/message-page", component: MessagePage },
  { path: "/message-page2", component: MessagePage2 },
  { path: "/user-page", component: userPage },
  {
    path: "/project-detail",
    component: ProjectDetail,
    props: (route) => ({ id: route.query.id }), // 通过query传递id
  },
  { path: "/search", component: SearchPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
