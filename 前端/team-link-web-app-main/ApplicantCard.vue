<template>
  <div
    class="applicant-card"
    :class="{ 'is-selected': selected }"
    @click.self="$emit('click')"
  >
    <!-- checkbox 区域，阻止冒泡避免重复触发 -->
    <label class="card-checkbox" @click.stop>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('select')"
      />
    </label>

    <!-- 头像 + 姓名 -->
    <div class="card-header" @click="$emit('click')">
      <div class="avatar" :style="{ background: avatarColor }">
        {{ nameInitial }}
      </div>
      <div class="name-block">
        <span class="name">{{ applicant.name }}</span>
        <span class="tag" :style="{ background: statusTagStyle.bg, color: statusTagStyle.color }">
          {{ applicant.status || '待审核' }}
        </span>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="card-meta" @click="$emit('click')">
      <span class="meta-item">
        <i class="meta-icon">🎂</i>{{ applicant.age }} 岁
      </span>
      <span class="meta-item">
        <i class="meta-icon">💼</i>{{ applicant.position }}
      </span>
      <span class="meta-item">
        <i class="meta-icon">📍</i>{{ applicant.location || '未填写' }}
      </span>
    </div>

    <!-- 匹配分 - 重点展示 -->
    <div class="score-block" @click="$emit('click')">
      <div class="score-label">AI 匹配分</div>
      <div class="score-row">
        <span class="score-value" :style="{ color: scoreColor }">
          {{ applicant.score }}
        </span>
        <div class="score-bar-wrap">
          <div
            class="score-bar-fill"
            :style="{ width: applicant.score + '%', background: scoreColor }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 亮点标签 -->
    <div v-if="applicant.highlights?.length" class="highlights" @click="$emit('click')">
      <span
        v-for="tag in applicant.highlights.slice(0, 3)"
        :key="tag"
        class="highlight-tag"
      >{{ tag }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  applicant: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click', 'select'])

const AVATAR_COLORS = [
  '#5c6bc0', '#26a69a', '#ec407a', '#ff7043', '#ab47bc',
  '#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#8d6e63',
]

const avatarColor = computed(() => {
  const idx = props.applicant.name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
})

const nameInitial = computed(() => props.applicant.name.slice(0, 1))

const scoreColor = computed(() => {
  const s = props.applicant.score
  if (s >= 80) return '#26a69a'
  if (s >= 60) return '#ffa726'
  return '#ef5350'
})

const statusTagStyle = computed(() => {
  const map = {
    待审核: { bg: '#e8eaf6', color: '#5c6bc0' },
    已通过: { bg: '#e8f5e9', color: '#2e7d32' },
    已拒绝: { bg: '#ffebee', color: '#c62828' },
    复核中: { bg: '#fff3e0', color: '#e65100' },
  }
  return map[props.applicant.status] || map['待审核']
})
</script>

<style scoped>
.applicant-card {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.applicant-card:hover {
  box-shadow: 0 8px 24px rgba(92, 107, 192, 0.15);
  transform: translateY(-2px);
  border-color: #c5cae9;
}

.applicant-card.is-selected {
  border-color: #5c6bc0;
  background: #f8f9ff;
  box-shadow: 0 4px 16px rgba(92, 107, 192, 0.2);
}

.card-checkbox {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
}

.card-checkbox input[type='checkbox'] {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #5c6bc0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 12px;
  color: #777;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-style: normal;
  font-size: 13px;
}

.score-block {
  margin-bottom: 14px;
}

.score-label {
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  min-width: 52px;
}

.score-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.highlight-tag {
  font-size: 11px;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 3px 9px;
  border-radius: 20px;
  font-weight: 500;
}
</style>
