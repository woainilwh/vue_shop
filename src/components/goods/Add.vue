<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品的图片"></el-step>
        <el-step title="商品的内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                  children: 'children',
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 渲染表单的item项 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片要上传到的后台api地址 -->
            <!-- list-type指定预览模式 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce:"",
        attrs:[],
      },
      // 添加表单的校验规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品分类",
            trigger: "blur",
          },
        ],
      },
      // 保存请求来的商品分类的数据
      cateList: [],
      // 动态参数列表数据保存地
      manyTableData: [],
      // 静态属性列表保存数据
      onlyTableData: [],
      //上传图片的url地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      //
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 及联选择器选中项变化，就会触发这个函数
    handleChange() {
      // console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 离开当前标签去下一个标签的判断函数
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将进入的标签页"+ activeName);
      // console.log("即将离开的标签页"+ oldActiveName);
      // return false
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // tab被选中时触发的函数
    async tabClick() {
      // console.log(this.activeIndex);
      // 访问的时动态参数面板
      if (this.activeIndex === "1") {
        // console.log("动态参数面板");
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        this.$message.success("获取参数列表成功");
        // console.log(res.data);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        console.log(res.data);
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败");
        }
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response);
      // 1拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // console.log(picInfo);
      // 2将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm);
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file);
      // 1获取删除的图片的路径
      const filePath = file.response.data.tmp_path;
      // 2从pics数组中找到这个图片
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath;
      });

      // 3调用splice方法，把图片信息对象从pics中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 添加商品
    add(){
      this.$refs.addFormRef.validate( async valid => {
        if(!valid) {
          return this.$message.error("填写必要的表单项")
        }
        // 执行添加的业务逻辑
        // lodash包 cloneDeep(obj)方法 用来深拷贝
        const form = _.cloneDeep(this.addForm)
       form.goods_cat= form.goods_cat.join(",")
        // console.log(form);
        //处理动态参数
        this.manyTableData.forEach(item =>{
          const newInfo = {attr_id: item.attr_id,attr_value: item.attr_vals.join(" ")}
          this.addForm.attrs.push(newInfo)
          })
          // 静态属性
          this.onlyTableData.forEach( item => {
            const newInfo = {attr_id: item.attr_id,attr_value: item.attr_vals}
            this.addForm.attrs.push(newInfo)
        })
          form.attrs = this.addForm.attrs
          console.log(form);
          // 发起请求添加商品
          //商品名称必须是唯一的
          const {data:res} = await this.$http.post("goods",form)
          if(res.meta.status!==201){
            return this.$message.error("添加商品失败")
          }
          this.$message.success("添加商品成功")
          this.$router.push("/goods")
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style scoped lang="less">
.el-checkbox {
  margin: 0px 5px 0px 0px !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>