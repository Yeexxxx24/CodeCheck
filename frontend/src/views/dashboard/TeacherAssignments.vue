<template>
  <div class="assignment-list">
    <h3>我发布的作业</h3>

    <el-table :data="assignmentList" border style="width: 100%">
      <el-table-column prop="title" label="作业标题" />
      <el-table-column prop="description" label="内容描述" />
      <el-table-column prop="deadline" label="截止时间" >
        <template #default="{row}">
          {{ formatTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column prop="create_at" label="发布时间" >
        <template #default="{row}">
          {{ formatTime(row.create_at) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
  import {ref,onMounted} from 'vue'
  import request from '@/utils/request';
  import { useUserStore } from '@/stores/user';
  import { ElMessage } from 'element-plus';
  import dayjs from 'dayjs'

  const formatTime = (time:string) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const store = useUserStore()
  const assignmentList = ref([])

  const fetchAssignments = async ()=> {
    try {
      const res = await request.get('/assignment/list',{
        params:{teacherId:store.id}
      })

      if(res.data.code === 200){
        assignmentList.value = res.data.data
      }else{
        ElMessage.error(res.data.message || '获取作业失败')
      }
    } catch (error) {
      console.error('获取失败',error)
      ElMessage.error('请求出错')
    }
  }
  
 onMounted(()=> {
  fetchAssignments()
 })

</script>

<style scoped>
.assignment-list {
  padding: 30px;
}
</style>