<template>
  <div class="all-history-wrapper">
    <h3>所有学生查重记录</h3>

    <el-table :data="records" border stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="filename" label="上传文件" />
      <el-table-column prop="matched_file" label="匹配文件" />
      <el-table-column prop="similarity" label="相似度（%）" />
      <el-table-column label="查重时间">
        <template #default="{ row }">
          {{ formatTime(row.create_at) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      style="margin-top: 20px;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const records = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const fetchData = async () => {
  try {
    const res = await request.get('/check/all', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })

    if (res.data.code === 200) {
      records.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.message || '获取失败')
    }
  } catch (err) {
    console.error('获取失败:', err)
    ElMessage.error('请求出错')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.all-history-wrapper {
  padding: 30px;
}
</style>
