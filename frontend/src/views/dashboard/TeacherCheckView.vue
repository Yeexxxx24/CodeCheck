<template>
  <div class="teacher-check">
    <h2>所有学生查重记录</h2>
    <el-table :data="historyList" style="width: 100%; margin-bottom: 20px;" >
      <el-table-column prop="username" label="学生用户名" width="150"/>
      <el-table-column prop="filename" label="提交文件"/>
      <el-table-column prop="matched_file" label="匹配文件"/>
      <el-table-column prop="similarity" label="相似度" width="120"/>
      <el-table-column label="查重时间" width="180">
        <template #default="{row}">
          {{ formatTime(row.create_at) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev,pager,next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />

  </div>
</template>

<script setup lang="ts">
  import { onMounted,ref } from 'vue';
  import request from '@/utils/request';
  import dayjs from 'dayjs';

  const historyList = ref<any[]>([])
  const currentPage = ref(1)
  const pageSize = ref(5)
  const total = ref(0)

  const formatTime = (time:string)=>{
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const fetchAllRecords = async ()=>{
    try {
      const res = await request.get('/check/all',{
        params:{
          page:currentPage.value,
          pageSize:pageSize.value
        }
      })

      if(res.data.code === 200){
         historyList.value = Array.isArray(res.data.data.records) ? res.data.data.records : []
         total.value = res.data.data.total
      }
    } catch (error) {
      console.error('教师查重记录获取失败:', error)
    }
  }

  const handlePageChange = (page:number)=>{
    currentPage.value = page
    fetchAllRecords()
  }

  onMounted(fetchAllRecords)
</script>

<style scoped>
.teacher-check {
  padding: 30px;
}
</style>