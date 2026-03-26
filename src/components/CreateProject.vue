<template>
  <div class="create-competition">
    <h1>创建竞赛项目</h1>
    <form @submit.prevent="handleSubmit">
      <!-- 竞赛名称 -->
      <div class="form-group">
        <label for="title">竞赛名称</label>
        <input
          type="text"
          id="title"
          v-model="title"
          placeholder="请输入竞赛名称"
          required
        />
      </div>

      <!-- 人数要求 -->
      <div class="form-group">
        <label for="maxParticipants">人数要求</label>
        <input
          type="number"
          id="maxParticipants"
          v-model.number="maxParticipants"
          @input="validateNumberInput"
          placeholder="请输入竞赛人数要求"
          min="1"
          required
        />
      </div>

      <!-- 学校要求 -->
      <div class="form-group">
        <label for="schoolRequirements">学校要求</label>
        <select id="schoolRequirements" v-model="schoolRequirements" required>
          <option value="none">无要求</option>
          <option value="specific">特定学校</option>
        </select>
      </div>

      <!-- 如果选择特定学校 -->
      <div v-if="schoolRequirements === 'specific'" class="form-group">
        <label for="schoolName">选择学校</label>
        <input
          type="text"
          id="schoolName"
          v-model="schoolName"
          placeholder="请输入学校名称"
        />
      </div>

      <!-- 报名截止日期 -->
      <div class="form-group">
        <label for="deadline">报名截止日期</label>
        <input type="date" id="deadline" v-model="deadline" required />
      </div>

      <!-- 相关标签 -->
      <div class="form-group">
        <label for="tags">相关标签</label>
        <div id="tags-box">
          <div class="tags-container">
            <div class="tag-input" v-for="(tag, index) in tags" :key="index">
              <input
                v-model="tags[index]"
                type="text"
                :placeholder="'标签 ' + (index + 1)"
                @input="handleTagInput(index)"
              />
              <!-- 删除按钮始终可见 -->
              <button
                type="button"
                @click="removeTag(index)"
                class="remove-tag-btn"
              >
                ×
              </button>
            </div>
            <!-- 标签添加按钮 -->

            <div class="add-tag-btn-container" v-if="tags.length < 5">
              <!-- 只显示加号按钮，当标签数小于5时 -->
              <button type="button" class="add-tag-btn" @click="addTag">
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目简介 -->
      <div class="form-group">
        <label for="competitionDetails">项目简介</label>
        <textarea
          id="competitionDetails"
          v-model="competitionDetails"
          placeholder="请输入竞赛简介"
          required
        ></textarea>
      </div>

      <!-- 提交和取消按钮 -->
      <div class="form-actions">
        <button type="submit" class="btn-primary">创建竞赛</button>
        <button type="button" class="btn-secondary" @click="handleCancel">
          取消
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { createCompetitionApi } from "@/api/api";

const router = useRouter();
const store = useStore();
const localUser = computed(() => store.state.user);
const title = ref("");
const maxParticipants = ref(1);
const schoolRequirements = ref("none");
const schoolName = ref("");
const deadline = ref("");
const tags = ref([""]);
const competitionDetails = ref("");
const isLoading = ref(false); // 加载状态，防止重复提交

// 计算是否可以添加新标签（仅当最后一个标签输入框有内容时，才允许添加新标签）
const canAddTag = computed(() => {
  const lastTag = tags.value[tags.value.length - 1];
  return lastTag && lastTag.trim() !== ""; // 如果最后一个标签输入框有内容，则允许添加新标签
});

// 添加标签输入框
const addTag = () => {
  if (canAddTag.value && tags.value.length < 5) {
    tags.value.push(""); // 每次点击加号添加一个空的标签
  }
};

// 移除标签输入框
const removeTag = (index) => {
  if (tags.value.length > 1) {
    tags.value.splice(index, 1); // 删除指定索引的标签输入框
  }
};
const validateNumberInput = (event) => {
  let value = event.target.value.replace(/[^\d]/g, "");
  maxParticipants.value = value ? parseInt(value, 10) : null;

  // 确保最小值
  if (maxParticipants.value && maxParticipants.value < 1) {
    maxParticipants.value = 1;
    event.target.value = 1; // 同时更新输入框显示
  }
};

// 提交竞赛项目
// const handleSubmit = () => {
//   console.log("竞赛名称:", competitionName.value);
//   console.log("人数要求:", participantCount.value);
//   console.log("学校要求:", schoolRequirement.value);
//   console.log("特定学校:", schoolName.value);
//   console.log("报名截止日期:", registrationDeadline.value);
//   console.log("相关标签:", tags.value);
//   console.log("竞赛简介:", competitionDescription.value);

//   alert("竞赛项目创建成功!");
// };

const handleSubmit = async () => {
  // 如果正在加载中，直接返回防止重复提交
  if (isLoading.value) {
    return;
  }

  // 验证必填字段
  if (!maxParticipants.value) {
    alert("请填写人数要求");
    return;
  }

  try {
    isLoading.value = true;
    const competitionData = {
      title: title.value,
      maxParticipants: maxParticipants.value,
      // 学校要求：如果是特定学校则传学校名，否则传"none"
      schoolRequirements:
        schoolRequirements.value === "specific" ? schoolName.value : "",
      deadline: deadline.value + " 23:59:59",
      // 处理标签数据，最多5个，不足的传null
      tag1: tags.value[0] || null,
      tag2: tags.value[1] || null,
      tag3: tags.value[2] || null,
      tag4: tags.value[3] || null,
      tag5: tags.value[4] || null,
      competitionDetails: competitionDetails.value,
      // 从本地存储获取用户ID
      userId: localUser.value.userId,
    };

    // 发送POST请求到后端接口
    const response = await createCompetitionApi(competitionData);
    console.log(response);
    // 处理成功响应
    if (response.code === 0) {
      alert("竞赛项目创建成功!");
      // 跳转到竞赛列表页面
      router.push("/personal-page");
    } else {
      // 如果响应不成功，抛出错误
      throw new Error(response?.message || "创建竞赛失败");
    }
  } catch (error) {
    // 捕获并处理错误
    console.error("创建竞赛失败:", error);
    alert(`创建竞赛失败: ${error.message}`);
  } finally {
    // 无论成功失败，最后都关闭加载状态
    isLoading.value = false;
  }
};

// 取消创建竞赛
const handleCancel = () => {
  router.back();
  // title.value = "";
  // maxParticipants.value = "";
  // schoolRequirements.value = "none";
  // schoolName.value = "";
  // deadline.value = "";
  // tags.value = [""];
  // competitionDetails.value = "";
};
function getByteLength(str) {
  return new Blob([str]).size;
}
// 处理标签输入
const handleTagInput = (index) => {
  if (tags.value[index] && tags.value[index].trim() === "") {
    // 如果标签为空且被删除，则自动移除标签输入框
    tags.value.splice(index, 1);
  }
  if (getByteLength(tags.value[index]) > 15) {
    tags.value[index] = tags.value[index].slice(0, -1);
  }
};
onMounted(() => {
  if (localUser.value.userId === -1) {
    router.replace("/login");
  }
});
</script>

<style scoped>
#competitionDetails {
  resize: vertical;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.create-competition {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
  border-radius: 8px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

label {
  display: block;
  width: 140px;
  font-size: 16px;
  margin-bottom: 5px;
  margin-right: 10px;
}

input,
textarea,
select {
  width: 100%;
  height: 40px;
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
}
· textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.form-actions button {
  margin: 0 50px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: rgb(111, 63, 158);
}

.btn-secondary {
  padding: 10px 20px;
  background-color: #ccc;
  color: black;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #b2b3b4;
}

button:disabled {
  cursor: not-allowed;
}

.tags-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

#tags-box {
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  /* height: 40px; */
  margin: 5px 0;
  border: none;
  box-sizing: border-box;
}

.tag-input {
  display: flex;
  align-items: center;
  padding: 0;
  margin-right: 12px;
  position: relative;
  width: 100%;
}

.tag-input:last-child {
  margin-right: 0;
}

.remove-tag-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgb(150, 107, 193);
  cursor: pointer;
  font-size: 20px;
}

.remove-tag-btn:hover {
  color: rgb(111, 63, 158);
}

.add-tag-btn-container {
  margin-top: 10px;
}

.add-tag-btn {
  padding: 5px 10px;
  margin-top: 2px;
  background-color: rgb(150, 107, 193);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 15px;
}

.add-tag-btn:hover {
  background-color: rgb(111, 63, 158);
}

@media screen and (min-width: 768px) and (max-width: 1024px) {
  /* 平板设备样式 */
  .create-competition {
    padding: 20px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    width: 140px;
    font-size: 15px;
    margin-right: 8px;
  }

  input,
  textarea,
  select {
    height: 38px;
    font-size: 15px;
  }

  textarea {
    min-height: 90px;
  }

  .form-actions button {
    margin: 0 30px;
    padding: 10px 18px;
    font-size: 15px;
  }

  .add-tag-btn {
    padding: 5px 8px;
    font-size: 14px;
  }
}

@media screen and (min-width: 0) and (max-width: 768px) {
  /* 手机设备样式 */
  .create-competition {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .form-group {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  label {
    width: 100%;
    margin-bottom: 8px;
    font-size: 14px;
  }

  input,
  textarea,
  select {
    width: 100%;
    height: 35px;
    font-size: 14px;
  }

  textarea {
    min-height: 80px;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .form-actions button {
    margin: 5px 0;
    width: 100%;
    max-width: 200px;
    padding: 10px 15px;
    font-size: 14px;
  }

  .tags-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .tag-input {
    width: 100%;
    margin-bottom: 0;
  }

  .add-tag-btn-container {
    width: 100%;
    text-align: center;
    margin-top: 10px;
  }

  .add-tag-btn {
    width: 100%;
    max-width: 200px;
    padding: 5px 10px;
    font-size: 14px;
  }
}
</style>
