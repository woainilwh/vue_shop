<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <!-- 搜索与添加区域 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <template #prepend></template>
            <template #append>
              <el-button icon="el-icon-search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{ scope.row }} -->
            <!--@change 用来监听switch变化 -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClose"
  >
  <p>当前用户：{{ userInfo.username }}</p>
  <p>当前角色: {{ userInfo.role_name }}</p>
  <p>分配新角色：
      <el-select v-model="selectRoleId" placeholder="请选择">
    <el-option
      v-for="item in rolesList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
  </p>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    // 自定义校验规则
    // 邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确的邮箱"));
    };
    // 手机
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        //当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加表单用户规则
      addFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            tirgger: "blur",
          },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3~10之间",
            tigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            tirgger: "blur",
          },
          {
            min: 6,
            max: 15,
            message: "密码长度在6~15之间",
            tigger: "blur",
          },
        ],
        email: [
          {
            required: true,
            message: "请输入邮箱",
            tirgger: "blur",
          },
          {
            validator: checkEmail,
            tirgger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机",
            tirgger: "blur",
          },
          {
            validator: checkMobile,
            tirgger: "blur",
          },
        ],
      },
      // 控制编辑用户对话框的现实和隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单校验规则
      editFormRules: {
        email: [
          {
            required: true,
            message: "请输入邮箱",
            tirgger: "blur",
          },
          {
            validator: checkEmail,
            tirgger: "blur",
          },
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机",
            tirgger: "blur",
          },
          {
            validator: checkMobile,
            tirgger: "blur",
          },
        ],
      },
      // 控制分配角色对话框的显示和隐藏
      setRoleDialogVisible:false,
      // 需要被分配角色权限的用户信息
      userInfo :{},
      // 所有角色的数据列表
      rolesList:[],
      // 已选中的角色id值
      selectRoleId:"",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.meta.status != 200)
        return this.$message.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesizi改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch开关状态的改变
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.ma_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) {
          this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功");
        // 隐藏添加的对话框
        this.addDialogVisible = false;
        // 刷新列表
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200) {
        return this.$message.error("编辑用户信息失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getUserList();
        // 提示修改成功
        this.$message.success("更新用户信息成功");
      });
    },
    // 根据id删除对应的用户信息
    async removeUserById(id) {
      // console.log(id);
      // 弹框询问是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch(err => {
        return err
      })
      // 如果用户确定删除则返回confirm 字符串
      // 如果用户取消了删除，则返回值为字符串cancel
      // console.log(confirmResult);
      if(confirmResult !== "confirm"){
        return this.$message.info("已经取消删除")
      }
      // console.log("确认删除");
      const {data:res} =await this.$http.delete("users/"+id)
      if(res.meta.status !=200){
        return this.$message.error("删除用户失败")

      }
      this.$message.success("删除用户成功")
      this.getUserList();
    },
    // 展示分配角色的对话框
    async setRole(userInfo){
      this.userInfo = userInfo

      // 在展示对话框之前 获取所有角色列表
      const {data: res} = await this.$http.get("roles")
      if(res.meta.status !=200){
        return this.$message.error("获取角色失败！")

      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮分配角色
    async saveRoleInfo(){
      if(!this.selectRoleId){
        return this.$message.error("请选择要分配的角色")

      }
     const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid : this.selectRoleId})
      if(res.meta.status != 200){
        this.$message.error("更新角色失败")
        console.log(res.meta);

      }
      this.$message.success("更新用户成功")
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色d
    setRoleDialogClose(){
      this.selectRoleId="",
      this.userInfo = []    
    }
  }
};
</script>

<style lang="less" scoped>
</style>