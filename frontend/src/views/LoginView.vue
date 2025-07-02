<template>
  <div class="page-wrapper">
    <el-card class="login-card" shadow="hover">
      <!-- 背景装饰 -->
      <div class="decoration circle" />
      <div class="decoration square" />

      <h1 class="title">作业管理与查重系统</h1>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="登录身份" prop="role">
          <el-radio-group v-model="form.role" class="role-group">
            <el-radio label="teacher">教师</el-radio>
            <el-radio label="student">学生</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 记住账号 -->
        <el-form-item>
          <el-checkbox v-model="remember">记住账号</el-checkbox>
        </el-form-item>

        <!-- 按钮 -->
        <div class="btn-group">
          <el-button type="default" @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'   // ← 加 type
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

/* ------------------ 表单数据 ------------------ */
const form = reactive({
  username: '',
  password: '',
  role: 'student' as 'teacher' | 'student',
})
const remember = ref(false)

/* ------------------ 校验规则 ------------------ */
const rules: FormRules<typeof form> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const formRef = ref<FormInstance>()
const router = useRouter()
const store = useUserStore()

/* ------------------ 登录 ------------------ */
const handleLogin = () => {
  formRef.value!.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await request.post('/login', form)
      // 保存用户信息
      store.setUser(res.data)

      // 记住账号
      if (remember.value) {
        localStorage.setItem('rememberUsername', form.username)
        localStorage.setItem('rememberRole', form.role)
      } else {
        localStorage.removeItem('rememberUsername')
        localStorage.removeItem('rememberRole')
      }

      ElMessage.success('登录成功')
      router.push(
        form.role === 'teacher' ? '/dashboard/welcome' : '/dashboard/check'
      )
    } catch (e) {
      ElMessage.error('用户名或密码错误')
    }
  })
}

/* ------------------ 重置 ------------------ */
const handleReset = () => {
  formRef.value?.resetFields()
  ElMessage.info('表单已重置')
}

/* ------------------ 页面加载：自动填充 ------------------ */
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberUsername')
  const savedRole = localStorage.getItem('rememberRole')
  if (savedUsername) {
    form.username = savedUsername
    remember.value = true
  }
  if (savedRole === 'teacher' || savedRole === 'student') {
    form.role = savedRole
  }
})
</script>

<style scoped>
/* 外层居中 */
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f3f5f9;
  padding: 20px;
}

/* 卡片 */
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px 45px 50px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
}

/* 标题 */
.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 26px;
  color: #1a73e8;
  font-weight: 700;
}

/* 角色单选横排 */
.role-group :deep(.el-radio) {
  margin-right: 24px;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.btn-group :deep(.el-button) {
  flex: 1;
}

/* 背景装饰圈/方块 */
.decoration {
  position: absolute;
  opacity: 0.08;
  pointer-events: none;
}

.decoration.circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #1a73e8;
  top: -35px;
  right: -35px;
}

.decoration.square {
  width: 90px;
  height: 90px;
  background: #34a853;
  bottom: -25px;
  left: -25px;
  transform: rotate(45deg);
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px 40px;
  }
  .title {
    font-size: 22px;
  }
}
</style>
