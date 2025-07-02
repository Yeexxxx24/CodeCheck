<template>
  <div class="check-wrapper">
    <!-- 左侧：上传文件区域 -->
    <div class="left-panel">
      <el-upload
        class="upload-area"
        drag
        action="#"
        :show-file-list="false"
        :before-upload="handleUpload"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </el-upload>

      <!-- 显示上传文件名 -->
      <el-alert
        v-if="fileName"
        title="已上传文件："
        :description="fileName"
        type="info"
        show-icon
        class="uploaded-file"
      />

      <!-- 查重按钮 -->
      <el-button
        type="primary"
        @click="checkFile"
        :disabled="!uploadedFilename"
        style="margin-top: 10px"
      >
        查重
      </el-button>
    </div>

    <!-- 右侧：说明 + 查重结果 -->
    <div class="right-panel">
      <el-card class="description">
        <p>📌 上传代码文件后点击“查重”按钮可检测相似度。</p>
        <p>支持格式：.txt、.js、.java、.cpp 等</p>
      </el-card>

      <el-card class="result" v-if="result.similarity !== null">
        <h3>查重结果：</h3>
        <p>相似度：{{ result.similarity }}%</p>
        <p>匹配文件：{{ result.matchedFile }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const store = useUserStore()

const fileName = ref<string>('') // 原始文件名（中文）
const uploadedFilename = ref<string>('') // 后端返回的唯一文件名

// 查重结果对象
const result = ref<{
  similarity: number | null
  matchedFile: string
}>({
  similarity: null,
  matchedFile: ''
})

// 上传处理函数
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 成功后保存原始文件名和唯一文件名
    fileName.value = res.data.originalName || file.name
    uploadedFilename.value = res.data.filename

    ElMessage.success(`上传成功：${fileName.value}`)
    console.log('✅ 上传成功，原名为：', fileName.value)
  } catch (err) {
    console.error('上传失败', err)
    ElMessage.error('上传失败，请重试')
  }

  return false // 阻止默认上传行为
}

// 查重函数
const checkFile = async () => {
  if (!uploadedFilename.value) return

  try {
    const res = await axios.post('/api/check', {
      filename: uploadedFilename.value,
      userId: store.id
    })

    if (res.data.code === 200) {
      result.value = {
        similarity: res.data.similarity,
        matchedFile: res.data.matchedFile || '未知'
      }
    } else {
      ElMessage.warning('查重失败，请稍后再试')
    }
  } catch (err) {
    console.error('查重接口调用失败', err)
    ElMessage.error('查重请求失败')
  }
}
</script>

<style scoped>
.check-wrapper {
  display: flex;
  gap: 30px;
  padding: 30px;
}

/* 左侧上传区 */
.left-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.upload-area {
  width: 100%;
}
.uploaded-file {
  width: 100%;
}

/* 右侧信息区 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.description, .result {
  width: 100%;
}
</style>
