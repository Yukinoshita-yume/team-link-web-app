<template>
  <div class="page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <nav class="nav">
      <button class="nav-back" @click="handleCancel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        返回
      </button>

      <span class="nav-title">创建竞赛</span>

      <button class="submit-btn-nav" @click="handleSubmit" :disabled="isLoading">
        {{ isLoading ? '创建中…' : '发布' }}
      </button>
    </nav>
    <div class="content">
      <div class="form-card">
        <div class="field">
          <label>竞赛名称 <span class="required">*</span></label>
          <input type="text" v-model="title" placeholder="请输入竞赛名称" required/>
        </div>
        <div class="field-row">
          <div class="field">
            <label>人数上限 <span class="required">*</span></label>
            <input type="number" v-model.number="maxParticipants" min="1" placeholder="如：5"/>
          </div>
          <div class="field">
            <label>截止日期 <span class="required">*</span></label>
            <input type="date" v-model="deadline" required/>
          </div>
        </div>
        <div class="field">
          <label>学校要求</label>
          <div class="radio-group">
            <label class="radio-item" :class="{ active: schoolRequirements === 'none' }">
              <input type="radio" v-model="schoolRequirements" value="none"/> 不限学校
            </label>
            <label class="radio-item" :class="{ active: schoolRequirements === 'specific' }">
              <input type="radio" v-model="schoolRequirements" value="specific"/> 特定学校
            </label>
          </div>
          <input v-if="schoolRequirements === 'specific'" type="text" v-model="schoolName" placeholder="请输入学校名称" style="margin-top:10px"/>
        </div>

        <div class="field">
          <label>技能标签 <span class="tag-hint">最多 5 个</span></label>
          <div class="tags-wrap">
            <div class="tag-chip" v-for="(tag, i) in tags" :key="i">

              <input
                  :value="tags[i]"
                  type="text"
                  :placeholder="'标签 ' + (i + 1)"
                  @compositionstart="onCompositionStart(i)"
                  @compositionend="onCompositionEnd(i, $event)"
                  @input="onTagInput(i, $event)"
                  @keydown.backspace="onTagBackspace(i)"
              />
              <button type="button" @click="removeTag(i)" class="tag-del">×</button>
            </div>
            <button type="button" class="tag-add" @click="addTag" v-if="tags.length < 5 && canAddTag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加标签
            </button>
          </div>
        </div>

        <div class="field">
          <label>竞赛简介 <span class="required">*</span></label>
          <textarea v-model="competitionDetails" placeholder="介绍一下这个竞赛的背景、要求和亮点…" required></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { createCompetitionApi } from '@/api/api'

const router = useRouter()
const store = useStore()
const localUser = computed(() => store.state.user)

const title = ref('')
const maxParticipants = ref(null)
const schoolRequirements = ref('none')
const schoolName = ref('')
const deadline = ref('')
const tags = ref([''])
const competitionDetails = ref('')
const isLoading = ref(false)


const composingMap = ref({})

const canAddTag = computed(() => tags.value[tags.value.length - 1]?.trim() !== '')
const addTag = () => { if (canAddTag.value && tags.value.length < 5) tags.value.push('') }
const removeTag = (i) => { if (tags.value.length > 1) tags.value.splice(i, 1) }

const trimToByteLimit = (str, maxBytes = 15) => {
  let bytes = 0
  let result = ''
  for (const ch of str) {
    bytes += new Blob([ch]).size
    if (bytes > maxBytes) break
    result += ch
  }
  return result
}

const onCompositionStart = (i) => {
  composingMap.value[i] = true
}

const onCompositionEnd = (i, e) => {
  composingMap.value[i] = false
  const val = e.target.value
  const trimmed = trimToByteLimit(val)
  tags.value[i] = trimmed
  if (e.target.value !== trimmed) e.target.value = trimmed
  postProcess(i)
}

const onTagInput = (i, e) => {
  if (composingMap.value[i]) {
    tags.value[i] = e.target.value
    return
  }
  const val = e.target.value
  const trimmed = trimToByteLimit(val)
  tags.value[i] = trimmed
  if (e.target.value !== trimmed) e.target.value = trimmed
  postProcess(i)
}

const onTagBackspace = (i) => {
  if (composingMap.value[i]) return
  if (tags.value[i] === '' && tags.value.length > 1) {
    removeTag(i)
  }
}

const postProcess = (i) => {
  if (composingMap.value[i]) return
  if (tags.value[i]?.trim() === '' && tags.value.length > 1 && i < tags.value.length - 1) {
    tags.value.splice(i, 1)
  }
}

const handleSubmit = async () => {
  if (isLoading.value) return
  if (!title.value?.trim()) { alert('请填写竞赛名称'); return }
  if (!maxParticipants.value) { alert('请填写人数要求'); return }
  if (!deadline.value) { alert('请选择截止日期'); return }
  if (!competitionDetails.value?.trim()) { alert('请填写竞赛简介'); return }
  try {
    isLoading.value = true
    const res = await createCompetitionApi({
      title: title.value,
      maxParticipants: maxParticipants.value,
      schoolRequirements: schoolRequirements.value === 'specific' ? schoolName.value : '',
      deadline: deadline.value + ' 23:59:59',
      tag1: tags.value[0] || null,
      tag2: tags.value[1] || null,
      tag3: tags.value[2] || null,
      tag4: tags.value[3] || null,
      tag5: tags.value[4] || null,
      competitionDetails: competitionDetails.value,
      userId: localUser.value.userId
    })
    if (res.code === 0) { alert('创建成功！'); router.push('/personal-page') }
    else throw new Error(res.message || '创建失败')
  } catch (e) {
    alert('创建失败: ' + e.message)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => router.back()

onMounted(() => {
  if (localUser.value.userId === -1) router.replace('/login')
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }
.page { min-height: 100vh; background: linear-gradient(135deg, #f8f4ff 0%, #f0f4ff 60%, #fdf4ff 100%); position: relative; overflow-x: hidden; }
.blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
.blob1 { width: 400px; height: 400px; background: rgba(167,139,250,0.18); top: -100px; right: -80px; }
.blob2 { width: 350px; height: 350px; background: rgba(196,181,253,0.12); bottom: 0; left: -60px; }

.nav {
  min-height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 20px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.nav-back:hover {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}
.nav-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1028;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.submit-btn-nav {
  padding: 8px 18px;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  box-shadow: 0 3px 12px rgba(109,40,217,0.25);
  transition: all 0.2s;
}
.submit-btn-nav:hover:not(:disabled) { transform: translateY(-1px); }
.submit-btn-nav:disabled { opacity: 0.6; cursor: not-allowed; }

.content { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; padding: 20px 16px 60px; }
.form-card {
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 20px; padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 16px rgba(100,80,200,0.06);
  display: flex; flex-direction: column; gap: 20px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { font-size: 13px; font-weight: 700; color: #444; display: flex; align-items: center; gap: 6px; }
.required { color: #ef4444; }
.tag-hint { color: #bbb; font-weight: 400; font-size: 12px; }
input, textarea {
  padding: 11px 14px;
  background: rgba(245,243,255,0.6);
  border: 1.5px solid rgba(139,92,246,0.12);
  border-radius: 10px;
  font-size: 14px; color: #333; outline: none;
  transition: all 0.2s; font-family: inherit;
}
input:focus, textarea:focus {
  border-color: rgba(139,92,246,0.45);
  background: white;
  box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
}
input::placeholder, textarea::placeholder { color: #ccc; }
textarea { min-height: 120px; resize: vertical; }
.radio-group { display: flex; gap: 10px; }
.radio-item {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  background: rgba(0,0,0,0.03);
  border: 1.5px solid rgba(0,0,0,0.07);
  border-radius: 10px; cursor: pointer;
  font-size: 14px; color: #555; font-weight: 400;
  transition: all 0.2s;
}
.radio-item input[type=radio] { display: none; }
.radio-item.active { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.3); color: #7c3aed; font-weight: 600; }

.tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tag-chip {
  display: flex; align-items: center;
  background: rgba(139,92,246,0.07);
  border: 1.5px solid rgba(139,92,246,0.15);
  border-radius: 10px; overflow: hidden;
}
.tag-chip input {
  border: none; background: transparent;
  padding: 8px 10px; font-size: 13px;
  width: 90px; outline: none;
}
.tag-chip input:focus { box-shadow: none; }
.tag-del {
  background: none; border: none;
  color: #c4b5fd; cursor: pointer;
  padding: 8px 10px; font-size: 16px;
  transition: color 0.2s;
}
.tag-del:hover { color: #7c3aed; }
.tag-add {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px;
  background: rgba(139,92,246,0.06);
  border: 1.5px dashed rgba(139,92,246,0.25);
  border-radius: 10px;
  color: #8b5cf6; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.tag-add:hover { background: rgba(139,92,246,0.1); }

@media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
</style>