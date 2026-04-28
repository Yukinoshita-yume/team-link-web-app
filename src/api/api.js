import axios from "axios";
import * as url from "./config";
import { getToken } from "@/utils/auth";
import {
  BASE_URL,
  CREATOR_URL,
  LOGIN_URL,
  REGISTER_URL,
  SELECTPAGE_URL,
  SEND_CODE_URL,
  USERINFO_URL,
  CREATECOMPETITION_URL,
  APPLYCOMPETITION_URL,
  JOINCOMPETITION_URL,
  ALLMEMBERS_URL,
  COMPETITIONDETAIL_URL,
  PROFILE_CARD_URL,
  PROFILE_SKILL_TAGS_URL,
  PROFILE_APPLY_TEXT_URL,
  TEAM_DIAGNOSE_URL,
  APPLICATION_AI_REVIEW_URL,
  ALLREGISTEREDCOMPETITIONS,
  NOTIFICATION_COUNTS_URL,
  MARK_REVIEWED_URL,
  DIRECT_SEND_URL,
  DIRECT_CONVERSATION_URL,
  DIRECT_SESSIONS_URL,
  DIRECT_UNREAD_URL,
} from "./config";


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
    async (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      return Promise.reject(error);
    },
);

export async function selectPageApi(page, pageSize, content) {
  try {
    const response = await api.post(SELECTPAGE_URL, {
      page,
      pageSize,
      content,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function loginApi(userEmail, userPassword) {
  try {
    const response = await api.post(LOGIN_URL, { userEmail, userPassword });
    return response;
  } catch (error) {
    throw error;
  }
}
export async function userInfoApi() {
  try {
    const response = await api.get(USERINFO_URL);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function sendCodeApi(userEmail) {
  try {
    const response = await api.post(SEND_CODE_URL, { userEmail });
    return response;
  } catch (error) {
    throw error;
  }
}
export async function sendResetCodeApi(userEmail) {
  try {
    const response = await api.post(url.SEND_RESET_CODE_URL, { userEmail });
    return response;
  } catch (error) {
    throw error;
  }
}
export async function registerApi(userName, userPassword, userEmail, code) {
  try {
    const response = await api.post(REGISTER_URL, {
      userName,
      userPassword,
      userEmail,
      code,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
export async function changePasswordApi(
    userEmail,
    newPassword,
    confirmPassword,
    code,
) {
  try {
    const response = await api.put(url.CHANGE_PASSWORD_URL, {
      userEmail,
      newPassword,
      confirmPassword,
      code,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// 创建比赛
export async function createCompetitionApi(competitionData) {
  try {
    const response = await api.post(CREATECOMPETITION_URL, competitionData);
    return response;
  } catch (error) {
    throw error;
  }
}

// 报名竞赛
export async function applyCompetitionApi(competitionId, userId) {
  try {
    const response = await api.post(APPLYCOMPETITION_URL, {
      competitionId,
      userId,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// 加入竞赛
export async function joinCompetitionApi(competitionId, userId) {
  try {
    const response = await api.post(JOINCOMPETITION_URL, {
      competitionId,
      userId,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

//查询竞赛参与者
export async function allMembersApi(params) {
  try {
    const response = await api.get(ALLMEMBERS_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//查询竞赛创建者
export async function creatorApi(params) {
  try {
    const response = await api.get(CREATOR_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

// 查询竞赛详细信息
export async function competitionDetailApi(params) {
  try {
    const response = await api.get(COMPETITIONDETAIL_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//更新用户的信息
export async function updateApi(user) {
  try {
    const response = await api.put(url.UPDATE_URL, user);
    return response;
  } catch (error) {
    throw error;
  }
}

//检查当前用户是否报名当前竞赛
export async function checkApplicationApi(params) {
  try {
    const response = await api.get(url.CHECK_APPLICATION_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//取消报名当前竞赛
export async function cancelRegistrationApi(params) {
  try {
    const response = await api.delete(url.CANCEL_REGISTRATION_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取用户信息
export async function memberMessageApi(params) {
  try {
    const response = await api.get(url.MEMBER_MESSAGE_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取所有申请报名信息
export async function unadmittedMembersApi(params) {
  try {
    const response = await api.get(url.UADMITTED_MEMBERS_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取用户参与的竞赛
export async function allAppliedCompetitionsApi(params) {
  try {
    const response = await api.get(url.ALLAPPLIEDCOMPETITIONS, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取用户创建的竞赛
export async function allCreatedCompetitionsApi(params) {
  try {
    const response = await api.get(url.ALLCREATEDCOMPETITIONS, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取用户报名但尚未审核通过的竞赛（admission_status=0）
export async function allRegisteredCompetitionsApi(params) {
  try {
    const response = await api.get(ALLREGISTEREDCOMPETITIONS, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//获取未读消息数和待审核报名数
export async function notificationCountsApi(params) {
  try {
    const response = await api.get(NOTIFICATION_COUNTS_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//队长打开审核页时标记所有待审核申请为"已查看"，清除红点
export async function markReviewedApi(params) {
  try {
    const response = await api.put(MARK_REVIEWED_URL, null, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//将信息标记为已读
export async function readApi(params) {
  try {
    const response = await api.put(url.READ_URL, null, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//生成消息
export async function createMessageApi(message) {
  try {
    const response = await api.post(url.CREATE_MESSAGE_URL, message);
    return response;
  } catch (error) {
    throw error;
  }
}

//查询其他用户信息
export async function userInfoByIdApi(params) {
  try {
    const response = await api.get(url.USERINFO_BYID_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

//解散队伍
export async function deleteCompetitioinApi(params) {
  try {
    const response = await api.delete(url.DELETE_COMPETITION_URL, { params });
    return response;
  } catch (error) {
    throw error;
  }
}

// AI 自然语言搜索
export async function aiSearchApi(query) {
  try {
    const response = await api.get("/index/aiSearch", { params: { q: query } });
    return response;
  } catch (error) {
    throw error;
  }
}

// 获取当前登录用户的能力卡片
export async function getCompetenceCardApi() {
  try {
    const response = await api.get(PROFILE_CARD_URL);
    return response;
  } catch (error) {
    throw error;
  }
}

// 全量保存能力卡片（覆盖）
export async function saveCompetenceCardApi(card) {
  try {
    const response = await api.put(PROFILE_CARD_URL, card);
    return response;
  } catch (error) {
    throw error;
  }
}

// 手动修正技能标签
export async function updateSkillTagsApi(skillTags) {
  try {
    const response = await api.put(PROFILE_SKILL_TAGS_URL, { skillTags });
    return response;
  } catch (error) {
    throw error;
  }
}

// 队伍诊断 API
export async function diagnoseTeamApi(competitionId) {
  try {
    const response = await api.post(TEAM_DIAGNOSE_URL, { competitionId });
    return response;
  } catch (error) {
    throw error;
  }
}

// 申请人 AI 初筛
export async function aiReviewApplicationApi(competitionId, applicantUserId) {
  try {
    const response = await api.post(
      `${APPLICATION_AI_REVIEW_URL}/${applicantUserId}/ai-review`,
      null,
      { params: { competitionId } },
    );
    return response;
  } catch (error) {
    throw error;
  }
}

// 申请通过（加入队伍）
export async function approveApplicationApi(competitionId, applicantUserId) {
  try {
    const response = await api.post(
      `${APPLICATION_AI_REVIEW_URL}/${applicantUserId}/approve`,
      null,
      { params: { competitionId } },
    );
    return response;
  } catch (error) {
    throw error;
  }
}
// ────────────── 私信相关 ──────────────

// 发送私信
export async function sendDirectMessageApi(senderId, receiverId, content) {
  try {
    const response = await api.post(DIRECT_SEND_URL, { senderId, receiverId, content });
    return response;
  } catch (error) { throw error; }
}

// 查询与某人的对话记录（同时标记已读）
export async function getConversationApi(params) {
  try {
    const response = await api.get(DIRECT_CONVERSATION_URL, { params });
    return response;
  } catch (error) { throw error; }
}

// 查询我的私信会话列表
export async function getChatSessionsApi(params) {
  try {
    const response = await api.get(DIRECT_SESSIONS_URL, { params });
    return response;
  } catch (error) { throw error; }
}

// 查询私信未读总数
export async function getUnreadDirectCountApi(params) {
  try {
    const response = await api.get(DIRECT_UNREAD_URL, { params });
    return response;
  } catch (error) { throw error; }
}
