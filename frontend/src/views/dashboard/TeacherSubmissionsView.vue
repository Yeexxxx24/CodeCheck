<!-- 展示某个作业的学生提交记录 -->
<template>
  <div class="teacher-submissions-view">
    <!-- 返回按钮 -->
    <el-button
      class="back-button"
      type="primary"
      icon="el-icon-arrow-left"
      @click="goBack"
    >
      < 返回
    </el-button>
    <h2 style="margin-bottom: 20px">学生提交记录</h2>

    <el-row style="margin-bottom: 20px" justify="space-between">
      <el-col>
        <el-button type="warning" @click="goToCheck"> 发起查重 </el-button>
      </el-col>
    </el-row>

    <el-table :data="submissions" v-loading="loading" style="width: 100%">
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column label="提交时间">
        <template #default="{ row }">
          <span v-if="row.submittedAt">{{ formatTime(row.submittedAt) }}</span>
          <span v-else>未提交</span>
        </template>
      </el-table-column>
      <el-table-column label="文件名">
        <template #default="{ row }">
          <a
            v-if="row.filename"
            :href="`http://localhost:3000/uploads/${row.filename}`"
            target="_blank"
          >
            {{ row.originalName }}
          </a>
          <span v-else style="color: #999">未上传</span>
        </template>
      </el-table-column>

      <el-table-column label="评分">
        <template #default="{ row }">
          <el-input-number
            v-model="row.score"
            :min="0"
            :max="100"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="评语">
        <template #default="{ row }">
          <el-input v-model="row.comment" placeholder="评语" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="submitGrade(row)"
            :disabled="!row.submittedAt"
            >提交</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-empty
      v-if="!loading && submissions.length === 0"
      description="暂无提交记录"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const submissions = ref<any[]>([]);
const loading = ref(false);

const goToCheck = () => {
  router.push({ path: '/dashboard/check-result', query: { id: assignmentId } })
}
// 时间格式化
const formatTime = (time: string) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};
const assignmentId = route.query.assignmentId;

const goBack = () => {
  router.push("/dashboard/teacher-assignments");
};

const fetchSubmissions = async () => {
  if (!assignmentId) {
    ElMessage.error("缺少作业 ID");
    return;
  }

  loading.value = true;
  try {
    const res = await request.get("/submission/list", {
      params: { assignmentId },
    });
    console.log(submissions.value);

    if (res.data.code === 200) {
      submissions.value = res.data.data;
      //  console.log("✅ 提交记录数据：", submissions.value); // 👈 打印这里
    } else {
      ElMessage.error(res.data.message || "获取提交记录失败");
    }
  } catch (error) {
    console.error("请求出错：", error);
    ElMessage.error("网络错误");
  } finally {
    loading.value = false;
  }
};

const submitGrade = async (row: any) => {
  try {
    const res = await request.post("/submission/grade", {
      assignmentId,
      studentId: row.studentId,
      score: row.score,
      comment: row.comment,
    });
    if (res.data.code === 200) {
      ElMessage.success("评分提交成功");
    } else {
      ElMessage.error(res.data.message || "提交失败");
    }
  } catch (error) {
    console.error("提交出错", error);
    ElMessage.error("提交出错");
  }
};

onMounted(fetchSubmissions);
</script>

<style scoped>
.teacher-submissions-view {
  padding: 20px;
}
.teacher-submissions-view {
  padding: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  width: 55px;
  top: 5px;
  left: 10px;
}
</style>
