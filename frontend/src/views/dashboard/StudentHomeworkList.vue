<template>
  <div class="student-homework-list">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h3>作业列表</h3>
      <el-select v-model="filterStatus" placeholder="筛选提交状态" style="width: 180px">
        <el-option label="全部" value="all" />
        <el-option label="已提交" value="submitted" />
        <el-option label="未提交" value="unsubmitted" />
      </el-select>
    </div>

    <!-- ✅ 关键点：:data 必须是 Array 类型 -->
    <el-table
      :data="filteredAssignments"
      style="width: 100%;"
      highlight-current-row
      @row-click="goToSubmitPage"
    >
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="说明" />
      <el-table-column label="截止时间">
        <template #default="{ row }">
          {{ formatTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="提交状态" width="120">
        <template #default="{ row }">
          <el-tag type="success" v-if="row.submitted">已提交</el-tag>
          <el-tag type="info" v-else>未提交</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useUserStore()

// ✅ 明确声明 ref 类型为数组
const allAssignments = ref<any[]>([])
const filterStatus = ref('all')

// 时间格式化函数
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取作业数据
const fetchAssignments = async () => {
  try {
    const res = await request.get('/assignment/all')
    if (res.data.code === 200) {
      const assignments = res.data.data

      // 为每个作业请求学生提交状态
      for (const item of assignments) {
        const subRes = await request.get('/submission/status', {
          params: {
            assignmentId: item.id,
            studentId: store.id
          }
        })
        item.submitted = subRes.data.data?.submitted || false
      }

      allAssignments.value = assignments
    } else {
      ElMessage.error(res.data.message || '获取作业失败')
    }
  } catch (error) {
    console.error('获取作业失败:', error)
    ElMessage.error('网络错误')
  }
}

// 根据筛选状态生成过滤列表（返回数组类型）
const filteredAssignments = computed(() => {
  if (filterStatus.value === 'all') {
    return allAssignments.value
  } else if (filterStatus.value === 'submitted') {
    return allAssignments.value.filter(a => a.submitted)
  } else {
    return allAssignments.value.filter(a => !a.submitted)
  }
})

// 点击跳转到提交详情页
const goToSubmitPage = (row: any) => {
  router.push({
    path: '/dashboard/submit',
    query: { id: row.id }
  })
}

onMounted(fetchAssignments)
</script>
