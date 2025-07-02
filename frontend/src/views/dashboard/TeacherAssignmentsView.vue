<template>
  <div class="assignment-wrapper">
    <h2>我的作业</h2>

    <el-table :data="assignments" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="内容" />
      <el-table-column label="截止时间">
        <template #default="{ row }">
          {{ formatTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间">
        <template #default="{ row }">
          {{ formatTime(row.create_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          <el-button type="success" size="small" @click="goToSubmissions(row.id)">查看提交</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改作业" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="editForm.description" rows="4" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="editForm.deadline"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useUserStore()

const assignments = ref([])
const dialogVisible = ref(false)
const editForm = ref({
  id: 0,
  title: '',
  description: '',
  deadline: ''
})

// 时间格式化
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 加载作业数据
const loadAssignments = async () => {
  try {
    const res = await request.get('/assignment/list', {
      params: { teacherId: store.id }
    })
    if (res.data.code === 200) {
      assignments.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '加载失败')
    }
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('网络错误')
  }
}

// 修改弹窗
const openEditDialog = (row: any) => {
  editForm.value = {
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: dayjs(row.deadline).format('YYYY-MM-DD HH:mm:ss')
  }
  dialogVisible.value = true
}

// 提交修改
const submitEdit = async () => {
  try {
    const res = await request.post('/assignment/update', editForm.value)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      loadAssignments()
    } else {
      ElMessage.error(res.data.message || '修改失败')
    }
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('网络错误')
  }
}

// 删除作业
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该作业？', '提示', {
      type: 'warning'
    })
    const res = await request.delete(`/assignment/${row.id}`)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadAssignments()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch {
    console.log('取消删除')
  }
}

// 查看提交记录
const goToSubmissions = (assignmentId: number) => {
  router.push({
    path: '/dashboard/teacher-submissions',
    query: { assignmentId }
  })
}

onMounted(loadAssignments)
</script>

<style scoped>
.assignment-wrapper {
  padding: 30px;
}
</style>
