<template>
  <el-container style="height: 100vh">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo">{{ systemTitle }}</div>
      <div class="user-info">
        <span>欢迎，{{ store.username }} ({{ roleLabel[store.role] }})</span>
        <el-button type="danger" @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧菜单栏 -->
      <el-aside width="200px" class="aside">
        <el-menu
          router
          :default-active="$route.path"
          class="el-menu-vertical-demo"
        >
          <!-- 学生菜单 -->
          <template v-if="store.role === 'student'">
            <el-menu-item index="/dashboard/check">查重模块</el-menu-item>
            <el-menu-item index="/dashboard/student-homework">提交作业</el-menu-item>
            <el-menu-item index="/dashboard/profile">个人信息</el-menu-item>
          </template>

          <!-- 教师菜单 -->
          <template v-if="store.role === 'teacher'">
            <el-menu-item index="/dashboard/all-history">所有学生记录</el-menu-item>
            <el-menu-item index="/dashboard/assign">发布作业</el-menu-item>
            <el-menu-item index="/dashboard/teacher-assignments">作业管理</el-menu-item>
            <!-- <el-menu-item index="/dashboard/assignment-list">作业管理</el-menu-item> -->
            <el-menu-item index="/dashboard/profile">个人信息</el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { computed } from "vue";

const store = useUserStore();
const router = useRouter();
// const route = useRoute();

const roleLabel: Record<string, string> = {
  student: "学生",
  teacher: "教师",
  "": "未定义",
};

const systemTitle = computed(() => {
  return store.role === "teacher" ? "代码查重系统" : "作业提交平台";
});

const handleLogout = () => {
  store.clearUser();
  ElMessage.success("已退出登录");
  router.push("/login");
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #409eff;
  color: white;
  padding: 0 20px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.aside {
  background-color: #f5f5f5;
  padding-top: 20px;
}

.main {
  padding: 40px;
}
</style>
