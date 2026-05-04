<template>
  <transition name="drawer">
    <div v-if="visible" class="drawer-overlay" @click.self="$emit('close')">
      <div class="drawer-panel">
        <!-- 头部 -->
        <div class="drawer-header">
          <div class="drawer-title">
            <span class="title-text">AI 初筛结果</span>
            <span v-if="applicant" class="title-name">· {{ applicant.name }}</span>
          </div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <!-- 内容区 -->
        <div v-if="applicant" class="drawer-body">
          <!-- 综合评分 -->
          <div class="section score-section">
            <div class="section-label">综合评分</div>
            <div class="big-score-row">
              <span class="big-score" :style="{ color: scoreColor }">
                {{ applicant.score }}
              </span>
              <div class="score-right">
                <div class="score-ring-wrap">
                  <svg viewBox="0 0 64 64" width="64" height="64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#f0f0f0" stroke-width="6"/>
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none"
                      :stroke="scoreColor"
                      stroke-width="6"
                      stroke-linecap="round"
                      :stroke-dasharray="`${(applicant.score / 100) * 163.4} 163.4`"
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                </div>
                <span class="score-desc" :style="{ color: scoreColor }">{{ scoreDesc }}</span>
              </div>
            </div>
          </div>

          <!-- 雷达图 -->
          <div class="section">
            <div class="section-label">维度评分</div>
            <RadarChart :dimensions="applicant.dimensions" />
          </div>

          <!-- 亮点 -->
          <div class="section" v-if="applicant.highlights?.length">
            <div class="section-label">✅ 候选人亮点</div>
            <ul class="point-list positive">
              <li v-for="(item, i) in applicant.highlights" :key="i" class="point-item">
                <span class="point-dot"></span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 风险点 -->
          <div class="section" v-if="applicant.risks?.length">
            <div class="section-label">⚠️ 风险提示</div>
            <ul class="point-list negative">
              <li v-for="(item, i) in applicant.risks" :key="i" class="point-item">
                <span class="point-dot"></span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 建议面试问题 -->
          <div class="section" v-if="applicant.interviewQuestions?.length">
            <div class="section-label">💬 建议面试问题</div>
            <ol class="question-list">
              <li v-for="(q, i) in applicant.interviewQuestions" :key="i" class="question-item">
                {{ q }}
              </li>
            </ol>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="drawer-footer">
          <button class="footer-btn btn-approve" v-if="(!applicant.status)&&!props.isFull" @click="$emit('approve', applicant)">
            通过
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import RadarChart from '@/components/review/RadarChart.vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  applicant: {
    type: Object,
    default: null,
  },
  isFull: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['close', 'approve'])

const scoreColor = computed(() => {
  if (!props.applicant) return '#aaa'
  const s = props.applicant.score
  if (s >= 80) return '#26a69a'
  if (s >= 60) return '#ffa726'
  return '#ef5350'
})

const scoreDesc = computed(() => {
  if (!props.applicant) return ''
  const s = props.applicant.score
  if (s >= 85) return '强烈推荐'
  if (s >= 75) return '推荐面试'
  if (s >= 60) return '可考虑'
  return '不推荐'
})
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 460px;
  max-width: 100vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 过渡动画 */
.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: background 0.28s;
}

.drawer-enter-from,
.drawer-leave-to {
  background: rgba(0, 0, 0, 0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 18px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.drawer-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.title-text {
  font-size: 17px;
  font-weight: 700;
  color: #1a1d2e;
}

.title-name {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #e8eaf6;
  color: #5c6bc0;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.drawer-body::-webkit-scrollbar {
  width: 4px;
}

.drawer-body::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 12px;
}

.score-section {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 16px 20px;
}

.big-score-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.big-score {
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
}

.score-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.score-desc {
  font-size: 13px;
  font-weight: 700;
}

.point-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.positive .point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #26a69a;
  flex-shrink: 0;
  margin-top: 6px;
}

.negative .point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffa726;
  flex-shrink: 0;
  margin-top: 6px;
}

.question-list {
  padding-left: 18px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-item {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}

.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.footer-btn {
  flex: 1;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.footer-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.footer-btn:active {
  transform: translateY(0);
}

.btn-approve {
  background: #26a69a;
  color: #fff;
}

</style>