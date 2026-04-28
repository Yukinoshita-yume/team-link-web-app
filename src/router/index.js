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
import ChatPage from "@/components/ChatPage.vue";
import DmPage from "@/components/DmPage.vue";
import SearchPage from "@/components/SearchPage.vue";
import ReviewList from "@/views/ReviewList.vue";
import TeamDiagnosePage from "@/components/TeamDiagnosePage.vue";

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/reset-password", component: ResetPassword },
  { path: "/create-project", component: CreateProject },
  { path: "/home", component: Home },
  { path: "/personal-page", component: PersonalPage },
  { path: "/message-page", component: MessagePage },
  { path: "/message-page2", component: MessagePage2 },
  { path: "/user-page", component: userPage },
  { path: "/chat", component: ChatPage },
  { path: "/dm-page", component: DmPage },
  {
    path: "/project-detail",
    component: ProjectDetail,
    props: (route) => ({ id: route.query.id }),
  },
  { path: "/search", component: SearchPage },
  { path: "/review", component: ReviewList },
  {
    path: "/team-diagnose",
    component: TeamDiagnosePage,
    props: (route) => ({ competitionId: Number(route.query.competitionId) }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;