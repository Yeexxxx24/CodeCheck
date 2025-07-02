<template>
  <div class="register-container">
    <el-form :model="form" class="register-form">
      <!-- 用户输入框  -->
      <el-form-item>
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>

      <!-- 密码输入框 -->
      <el-form-item>
        <el-input v-model="form.password" placeholder="密码" show-password />
      </el-form-item>

      <!-- <el-form-item label="身份">
        <el-select v-model="form.role" placeholder="请选择身份">
          <el-option label="学生" value="student" />
          <el-option label="教师" value="teacher" />
        </el-select>
      </el-form-item> -->
      <!-- 注册按钮 -->
      <el-form-item>
        <div class="button-wrapper">
          <el-button type="primary" @click="hanldeRegister">注册</el-button>
        </div>
      </el-form-item>

      <!-- 登录跳转 -->
      <el-form-item>
        <div class="login-wrapper">
          <span>已有账号？</span>
          <el-button type="link" @click="goLogin">去登陆</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { useUserStore } from "@/stores/user";

const router = useRouter(); // 获取路由实例，用于跳转页面
const store = useUserStore();
// 注册表单的数据对象，响应式管理
const form = reactive({
  username: "",
  password: "",
  role: 'student' 
});

const hanldeRegister = async () => {
  try {
    // 向后端发送注册请求，请求地址为 /register，请求体为 form
    const res = await request.post("/register", form);

    //注册成功后，设置用户信息（相当于自动登录）
    store.setUser(res.data);

    //提示注册成功
    ElMessage.success("注册成功，请登录");

    //跳转到登录页面
    router.push("/login");
  } catch (error) {
    // 注册失败时的提示信息
    ElMessage.error("注册失败，请重试");
  }
};
// 点击“去登录”按钮，跳转登录页面
const goLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-form {
  width: 300px;
}
.button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}
.login-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 4px;
}
</style>
