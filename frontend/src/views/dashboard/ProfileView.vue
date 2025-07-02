<template>
  <div class="profile-wrapper">
    <h3>个人信息</h3>

    <!-- ✅ 折叠的修改密码 -->
    <el-collapse>
      <el-collapse-item title="修改密码" name="1">
        <el-form label-width="80px" :model="form" status-icon>
          <el-form-item label="旧密码">
            <el-input v-model="form.oldPassword" type="password" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="form.newPassword" type="password" />
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input v-model="form.confirmPassword" type="password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChangePassword"
              >确认修改</el-button
            >
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <!-- 查重记录表格 -->
    <el-table
     v-if="store.role === 'student'"
      :data="historyList || []"
      stripe
      border
      style="width: 100%; margin-top: 30px"
    >
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
     v-if="store.role === 'student'"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { useUserStore } from "@/stores/user";
import dayjs from "dayjs";

const store = useUserStore();

// ✅ 查重记录数据
// const historyList = ref([]);
const historyList = ref<any[]>([]); // 明确声明是数组类型


// ✅ 修改密码表单数据
const form = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// ✅ 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};


const currentPage = ref(1); //当前页
const pageSize = ref(5); //每页条数
const total = ref(0); //总记录数



// ✅ 修改密码处理函数
const handleChangePassword = async () => {
  if (
    !form.value.oldPassword ||
    !form.value.newPassword ||
    !form.value.confirmPassword
  ) {
    return ElMessage.warning("请填写完整信息");
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    return ElMessage.warning("两次输入的新密码不一致");
  }

  try {
    const res = await request.post("/change-password", {
      userId: store.id,
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword,
    });

    if (res.data.code === 200) {
      ElMessage.success("密码修改成功，请重新登录");
      // 可选：清空表单
      form.value.oldPassword = "";
      form.value.newPassword = "";
      form.value.confirmPassword = "";
    } else {
      ElMessage.error(res.data.message || "修改失败");
    }
  } catch (err) {
    console.error("修改密码出错", err);
    ElMessage.error("请求出错");
  }
};

// 修改查重记录获取请求，加上分页参数
const fetchHistory = async () => {
  try {
    const res = await request.get("/check/history", {
      params: {
        userId: store.id,
        page: currentPage.value,
        pageSize: pageSize.value,
      },
    });

    if (res.data.code === 200) {
      const records = res.data.data.records
      const totalCount = res.data.data.total

      historyList.value = Array.isArray(records) ? records : [] // ✅ 强制转数组
      total.value = totalCount
    } else {
      ElMessage.error(res.data.message || "获取记录失败")
    }
  } catch (error) {
    console.error("查重记录获取失败", error)
    ElMessage.error("请求出错")
  }
}

onMounted(() => {
  fetchHistory();
});

// 翻页监听
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchHistory();
};
</script>

<style scoped>
.profile-wrapper {
  padding: 30px;
}

.password-card {
  margin-bottom: 20px;
  padding: 20px;
}

.history-card {
  padding: 20px;
}
</style>
