import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import Dashboard from '@/views/Dashboard.vue'
import CheckView from '@/views/dashboard/CheckView.vue'
import ProfileView from '@/views/dashboard/ProfileView.vue'
import TeacherCheckView from '@/views/dashboard/TeacherCheckView.vue'
import AllHistoryView from '@/views/dashboard/TeacherAllHistoryView.vue'
import TeacherWelcome from '@/views/dashboard/TeacherWelcome.vue'
import AssignHomeworkView from '@/views/dashboard/TeacherAssignHomeworkView.vue'
import StudentHomeworkList from '@/views/dashboard/StudentHomeworkList.vue'
import SubmitHomeworkView from '@/views/dashboard/SubmitHomeworkView.vue'
import TeacherSubmissionsView from '@/views/dashboard/TeacherSubmissionsView.vue'
import TeacherAssignmentsView from '@/views/dashboard/TeacherAssignmentsView.vue'
import CheckResultView from '@/views/dashboard/CheckResultView.vue'

const routes: RouteRecordRaw[] = [
  // 重定向 用户访问时直接跳转到登录页面
  {
    path: '/',
    redirect: '/login' 
  },
  { 
    path: '/login', 
    component: LoginView 
  },
  { 
    path: '/register', 
    component: RegisterView 
  },
 
  { 
    path: '/dashboard', 
    component: Dashboard,
    children:[
      {
        path:'',
        redirect:'check'
      },
      {
        // 教师欢迎页
        path:'welcome',
        component:TeacherWelcome
      },
      {
        // 学生查重模块
        path:'check',
        component:CheckView
      },
      {
        // 用户个人信息页面
        path:'profile',
        component:ProfileView
      },
       { 
        // 教师查看所有学生查重记录
        path: 'all-history', 
        component: AllHistoryView 
      },
      {
        // 教师发布新作业
        path:'assign',
        component:AssignHomeworkView
      },
      {
        // 教师-我的作业
        path:'teacher-assignments',
        component:TeacherAssignmentsView
      },
    //  学生提交作业详情页
      {
        path:'student-homework',
        component:StudentHomeworkList
      },{
        path:'submit',
        component:SubmitHomeworkView
      },
      {
        path: 'teacher-submissions',
        component: TeacherSubmissionsView
      },
      {
        // 教师查看查重报告
        path:'check-result',
        component:CheckResultView
      }

    
    ]
  },
  {
    path:'/dashboard/teacher-check',
    component:TeacherCheckView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router
