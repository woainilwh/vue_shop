import Vue from 'vue'
import Router from 'vue-router'
const Login= () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home= () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome= () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

const Users= () => import(/* webpackChunkName: "users_rights_rples" */ '../components/user/User.vue')
const Rights= () => import(/* webpackChunkName: "users_rights_rples" */ '../components/power/Rights.vue')
const Roles= () => import(/* webpackChunkName: "users_rights_rples" */ '../components/power/Roles.vue')
// import Users from "../components/user/User.vue"
// import Rights from "../components/power/Rights.vue"
// import Roles from "../components/power/Roles.vue"

const Cate= () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue')
const Params= () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue')
// import Cate from "../components/goods/Cate.vue"
// import Params from "../components/goods/Params.vue"

const List= () => import(/* webpackChunkName: "list_add" */ '../components/goods/List.vue')
const Add= () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add.vue')
// import List from "../components/goods/List.vue"
// import Add from "../components/goods/Add.vue"

const Order= () => import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
const Report= () => import(/* webpackChunkName: "order_report" */ '../components/report/Report.vue')
// import Order from "../components/order/Order.vue"
// import Report from "../components/report/Report.vue"
Vue.use(Router)


const router = new Router({
  routes:[
    {
      path:'/',redirect:'login'
    },
    {
      path:'/login',component: Login
    },
    {
      path:"/home",
      component: Home,
      redirect:"/welcome",
      children:[
        {
          path:"/welcome",
          component: Welcome
        },
        {
          path:"/users",
          component: Users
        },
        {
          path:"/rights",
          component: Rights
        },
        {
          path:"/roles",
          component: Roles
        },
        {
          path:"/categories",
          component: Cate
        },
        {
          path:"/params",
          component:Params
        },
        {
          path:"/goods",
          component:List
        },
        {
          path:"/goods/add",
          component:Add
        },
        {
          path:"/orders",
          component:Order
        },
        {
          path:"/reports",
          component:Report
        }
      ]
    }
  ]
})

// 挂载路由守卫
router.beforeEach((to,from,next) =>  {
  // to 将要访问的路径
  //  from 代表从那个路径跳转而来
  // next 表示一个函数 表示放行
  // next()放行  next(/login) 强制跳转
  if(to.path === '/login'){
    return next()
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if(!tokenStr) return next("/login")
  next();

})

export default router