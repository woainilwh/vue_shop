<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert
        title="注意，只允许修为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCateCase"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              label: 'cat_name',
              value: 'cat_id',
              children: 'children',
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scoped">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scoped.row.attr_id)"
                  >修改</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scoped.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scoped">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scoped.row.attr_id)"
                  
                  >编辑</el-button
                >
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scoped.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的对话框里的的内容 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改参数的对话框里的的内容 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 储存商品分类列表的数据
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateCase: [],
      // 被激活的页签
      activeName: "many",
      // 动态参数的数据
      manyTabDate: [],
      // 静态参数的数据
      onlyTabDate: [],
      // 控制添加对话框的显示隐藏
      addDialogVisible: false,
      // 添加参数表单数据对象
      addForm: {
        // 要添加的用户名保存的地方
        attr_name: "",
      },
      // 添加表单验证过规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
      // 控制修改对话框的显示和隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: "请输入参数名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    // 获取所有的商品分类列表
    async getCatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 级联选择框选中项变化会触发的函数
    handleChange() {
      this.getParamsData();
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数的列表数据 因为在选择第三季分类后 不管点击静态还是动态都需要刷新所以把他单独抽离出来，在点击事件上调用

    async getParamsData() {
      // console.log(this.selectedCateCase);
      // 证明选中的不是三级分类
      if (this.selectedCateCase.length != 3) {
        this.selectedCateCase = [];
        return;
      }
      // 证明选中的是三级分类
      // console.log(this.selectedCateCase);
      // 根据所选分类的id 和当前所处的面板获取对应参数

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      if (res.meta.status != 200) {
        return this.$message.error("获取参数列表失败");
      }
      // console.log(res.data);
      // 因为需要把静态和动态渲染在页面上
      // 所以需要做判断 判断是哪个表格的数据
      if (this.activeName === "many") {
        this.manyTabDate = res.data;
      } else {
        this.onlyTabDate = res.data;
      }
    },
    //  监听对话框关闭 对话框关闭时 清空对话框的函数
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击确定按钮 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }
        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击按钮，展示修改的对话框
    async showEditDialog(attr_id) {
      this.editDialogVisible = true
      // 查询当前参数的信息
      const {data : res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{
        attr_sel: this.activeName
      })
      if(res.meta.status !== 200){
        return this.$message.error("获取参数信息失败")
      }
      this.editForm = res.data
      // console.log(attr_id);
    },
    // 重置修改的表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮修改参数信息
    editParams(){
      this.$refs.editFormRef.validate(async valid =>{
        if(!valid) {
          return
        } 
      const {data : res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
          attr_name : this.editForm.attr_name,
          attr_sel : this.activeName
        })
        if(res.meta.status !== 200){
          return this.$message.error("修改参数失败")

        }
        this.$message.success("修改数据成功")
        
        this.getParamsData()
        this.editDialogVisible=false
      })
    },
    // 点击删除按钮 根据id删除对应的参数项
    async removeParams(id){
      // console.log(id);
        const configResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if(configResult !== "confirm"){
        return this.$message.info("已取消删除")
      }
      const {data : res}= await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
     if(res.meta.status !== 200){
       return this.$message.error("删除参数失败")
     }
     this.$message.success("删除参数成功")
     this.getParamsData()
    }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用，则返回true否则返回false
    isBtnDisabled() {
      if (this.selectedCateCase.length != 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateCase.length === 3) {
        return this.selectedCateCase[2];
      }
      return null;
    },
    //动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style scoped lang="less">
.cat_opt {
  margin: 15px 0px;
}
</style>