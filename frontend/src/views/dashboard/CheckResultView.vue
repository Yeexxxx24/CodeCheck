<!-- 教师查重报告展示 -->
 <template>
  <div class="check-result-view">
    <el-card class="card">
      <el-button type="primary" icon="el-icon-arrow-left" @click="goBack" style="margin-bottom: 10px">
        < 返回
      </el-button>
      <h2 style="margin-bottom: 20px">查重结果报告</h2>

      <div v-if="loading">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="reportUrl">
        <iframe :src="reportUrl" frameborder="0" width="100%" height="700px"></iframe>
      </div>

      <el-empty v-else description="暂无查重报告，请确认是否已提交作业" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const assignmentId = route.query.id

const loading = ref(true)
const reportUrl = ref('')

const goBack = () => {
  router.back()
}

const fetchReport = async () => {
  try {
    const res = await request.get(`/check/assignment/${assignmentId}`)
    if (res.data.code === 200) {
      reportUrl.value = res.data.reportUrl
    } else {
      ElMessage.error(res.data.message || '获取报告失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<style scoped>
.check-result-view {
  padding: 20px;
}
.card {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
