<template>
  <div class="assign-wrapper">
    <h3>发布新作业</h3>

    <el-form :model="form" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input type="textarea" v-model="form.description" :rows="5" />
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker
          v-model="form.deadline"
          type="datetime"
          placeholder="选择截止时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleAssign">发布作业</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { useUserStore } from "@/stores/user";

const store = useUserStore()

const form = ref({
  title: "",
  description: "",
  deadline: "",
  // teacherId:""
});

const handleAssign = async () => {
  if (!form.value.title || !form.value.description ||!form.value.deadline) {
    return ElMessage.warning("请填写完整信息");
  }

  try {
    const res = await request.post("/assignment/publish", {
      title: form.value.title,
      description: form.value.description,
      deadline:form.value.deadline,
      teacherId:store.id
    });

    if (res.data.code === 200) {
      ElMessage.success("作业发布成功");
      form.value.title = "";
      form.value.description = "";
    } else {
      ElMessage.error(res.data.message || "发布失败");
    }
  } catch (error) {
    console.error("发布失败", error);
    ElMessage.error("请求失败");
  }
};
</script>

<style scoped>
h3 {
  text-align: center;
}
.assign-wrapper {
  padding: 30px;
  max-width: 600px;
}
</style>
