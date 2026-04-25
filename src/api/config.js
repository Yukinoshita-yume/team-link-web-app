export const BASE_URL='http://localhost:8080';
// 用户认证相关
export const LOGIN_URL = '/user/login';
export const REGISTER_URL = '/user/register';
export const CHANGE_PASSWORD_URL = '/user/changePassword';
export const SEND_CODE_URL = '/auth/send-code';
export const SEND_RESET_CODE_URL= '/auth/sendResetCode';

// 用户信息相关
export const USERINFO_URL = '/user/userInfo';
export const UPDATE_URL = '/user/update';
export const USERINFO_BYID_URL = '/user/userInfoById';

// 比赛/活动相关
export const CREATECOMPETITION_URL = '/index/createCompetition';
export const APPLYCOMPETITION_URL = '/index/applyCompetition';
export const JOINCOMPETITION_URL = '/index/joinCompetition';
export const COMPETITIONDETAIL_URL = '/index/competitionDetail';
export const CHECK_APPLICATION_URL = '/index/checkApplication';
export const CANCEL_REGISTRATION_URL = '/index/cancelRegistration';
export const CREATOR_URL = '/index/creator';
export const DELETE_COMPETITION_URL = '/index/deleteCompetitioin';

// 页面数据获取
export const SELECTPAGE_URL = '/index/selectPage';
export const ALLMEMBERS_URL = '/index/allMembers';
export const ALLCREATEDCOMPETITIONS = '/index/allCreatedCompetitions';
export const ALLAPPLIEDCOMPETITIONS = '/index/allAppliedCompetitions';

// 消息相关
export const MEMBER_MESSAGE_URL = '/message/memberMessage';
export const UADMITTED_MEMBERS_URL = '/message/unadmittedMembers';
export const READ_URL = '/message/read';
export const CREATE_MESSAGE_URL = '/message/createMessage';

// 用户画像相关
export const PROFILE_CARD_URL = '/user/profile/competence-card';
export const PROFILE_SKILL_TAGS_URL = '/user/profile/skill-tags';
export const PROFILE_APPLY_TEXT_URL = '/user/profile/apply-text-analysis';

// 报名审核相关
export const APPLICATION_AI_REVIEW_URL = '/api/applications';

// 队伍诊断
export const TEAM_DIAGNOSE_URL = '/api/diagnosis/team';