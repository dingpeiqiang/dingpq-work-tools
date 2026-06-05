<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo" @click="$router.push('/home')">
        <el-icon :size="24"><Tools /></el-icon>
        <span v-show="!isCollapse" class="logo-text">DevTools Pro</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页工作台</span>
        </el-menu-item>

        <el-sub-menu index="devtools">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>开发工具</span>
          </template>
          <el-menu-item index="/json">JSON 工具</el-menu-item>
          <el-menu-item index="/xml">XML 工具</el-menu-item>
          <el-menu-item index="/yaml">YAML 工具</el-menu-item>
          <el-menu-item index="/timestamp">时间戳转换</el-menu-item>
          <el-menu-item index="/uuid">唯一ID生成</el-menu-item>
          <el-menu-item index="/regex">正则测试</el-menu-item>
          <el-menu-item index="/base-convert">进制转换</el-menu-item>
          <el-menu-item index="/http-request">HTTP 请求</el-menu-item>
          <el-menu-item index="/curl">CURL 转代码</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="text">
          <template #title>
            <el-icon><Edit /></el-icon>
            <span>文本处理</span>
          </template>
          <el-menu-item index="/text-process">文本处理</el-menu-item>
          <el-menu-item index="/encode">编码转换</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="crypto">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>加密转换</span>
          </template>
          <el-menu-item index="/hash">哈希加密</el-menu-item>
          <el-menu-item index="/aes">AES/DES 加密</el-menu-item>
          <el-menu-item index="/rsa">RSA 加密</el-menu-item>
          <el-menu-item index="/password">密码工具</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="office">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>办公辅助</span>
          </template>
          <el-menu-item index="/unit">单位换算</el-menu-item>
          <el-menu-item index="/qrcode">二维码工具</el-menu-item>
          <el-menu-item index="/color">颜色工具</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="knowledge">
          <template #title>
            <el-icon><Collection /></el-icon>
            <span>知识库</span>
          </template>
          <el-menu-item index="/snippet">代码片段</el-menu-item>
          <el-menu-item index="/notes">技术笔记</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="sidebar-footer">
        <el-menu :collapse="isCollapse" router class="sidebar-menu">
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <el-header class="top-bar">
        <div class="top-left">
          <el-button text @click="isCollapse = !isCollapse">
            <el-icon :size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
        </div>
        <div class="top-center">
          <el-input
            v-model="searchText"
            placeholder="搜索工具、笔记、代码片段..."
            :prefix-icon="Search"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="top-right">
          <el-button text @click="$router.push('/settings')">
            <el-icon :size="20"><Setting /></el-icon>
          </el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="content-area">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const searchText = ref('')

const activeMenu = computed(() => route.path)

function handleSearch() {
  if (!searchText.value.trim()) return
  const tools = [
    { name: 'JSON 工具', path: '/json', keywords: 'json 格式化 压缩 校验' },
    { name: 'XML 工具', path: '/xml', keywords: 'xml 格式化' },
    { name: 'YAML 工具', path: '/yaml', keywords: 'yaml 格式化' },
    { name: '时间戳转换', path: '/timestamp', keywords: '时间戳 日期 时间' },
    { name: '唯一ID生成', path: '/uuid', keywords: 'uuid 雪花id 随机字符串' },
    { name: '正则测试', path: '/regex', keywords: '正则 正则表达式' },
    { name: '进制转换', path: '/base-convert', keywords: '进制 二进制 十六进制' },
    { name: 'HTTP 请求', path: '/http-request', keywords: 'http 请求 api 接口' },
    { name: 'CURL 转代码', path: '/curl', keywords: 'curl' },
    { name: '文本处理', path: '/text-process', keywords: '文本 去空格 去重 排序' },
    { name: '编码转换', path: '/encode', keywords: 'url编码 base64 unicode' },
    { name: '哈希加密', path: '/hash', keywords: 'md5 sha1 sha256 sha512' },
    { name: 'AES/DES 加密', path: '/aes', keywords: 'aes des 加密 解密' },
    { name: 'RSA 加密', path: '/rsa', keywords: 'rsa 公钥 私钥' },
    { name: '密码工具', path: '/password', keywords: '密码 随机密码' },
    { name: '单位换算', path: '/unit', keywords: '单位 字节 换算' },
    { name: '二维码工具', path: '/qrcode', keywords: '二维码 qrcode' },
    { name: '颜色工具', path: '/color', keywords: '颜色 rgb hex' },
    { name: '代码片段', path: '/snippet', keywords: '代码 片段' },
    { name: '技术笔记', path: '/notes', keywords: '笔记 markdown' },
    { name: '个人中心', path: '/settings', keywords: '设置 主题 快捷键' }
  ]
  const q = searchText.value.toLowerCase()
  const match = tools.find(t => t.name.toLowerCase().includes(q) || t.keywords.includes(q))
  if (match) {
    router.push(match.path)
    searchText.value = ''
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background: #1a1a2e;
}

.sidebar {
  background: #16163a;
  border-right: 1px solid #2a2a5a;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  overflow: hidden;
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #409eff;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #2a2a5a;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-footer {
  border-top: 1px solid #2a2a5a;
  flex-shrink: 0;
}

.main-container {
  flex-direction: column;
}

.top-bar {
  height: 50px;
  background: #1e1e3f;
  border-bottom: 1px solid #2a2a5a;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: center;
}

.top-center {
  flex: 1;
  max-width: 500px;
}

.search-input {
  --el-input-bg-color: #2a2a5a;
  --el-input-border-color: #3a3a6a;
  --el-input-hover-border-color: #409eff;
  --el-input-focus-border-color: #409eff;
}

.content-area {
  background: #1a1a2e;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* 深色主题覆盖 Element Plus 菜单样式 */
:deep(.el-menu) {
  background: #16163a;
  --el-menu-text-color: #c0c0d0;
  --el-menu-hover-bg-color: #2a2a5a;
  --el-menu-active-color: #409eff;
  --el-menu-bg-color: #16163a;
}

:deep(.el-sub-menu__title) {
  color: #9090a0 !important;
  font-size: 13px;
}

:deep(.el-menu-item) {
  font-size: 13px;
}

:deep(.el-input__wrapper) {
  background-color: #2a2a5a !important;
  box-shadow: none !important;
}

:deep(.el-button) {
  color: #c0c0d0;
}
</style>