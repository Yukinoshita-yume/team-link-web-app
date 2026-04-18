<template>
  <div class="review-list-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">待审核申请</h2>
        <span class="count-badge">{{ filteredList.length }} 人</span>
      </div>
      <div class="toolbar-right">
        <label class="select-all-wrap">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
          />
          <span>全选</span>
        </label>
        <div class="sort-group">
          <span class="sort-label">排序：</span>
          <button
            class="sort-btn"
            :class="{ active: sortOrder === 'desc' }"
            @click="setSortOrder('desc')"
          >匹配分↓</button>
          <button
            class="sort-btn"
            :class="{ active: sortOrder === 'asc' }"
            @click="setSortOrder('asc')"
          >匹配分↑</button>
        </div>
        <button
          class="batch-btn"
          :disabled="selectedIds.length === 0"
          @click="onBatchAction"
        >
          批量操作 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="card-grid">
      <ApplicantCard
        v-for="item in sortedList"
        :key="item.id"
        :applicant="item"
        :selected="selectedIds.includes(item.id)"
        @select="toggleSelect(item.id)"
        @click="openDrawer(item)"
      />
    </div>

    <!-- 右侧抽屉 -->
    <AIReviewDrawer
      :visible="drawerVisible"
      :applicant="activeApplicant"
      @close="drawerVisible = false"
      @approve="onApprove"
      @reject="onReject"
      @review="onReview"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ApplicantCard from '@/components/review/ApplicantCard.vue'
import AIReviewDrawer from '@/components/review/AIReviewDrawer.vue'
import { useReviewList } from '@/hooks/useReviewList'

const {
  list,
  selectedIds,
  sortOrder,
  isAllSelected,
  isIndeterminate,
  toggleSelect,
  toggleSelectAll,
  setSortOrder,
  sortedList,
  filteredList,
} = useReviewList()

const drawerVisible = ref(false)
const activeApplicant = ref(null)

function openDrawer(applicant) {
  activeApplicant.value = applicant
  drawerVisible.value = true
}

function onBatchAction() {
  // 预留批量操作接口
  console.log('批量操作 IDs:', selectedIds.value)
}

function onApprove(applicant) {
  console.log('通过:', applicant.id)
  drawerVisible.value = false
}

function onReject(applicant) {
  console.log('拒绝:', applicant.id)
  drawerVisible.value = false
}

function onReview(applicant) {
  console.log('复核:', applicant.id)
  drawerVisible.value = false
}
</script>

<style scoped>
.review-list-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 28px 32px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1d2e;
  margin: 0;
  letter-spacing: -0.3px;
}

.count-badge {
  background: #e8eaf6;
  color: #5c6bc0;
  font-size: 13px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.select-all-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  user-select: none;
}

.select-all-wrap input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #5c6bc0;
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-label {
  font-size: 13px;
  color: #888;
}

.sort-btn {
  padding: 5px 12px;
  font-size: 13px;
  border: 1px solid #d0d3e8;
  border-radius: 6px;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-btn:hover {
  border-color: #5c6bc0;
  color: #5c6bc0;
}

.sort-btn.active {
  background: #5c6bc0;
  border-color: #5c6bc0;
  color: #fff;
}

.batch-btn {
  padding: 6px 16px;
  font-size: 13px;
  border: 1px solid #d0d3e8;
  border-radius: 6px;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.batch-btn:hover:not(:disabled) {
  border-color: #5c6bc0;
  color: #5c6bc0;
}

.batch-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}
</style>
