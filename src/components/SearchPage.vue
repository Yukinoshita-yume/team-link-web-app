<template>
  <div id="page-wrap">
    <div class="bg-orb orb1"></div>
    <div class="bg-orb orb2"></div>
    <div class="bg-orb orb3"></div>

    <!-- Hero（未搜索） -->
    <transition name="hero-fade">
      <div id="hero" v-if="!searched && !loading">
        <button class="back-btn" @click="goBack">← 返回</button>
        <div id="hero-content">
          <div id="ai-badge"><span class="badge-dot"></span>AI 智能匹配</div>
          <h1 id="hero-title">找到最适合你的<br />竞赛队伍</h1>
          <p id="hero-sub">用自然语言描述你的技能和需求，AI 为你精准推荐</p>
          <div id="hero-search-wrap">
            <input
              type="text"
              id="hero-input"
              v-model="query"
              placeholder="例：找需要 Java + Vue 的计算机设计赛"
              @keydown.enter="search"
              autocomplete="off"
            />
            <button id="hero-search-btn" @click="search" :disabled="loading">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
          <div id="quick-tags">
            <span
              class="quick-tag"
              v-for="tag in quickTags"
              :key="tag"
              @click="quickSearch(tag)"
              >{{ tag }}</span
            >
          </div>
        </div>
      </div>
    </transition>

    <!-- 顶部 bar（搜索后） -->
    <transition name="bar-slide">
      <div id="top-bar" v-if="searched || loading">
        <button class="back-btn bar-back" @click="goBack">← 返回</button>
        <div id="bar-search-wrap">
          <input
            type="text"
            id="bar-input"
            v-model="query"
            placeholder="重新搜索..."
            @keydown.enter="search"
            autocomplete="off"
          />
          <button id="bar-search-btn" @click="search" :disabled="loading">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- 加载 -->
    <div id="loading-box" v-if="loading">
      <div class="loader-ring"></div>
      <p class="loader-text">AI 正在为你匹配竞赛<span class="dots"></span></p>
    </div>

    <!-- 结果区 -->
    <div id="results-wrap" v-if="searched && !loading">
      <!-- 有结果 -->
      <template v-if="results.length > 0">
        <div id="result-meta">
          为你找到 <strong>{{ results.length }}</strong> 个相关竞赛
        </div>
        <div
          class="result-card"
          v-for="(item, index) in results"
          :key="item.competitionId"
          :style="{ animationDelay: index * 0.08 + 's' }"
          @click="goToDetail(item.competitionId)"
        >
          <div
            class="card-left-bar"
            :class="scoreBarClass(item.matchScore)"
          ></div>
          <div class="card-body">
            <div class="card-top">
              <div class="card-title">{{ item.title }}</div>
              <div
                class="score-badge"
                :class="scoreBadgeClass(item.matchScore)"
              >
                {{ item.matchScore }}%
              </div>
            </div>
            <div class="card-tags">
              <span
                class="ctag"
                v-for="tag in allTags(item)"
                :key="tag"
                :class="{
                  'ctag-hit': item.hitTags && item.hitTags.includes(tag),
                }"
                >{{ tag }}</span
              >
            </div>
            <div class="card-rec">
              <span class="rec-star">✦</span>
              <span>{{ item.recommendation }}</span>
            </div>
            <div class="card-footer">
              <span class="footer-item" v-if="item.deadline">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {{ formatDate(item.deadline) }}
              </span>
              <span class="footer-item" v-if="item.maxParticipants">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                最多 {{ item.maxParticipants }} 人
              </span>
              <span class="footer-item" v-if="item.schoolRequirements">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                {{ item.schoolRequirements }}
              </span>
            </div>
          </div>
          <div class="card-arrow">›</div>
        </div>
      </template>

      <!-- 无结果 -->
      <div class="empty-state" v-else>
        <div class="empty-icon">🔍</div>
        <div class="empty-title">暂无匹配竞赛</div>
        <div class="empty-sub">试试换个描述方式，或点击下方推荐词</div>
        <div class="empty-tags">
          <span
            class="quick-tag"
            v-for="tag in quickTags"
            :key="tag"
            @click="quickSearch(tag)"
            >{{ tag }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { aiSearchApi } from "@/api/api";

const router = useRouter();
const query = ref("");
const results = ref([]);
const loading = ref(false);
const searched = ref(false);

const quickTags = [
  "找需要 Java 和 Vue 的 Web 开发比赛",
  "适合算法方向的竞赛",
  "有 UI 设计要求的创新创业赛",
  "人工智能方向的比赛",
];

const search = async () => {
  if (!query.value.trim()) return;
  loading.value = true;
  searched.value = false;
  try {
    const res = await aiSearchApi(query.value.trim());
    results.value = res.code === 0 ? res.data : [];
  } catch (e) {
    results.value = [];
  } finally {
    loading.value = false;
    searched.value = true;
  }
};

const quickSearch = (text) => {
  query.value = text;
  search();
};
const goToDetail = (id) =>
  router.push({ path: "/project-detail", query: { id } });
const goBack = () => router.back();
const allTags = (item) =>
  [item.tag1, item.tag2, item.tag3, item.tag4, item.tag5].filter((t) =>
    t?.trim(),
  );
const formatDate = (d) => (d ? d.split("T")[0].replace(/-/g, "/") : "");
const scoreBarClass = (s) =>
  s >= 80 ? "bar-high" : s >= 60 ? "bar-mid" : "bar-low";
const scoreBadgeClass = (s) =>
  s >= 80 ? "badge-high" : s >= 60 ? "badge-mid" : "badge-low";
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#page-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #fef0f8 40%, #f0f4ff 100%);
  position: relative;
  overflow-x: hidden;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.orb1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 200, 150, 0.25);
  top: -100px;
  left: -100px;
}
.orb2 {
  width: 400px;
  height: 400px;
  background: rgba(200, 180, 255, 0.2);
  top: 30%;
  right: -80px;
}
.orb3 {
  width: 350px;
  height: 350px;
  background: rgba(150, 220, 200, 0.18);
  bottom: 0;
  left: 30%;
}

.back-btn {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

/* ── Hero ── */
#hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
#hero > .back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
}

#hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 24px;
  max-width: 700px;
  width: 100%;
}

#ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(180, 160, 255, 0.3);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  color: #8060d0;
  font-weight: 500;
  margin-bottom: 28px;
  backdrop-filter: blur(8px);
}
.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8060d0;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.7);
  }
}

#hero-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a2e;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
#hero-sub {
  font-size: 16px;
  color: #888;
  margin-bottom: 40px;
  line-height: 1.6;
}

#hero-search-wrap {
  display: flex;
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(180, 160, 255, 0.25);
  border-radius: 50px;
  overflow: hidden;
  box-shadow:
    0 8px 40px rgba(120, 100, 200, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.3s,
    border-color 0.3s;
  backdrop-filter: blur(12px);
  margin-bottom: 28px;
}
#hero-search-wrap:focus-within {
  border-color: rgba(150, 120, 255, 0.5);
  box-shadow:
    0 8px 40px rgba(120, 100, 200, 0.2),
    0 0 0 4px rgba(150, 120, 255, 0.08);
}
#hero-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 16px 24px;
  font-size: 16px;
  color: #333;
  outline: none;
}
#hero-input::placeholder {
  color: #bbb;
}
#hero-search-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #a080f0, #7060d0);
  border: none;
  border-radius: 50%;
  margin: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}
#hero-search-btn:hover {
  transform: scale(1.08);
}
#hero-search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.quick-tag {
  padding: 8px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.07);
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(6px);
}
.quick-tag:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border-color: rgba(150, 120, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(120, 100, 200, 0.1);
}

/* ── 顶部 bar ── */
#top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 32px;
  background: rgba(255, 252, 248, 0.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
}

#bar-search-wrap {
  flex: 1;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(180, 160, 255, 0.2);
  border-radius: 40px;
  overflow: hidden;
  max-width: 640px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
#bar-search-wrap:focus-within {
  border-color: rgba(150, 120, 255, 0.4);
  box-shadow: 0 2px 20px rgba(120, 100, 200, 0.12);
}
#bar-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 20px;
  font-size: 15px;
  color: #333;
  outline: none;
}
#bar-input::placeholder {
  color: #bbb;
}
#bar-search-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #a080f0, #7060d0);
  border: none;
  border-radius: 50%;
  margin: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  flex-shrink: 0;
}
#bar-search-btn:hover {
  transform: scale(1.08);
}
#bar-search-btn:disabled {
  opacity: 0.6;
}

/* ── 加载 ── */
#loading-box {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  padding-top: 80px;
}
.loader-ring {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(150, 120, 255, 0.15);
  border-top-color: #9070e0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loader-text {
  font-size: 16px;
  color: #999;
}
.dots::after {
  content: "";
  animation: dots 1.4s steps(4, end) infinite;
}
@keyframes dots {
  0% {
    content: "";
  }
  25% {
    content: ".";
  }
  50% {
    content: "..";
  }
  75% {
    content: "...";
  }
  100% {
    content: "";
  }
}

/* ── 结果区 ── */
#results-wrap {
  position: relative;
  z-index: 1;
  max-width: 780px;
  margin: 0 auto;
  padding: 110px 24px 60px;
}

#result-meta {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
  padding-left: 4px;
}
#result-meta strong {
  color: #555;
}

.result-card {
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  margin-bottom: 14px;
  cursor: pointer;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s;
  animation: cardIn 0.4s both;
}
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(120, 100, 200, 0.12);
  border-color: rgba(150, 120, 255, 0.2);
}

.card-left-bar {
  width: 4px;
  flex-shrink: 0;
}
.bar-high {
  background: linear-gradient(180deg, #6ee7b7, #34d399);
}
.bar-mid {
  background: linear-gradient(180deg, #fcd34d, #f59e0b);
}
.bar-low {
  background: linear-gradient(180deg, #d1d5db, #9ca3af);
}

.card-body {
  flex: 1;
  padding: 18px 16px;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}
.badge-high {
  background: rgba(52, 211, 153, 0.15);
  color: #059669;
}
.badge-mid {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}
.badge-low {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.ctag {
  padding: 3px 11px;
  border-radius: 10px;
  font-size: 12px;
  background: rgba(240, 240, 255, 0.7);
  color: #777;
  border: 1px solid rgba(150, 120, 255, 0.1);
}
.ctag-hit {
  background: rgba(110, 231, 183, 0.2);
  color: #059669;
  border-color: rgba(52, 211, 153, 0.3);
  font-weight: 600;
}

.card-rec {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 10px 13px;
  background: rgba(255, 248, 230, 0.6);
  border-radius: 10px;
  border-left: 3px solid rgba(245, 158, 11, 0.4);
  display: flex;
  gap: 8px;
}
.rec-star {
  color: #f59e0b;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #aaa;
}

.card-arrow {
  display: flex;
  align-items: center;
  padding: 0 16px 0 8px;
  font-size: 22px;
  color: #ccc;
  transition: all 0.2s;
}
.result-card:hover .card-arrow {
  color: #9070e0;
  transform: translateX(3px);
}

/* ── 无结果空状态 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 40px;
  gap: 12px;
}
.empty-icon {
  font-size: 52px;
  opacity: 0.25;
}
.empty-title {
  font-size: 18px;
  color: #aaa;
  font-weight: 500;
}
.empty-sub {
  font-size: 14px;
  color: #ccc;
  margin-bottom: 8px;
}
.empty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}

/* ── 过渡 ── */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.bar-slide-enter-active,
.bar-slide-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.bar-slide-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.bar-slide-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  #hero-title {
    font-size: 28px;
  }
  #results-wrap {
    padding: 90px 12px 40px;
  }
  .card-title {
    font-size: 15px;
  }
  #top-bar {
    padding: 12px 16px;
    gap: 10px;
  }
}
</style>
