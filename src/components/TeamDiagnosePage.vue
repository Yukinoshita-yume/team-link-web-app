<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>

    <!-- 顶部导航 -->
    <nav class="nav">
      <button class="nav-back" @click="$router.back()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        返回
      </button>
      <div class="nav-title">队伍诊断报告</div>
    </nav>

    <div class="content">

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrap">
        <div class="loading-spinner"></div>
        <div class="loading-text">AI 正在分析队伍状态…</div>
        <div class="loading-sub">通常需要 3-5 秒，请稍候</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-title">诊断失败</div>
        <div class="error-desc">{{ error }}</div>
        <button class="retry-btn" @click="fetchDiagnose">重新诊断</button>
      </div>

      <!-- 诊断结果 -->
      <template v-else-if="report">

        <!-- 竞赛名称 -->
        <div class="comp-bar" v-if="report.competitionTitle">
          <svg class="comp-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="9" y1="7" x2="15" y2="7"/>
            <line x1="9" y1="11" x2="15" y2="11"/>
            <line x1="9" y1="15" x2="13" y2="15"/>
          </svg>
          {{ report.competitionTitle }}
        </div>

        <!-- 综合评分卡 -->
        <div class="score-card">
          <div class="score-left">
            <div class="score-label">队伍综合评分</div>
            <div class="score-number" :class="scoreClass">{{ report.totalScore }}</div>
          </div>
          <div class="score-right">
            <div class="risk-badge" :class="riskClass">
              <span class="risk-dot"></span>{{ riskText }}
            </div>
            <svg width="108" height="108" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(139,92,246,0.1)" stroke-width="10"/>
              <circle
                  cx="55" cy="55" r="44"
                  fill="none"
                  :stroke="ringColor"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${scoreArc} 276.5`"
                  stroke-dashoffset="69.1"
                  transform="rotate(-90 55 55)"
                  style="transition: stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)"
              />
            </svg>
          </div>
        </div>

        <!-- AI 优化建议 -->
        <div class="card" v-if="report.aiSuggestion">
          <div class="card-title">
            <div class="title-bar bar-green"></div>
            AI 优化建议
          </div>
          <div class="suggestion-box">
            <div class="suggestion-icon">💡</div>
            <div class="suggestion-text" style="white-space: pre-line">{{ report.aiSuggestion }}</div>
          </div>
        </div>

        <!-- 技能缺口 -->
        <div class="card" v-if="hasSkillGaps">
          <div class="card-title">
            <div class="title-bar bar-orange"></div>
            技能缺口分析
            <span class="badge-count">{{ totalGapCount }} 项</span>
          </div>

          <div class="recruit-section" v-if="report.skillGap.criticalGaps && report.skillGap.criticalGaps.length > 0">
            <div class="recruit-label recruit-label-red">🚨 急需补招</div>
            <div class="tag-cloud">
              <span class="recruit-tag tag-critical" v-for="gap in report.skillGap.criticalGaps" :key="gap.skillName">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ gap.skillName }}
              </span>
            </div>
          </div>

          <div class="recruit-section" v-if="report.skillGap.moderateGaps && report.skillGap.moderateGaps.length > 0">
            <div class="recruit-label recruit-label-amber">⚠️ 建议加强</div>
            <div class="tag-cloud">
              <span class="recruit-tag tag-moderate" v-for="gap in report.skillGap.moderateGaps" :key="gap.skillName">
                {{ gap.skillName }}
              </span>
            </div>
          </div>

          <div class="gap-list">
            <div class="gap-item" v-for="(gap, idx) in allGaps" :key="idx">
              <div class="gap-header" @click="toggleGap(idx)">
                <div class="gap-left">
                  <span class="gap-badge"
                        :class="{
                      'badge-critical': gap.gapLevel === 'CRITICAL',
                      'badge-moderate': gap.gapLevel === 'MODERATE',
                      'badge-minor':    gap.gapLevel === 'MINOR'
                    }">
                    {{ gapLevelText(gap.gapLevel) }}
                  </span>
                  <span class="gap-name">{{ gap.skillName }}</span>
                </div>
                <svg class="gap-arrow" :class="{ open: expandedGaps[idx] }"
                     width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div class="gap-reason" v-if="expandedGaps[idx]">
                <div>{{ gap.suggestion }}</div>
                <div class="gap-covered" v-if="gap.coveredByMembers && gap.coveredByMembers.length > 0">
                  当前覆盖：{{ gap.coveredByMembers.join('、') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间冲突检测 -->
        <div class="card" v-if="report.timeConflict">
          <div class="card-title">
            <div class="title-bar bar-red"></div>
            时间冲突检测
            <span class="badge-warn" v-if="report.timeConflict.highRisk">高风险</span>
          </div>

          <div class="time-summary">
            <div class="overlap-box" :class="report.timeConflict.highRisk ? 'overlap-danger' : 'overlap-ok'">
              <div class="overlap-hours">{{ report.timeConflict.weeklyOverlapHours }}<span class="overlap-unit">h</span></div>
              <div class="overlap-label">全队每周重叠可用时间</div>
            </div>
          </div>

          <div v-if="report.timeConflict.highRiskMembers && report.timeConflict.highRiskMembers.length > 0">
            <div class="sub-label">⚠️ 高风险成员</div>
            <div class="heatmap-list">
              <div class="heatmap-item" v-for="m in report.timeConflict.highRiskMembers" :key="m.userId">
                <div class="heatmap-name">{{ m.userName }}</div>
                <div class="heatmap-bar-wrap">
                  <div class="heatmap-bar" :class="busyLevelClass(m.busyLevel)"
                       :style="{ width: busyLevelWidth(m.busyLevel) }"></div>
                </div>
                <div class="heatmap-label" :class="busyLevelClass(m.busyLevel)">
                  {{ busyLevelText(m.busyLevel) }} · {{ m.weeklyHours }}h/周
                </div>
              </div>
            </div>
          </div>

          <div v-if="report.timeConflict.upcomingWarnings && report.timeConflict.upcomingWarnings.length > 0" style="margin-top: 14px">
            <div class="sub-label">📅 近期不可用预警</div>
            <div class="warning-list">
              <div class="warning-item" v-for="(w, i) in report.timeConflict.upcomingWarnings" :key="i">
                <div class="warning-user">{{ w.userName }}</div>
                <div class="warning-date">{{ w.startDate }} ~ {{ w.endDate }}</div>
                <div class="warning-reason" v-if="w.reason">{{ w.reason }}</div>
              </div>
            </div>
          </div>

          <div v-if="!report.timeConflict.highRisk && (!report.timeConflict.highRiskMembers || report.timeConflict.highRiskMembers.length === 0)"
               class="all-ok-tip">
            ✅ 全队时间安排良好，无明显冲突
          </div>
        </div>

        <!-- 经验 & 角色覆盖 -->
        <div class="card" v-if="report.experienceRole">
          <div class="card-title">
            <div class="title-bar bar-indigo"></div>
            经验 & 角色覆盖
          </div>

          <div class="exp-grid">
            <div class="exp-stat">
              <div class="exp-num">{{ report.experienceRole.avgCompetitionScore?.toFixed(1) ?? '--' }}</div>
              <div class="exp-label">竞赛经验均分</div>
            </div>
            <div class="exp-stat">
              <div class="exp-num" :class="report.experienceRole.hasSimilarTypeExperience ? 'stat-ok' : 'stat-miss'">
                {{ report.experienceRole.hasSimilarTypeExperience ? '有' : '无' }}
              </div>
              <div class="exp-label">同类竞赛经历</div>
            </div>
            <div class="exp-stat">
              <div class="exp-num" :class="report.experienceRole.hasLeaderExperience ? 'stat-ok' : 'stat-miss'">
                {{ report.experienceRole.hasLeaderExperience ? '有' : '无' }}
              </div>
              <div class="exp-label">领队经历</div>
            </div>
          </div>

          <div v-if="report.experienceRole.roleCoverages && report.experienceRole.roleCoverages.length > 0">
            <div class="sub-label">🎭 角色覆盖情况</div>
            <div class="role-grid">
              <div class="role-item" v-for="rc in report.experienceRole.roleCoverages" :key="rc.roleName"
                   :class="{
                  'role-covered': rc.status === 'COVERED',
                  'role-weak':    rc.status === 'WEAK',
                  'role-missing': rc.status === 'MISSING'
                }">
                <div class="role-icon">
                  {{ rc.status === 'COVERED' ? '✅' : rc.status === 'WEAK' ? '⚠️' : '❌' }}
                </div>
                <div class="role-name">{{ rc.roleName }}</div>
                <div class="role-members" v-if="rc.coveredByMembers && rc.coveredByMembers.length > 0">
                  {{ rc.coveredByMembers.join('、') }}
                </div>
                <div class="role-remark" v-if="rc.remark">{{ rc.remark }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 重新诊断 -->
        <button class="rediag-btn" @click="fetchDiagnose" :disabled="loading">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          重新诊断
        </button>

      </template>
    </div>
  </div>
</template>

<script>
import { diagnoseTeamApi } from "@/api/api.js";

export default {
  name: "TeamDiagnosePage",

  props: {
    competitionId: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      error: null,
      report: null,
      expandedGaps: {},
    };
  },

  computed: {
    scoreClass() {
      if (!this.report) return "";
      if (this.report.totalScore >= 75) return "score-high";
      if (this.report.totalScore >= 50) return "score-mid";
      return "score-low";
    },
    riskClass() {
      if (!this.report) return "";
      const map = { LOW: "risk-low", MEDIUM: "risk-mid", HIGH: "risk-high" };
      return map[this.report.riskLevel] || "risk-mid";
    },
    riskText() {
      if (!this.report) return "";
      const map = { LOW: "低风险", MEDIUM: "中等风险", HIGH: "高风险" };
      return map[this.report.riskLevel] || "未知";
    },
    ringColor() {
      if (!this.report) return "#8b5cf6";
      if (this.report.totalScore >= 75) return "#10b981";
      if (this.report.totalScore >= 50) return "#f59e0b";
      return "#ef4444";
    },
    scoreArc() {
      if (!this.report) return 0;
      return ((this.report.totalScore || 0) / 100) * 276.5;
    },
    allGaps() {
      if (!this.report?.skillGap) return [];
      return [
        ...(this.report.skillGap.criticalGaps || []),
        ...(this.report.skillGap.moderateGaps || []),
        ...(this.report.skillGap.minorGaps    || []),
      ];
    },
    hasSkillGaps() {
      return this.allGaps.length > 0;
    },
    totalGapCount() {
      return this.allGaps.length;
    },
  },

  mounted() {
    this.fetchDiagnose();
  },

  methods: {
    async fetchDiagnose() {
      this.loading = true;
      this.error = null;
      this.report = null;
      this.expandedGaps = {};
      try {
        const res = await diagnoseTeamApi(this.competitionId);
        if (res && res.totalScore !== undefined) {
          this.report = res;
        } else if (res && res.code === 0) {
          this.report = res.data;
        } else {
          this.error = (res && (res.msg || res.message)) || "诊断失败，请稍后重试";
        }
      } catch (e) {
        this.error = e?.response?.data || "网络错误，请检查连接后重试";
      } finally {
        this.loading = false;
      }
    },

    toggleGap(idx) {
      this.expandedGaps = {
        ...this.expandedGaps,
        [idx]: !this.expandedGaps[idx],
      };
    },

    gapLevelText(level) {
      const map = { CRITICAL: "严重", MODERATE: "一般", MINOR: "轻微" };
      return map[level] || level;
    },

    busyLevelClass(level) {
      const map = { BUSY: "busy-high", NORMAL: "busy-low", FREE: "busy-free" };
      return map[level] || "busy-unknown";
    },

    busyLevelWidth(level) {
      const map = { BUSY: "88%", NORMAL: "40%", FREE: "15%" };
      return map[level] || "10%";
    },

    busyLevelText(level) {
      const map = { BUSY: "繁忙", NORMAL: "正常", FREE: "空闲" };
      return map[level] || level || "未知";
    },
  },
};
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%);
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* 背景光晕 */
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 500px; height: 500px; background: rgba(167,139,250,0.15); top: -120px; right: -80px; }
.blob2 { width: 400px; height: 400px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }

/* 导航 */
.nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 24px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-back {
  display: flex; align-items: center; gap: 6px;
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.15);
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 13px; font-weight: 600; color: #7c3aed;
  cursor: pointer; transition: all 0.2s;
}
.nav-back:hover { background: rgba(139,92,246,0.13); transform: translateX(-2px); }
.nav-title {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 17px; font-weight: 800; color: #1a1028;
}

/* 内容区 */
.content {
  position: relative; z-index: 1;
  max-width: 680px; margin: 0 auto;
  padding: 20px 16px 60px;
  display: flex; flex-direction: column; gap: 16px;
}

/* 竞赛名称栏 */
.comp-bar {
  background: rgba(139,92,246,0.07);
  border: 1px solid rgba(139,92,246,0.12);
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px; font-weight: 600; color: #5b21b6;
  display: flex; align-items: center; gap: 10px;
}
.comp-bar-icon { width: 18px; height: 18px; flex-shrink: 0; color: #8b5cf6; }

/* 加载状态 */
.loading-wrap { text-align: center; padding: 60px 20px; }
.loading-spinner {
  width: 44px; height: 44px;
  border: 3px solid rgba(139,92,246,0.15);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 18px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 16px; font-weight: 700; color: #333; margin-bottom: 4px; }
.loading-sub { font-size: 13px; color: #aaa; }

/* 错误状态 */
.error-card {
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 20px; padding: 40px 24px;
  text-align: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06);
}
.error-icon { font-size: 40px; margin-bottom: 12px; }
.error-title { font-size: 17px; font-weight: 700; color: #dc2626; margin-bottom: 8px; }
.error-desc { font-size: 14px; color: #666; margin-bottom: 20px; }
.retry-btn {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border: none; border-radius: 14px;
  padding: 11px 28px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.retry-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(109,40,217,0.3); }

/* 通用卡片 */
.card {
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 20px; padding: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06);
}
.card-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700; color: #1a1028;
  margin-bottom: 16px;
}
.title-bar { width: 3px; height: 16px; border-radius: 2px; flex-shrink: 0; }
.bar-purple { background: linear-gradient(180deg, #8b5cf6, #6d28d9); }
.bar-green  { background: linear-gradient(180deg, #10b981, #059669); }
.bar-orange { background: linear-gradient(180deg, #f59e0b, #d97706); }
.bar-red    { background: linear-gradient(180deg, #ef4444, #dc2626); }
.bar-indigo { background: linear-gradient(180deg, #a855f7, #7c3aed); }

/* 评分卡 */
.score-card {
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 20px; padding: 24px 22px;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.score-label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.score-number { font-size: 60px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
.score-high { color: #10b981; }
.score-mid  { color: #f59e0b; }
.score-low  { color: #ef4444; }
.score-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

.risk-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 600;
}
.risk-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: 0.8; }
.risk-low  { background: rgba(16,185,129,0.1); color: #059669; }
.risk-mid  { background: rgba(245,158,11,0.1);  color: #d97706; }
.risk-high { background: rgba(239,68,68,0.1);   color: #dc2626; }

/* 优化建议 */
.suggestion-box {
  display: flex; gap: 14px;
  background: rgba(139,92,246,0.05);
  border: 1px solid rgba(139,92,246,0.1);
  border-radius: 14px; padding: 16px;
}
.suggestion-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.suggestion-text { font-size: 14px; line-height: 1.85; color: #444; }

/* 技能缺口 */
.badge-count {
  background: rgba(239,68,68,0.1); color: #dc2626;
  padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: 600;
}
.recruit-section { margin-bottom: 12px; }
.recruit-label { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.recruit-label-red   { color: #dc2626; }
.recruit-label-amber { color: #d97706; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
.recruit-tag {
  display: inline-flex; align-items: center; gap: 5px;
  border-radius: 20px; padding: 5px 13px;
  font-size: 12px; font-weight: 600;
}
.tag-critical { background: rgba(239,68,68,0.07); color: #dc2626; border: 1px solid rgba(239,68,68,0.18); }
.tag-moderate { background: rgba(245,158,11,0.07); color: #d97706; border: 1px solid rgba(245,158,11,0.18); }

.gap-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.gap-item {
  border: 1px solid rgba(139,92,246,0.1);
  border-radius: 12px; overflow: hidden;
  background: rgba(245,243,255,0.4);
}
.gap-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; cursor: pointer; transition: background 0.2s;
}
.gap-header:hover { background: rgba(139,92,246,0.05); }
.gap-left { display: flex; align-items: center; gap: 8px; }
.gap-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px; }
.badge-critical { background: rgba(239,68,68,0.1); color: #dc2626; }
.badge-moderate { background: rgba(245,158,11,0.1); color: #d97706; }
.badge-minor    { background: rgba(99,102,241,0.1); color: #4f46e5; }
.gap-name { font-size: 14px; font-weight: 600; color: #333; }
.gap-arrow { color: #c4b5fd; transition: transform 0.25s; flex-shrink: 0; }
.gap-arrow.open { transform: rotate(180deg); }
.gap-reason {
  padding: 10px 16px 14px;
  font-size: 13px; color: #666; line-height: 1.65;
  background: rgba(139,92,246,0.03);
  border-top: 1px solid rgba(139,92,246,0.07);
}
.gap-covered { margin-top: 6px; font-size: 12px; color: #10b981; font-weight: 500; }

/* 时间冲突 */
.badge-warn {
  background: rgba(239,68,68,0.1); color: #dc2626;
  padding: 2px 9px; border-radius: 10px; font-size: 12px; font-weight: 700;
}
.time-summary { margin-bottom: 16px; }
.overlap-box {
  display: flex; flex-direction: column; align-items: center;
  padding: 18px; border-radius: 14px;
}
.overlap-ok     { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.15); }
.overlap-danger { background: rgba(239,68,68,0.06);  border: 1px solid rgba(239,68,68,0.15); }
.overlap-hours { font-size: 44px; font-weight: 800; line-height: 1; }
.overlap-ok     .overlap-hours { color: #10b981; }
.overlap-danger .overlap-hours { color: #ef4444; }
.overlap-unit { font-size: 20px; font-weight: 600; }
.overlap-label { font-size: 12px; color: #888; margin-top: 4px; }

.sub-label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px; }

.heatmap-list { display: flex; flex-direction: column; gap: 12px; }
.heatmap-item { display: flex; align-items: center; gap: 10px; }
.heatmap-name {
  width: 68px; font-size: 13px; color: #444; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;
}
.heatmap-bar-wrap {
  flex: 1; height: 8px;
  background: rgba(139,92,246,0.08);
  border-radius: 4px; overflow: hidden;
}
.heatmap-bar { height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(.34,1.56,.64,1); }
.busy-high    { background: #ef4444; color: #ef4444; }
.busy-low     { background: #10b981; color: #059669; }
.busy-free    { background: #8b5cf6; color: #7c3aed; }
.busy-unknown { background: #d1d5db; color: #9ca3af; }
.heatmap-label { font-size: 11px; font-weight: 600; min-width: 80px; text-align: right; flex-shrink: 0; }

.warning-list { display: flex; flex-direction: column; gap: 8px; }
.warning-item {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(245,158,11,0.05);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 12px;
}
.warning-user   { font-size: 13px; font-weight: 700; color: #333; }
.warning-date   { font-size: 12px; color: #d97706; font-weight: 500; }
.warning-reason { font-size: 12px; color: #888; }

.all-ok-tip {
  padding: 14px 16px;
  background: rgba(16,185,129,0.07);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 12px;
  font-size: 14px; color: #059669; font-weight: 500; text-align: center;
}

/* 经验 & 角色 */
.exp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
.exp-stat {
  background: rgba(245,243,255,0.6);
  border: 1px solid rgba(139,92,246,0.1);
  border-radius: 14px; padding: 14px 8px; text-align: center;
}
.exp-num { font-size: 22px; font-weight: 800; color: #7c3aed; line-height: 1; margin-bottom: 4px; }
.stat-ok   { color: #10b981; }
.stat-miss { color: #ef4444; }
.exp-label { font-size: 11px; color: #888; }

.role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-top: 10px; }
.role-item { border-radius: 14px; padding: 14px 12px; text-align: center; border: 1px solid transparent; }
.role-covered { background: rgba(16,185,129,0.06);  border-color: rgba(16,185,129,0.15); }
.role-weak    { background: rgba(245,158,11,0.06);  border-color: rgba(245,158,11,0.2); }
.role-missing { background: rgba(239,68,68,0.05);   border-color: rgba(239,68,68,0.15); }
.role-icon    { font-size: 18px; margin-bottom: 6px; }
.role-name    { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px; }
.role-members { font-size: 11px; color: #888; line-height: 1.4; }
.role-remark  { font-size: 11px; color: #d97706; margin-top: 4px; }

/* 重新诊断按钮 */
.rediag-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 20px; border-radius: 20px;
  background: rgba(255,255,255,0.78);
  border: 1.5px solid rgba(139,92,246,0.25);
  color: #7c3aed; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  backdrop-filter: blur(8px);
}
.rediag-btn:hover:not(:disabled) {
  background: rgba(139,92,246,0.07);
  border-color: rgba(139,92,246,0.45);
  transform: translateY(-1px);
}
.rediag-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 600px) {
  .nav { padding: 12px 16px; }
  .exp-grid { grid-template-columns: repeat(2, 1fr); }
  .score-number { font-size: 46px; }
  .content { padding: 14px 12px 60px; gap: 12px; }
}
</style>