<template>
  <el-container class="homecontainer">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/11.jpg" alt="" />
        <span> 后台管理系统 </span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 页面主体边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
           <!--侧边栏缩小建  -->
        <div class="toggle-button" @click="toggleCollapse">
            |||
        </div>
        <!-- 侧边栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template #title>
              <!-- 图标 -->
              <i :class="iconsObj[item.id]" class="iconfont"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
             <el-menu-item :index="'/'+subItem.path" 
             v-for="subItem in item.children" 
             :key="subItem.id"
             @click="saveNameState('/'+subItem.path)"
             >
              <!-- 二级菜单图标 -->
              <i class="el-icon-menu"></i>
              <!-- 二级菜单文本 -->
              <span>{{ subItem.authName }}</span>
             </el-menu-item>
          </el-submenu>
         
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 放置路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data(){
    return{
      // 左侧菜单数据
      menulist:[],
      iconsObj:{
        '125':'el-icon-user-solid',
        '103':'el-icon-suitcase',
        '101':'el-icon-shopping-bag-2',
        '102':'el-icon-notebook-2',
        '145':'el-icon-data-line',
      },
      isCollapse:false,
      // 被激活的连接地址
      activePath:''
    }
  },
  created(){
    this.getMenuList(),
    this.activePath = window.sessionStorage.getItem("activePath")
    
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      // 解构赋值重新命名为res
      const {data:res} = await this.$http.get('menus')
      // console.log(res);
      if(res.meta.status !== 200) return this.$message.error(res.mate.msg)
      this.menulist = res.data
    },
    
  // 点击按钮切换菜单折叠与展开
      toggleCollapse(){
        this.isCollapse = !this.isCollapse
  },
  // 保存连接的激活状态
    saveNameState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
}
.el-header img {
  width: 70px;
}
.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.homecontainer {
  height: 100%;
}
.iconfont{
  margin-right: 15px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>