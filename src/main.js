import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import './plugins/element.js'
import './assets/global.css'
import axios from 'axios'


// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
// 在请求挂载之前设置请求拦截器
axios.interceptors.request.use(config =>{
  // console.log(config);
  // 给config里的headers属性添加一个值
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config  
  return config 
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
