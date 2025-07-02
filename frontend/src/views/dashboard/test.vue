<!-- 展示教师发布的所有作业 -->
<template>
  <div class="assign-list-wrapper">
    <h3>已发布作业列表</h3>

    <el-table :data="assignments" border style="width: 100%;">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="内容" />
      <el-table-column label="截止日期">
        <template #default="{ row }">
          {{ formatTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间">
        <template #default="{ row }">
          {{ formatTime(row.create_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          <el-button type="success" size="small" @click="goToSubmissions(row)">查看提交记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改作业" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="editForm.description" rows="5" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editForm.deadline"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const store = useUserStore()
const router = useRouter()

const assignments = ref([]) // 作业列表
const dialogVisible = ref(false)
const editForm = ref({
  id: 0,
  title: '',
  description: '',
  deadline: ''
})

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取作业列表
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
    console.error('获取作业失败:', error)
    ElMessage.error('网络错误')
  }
}

// 打开弹窗
const openEditDialog = (row: any) => {
  editForm.value = {
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: dayjs(row.deadline).format('YYYY-MM-DD HH:mm:ss')
  }
  dialogVisible.value = true
}

// 修改保存
const submitEdit = async () => {
  try {
    const res = await request.post('/assignment/update', editForm.value)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      await loadAssignments()
    } else {
      ElMessage.error(res.data.message || '修改失败')
    }
  } catch (error) {
    console.error('修改失败:', error)
    ElMessage.error('请求失败')
  }
}

// 删除作业
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认要删除这项作业吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await request.delete(`/assignment/${row.id}`)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      await loadAssignments()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    console.log('取消删除', error)
  }
}

// 👉 新增：跳转查看提交记录
const goToSubmissions = (row: any) => {
  router.push({
    path: '/dashboard/submissions',
    query: {
      assignmentId: row.id,
      title: row.title
    }
  })
}

onMounted(() => {
  loadAssignments()
})
</script>

<style scoped>
.assign-list-wrapper {
  padding: 30px;
}
</style>
