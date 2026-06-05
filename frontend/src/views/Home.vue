<template>
  <div class="home">
    <div class="welcome">
      <h2>DevTools Pro</h2>
      <p>程序员个人效率工具集 - 离线可用 · 数据私有 · 无广告</p>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card shadow="hover" class="action-card" @click="copyNow('timestamp')">
        <el-icon :size="28"><Clock /></el-icon>
        <span>复制时间戳</span>
        <small>{{ timestamp }}</small>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="copyNow('uuid')">
        <el-icon :size="28"><Key /></el-icon>
        <span>复制 UUID</span>
        <small>{{ uuidStr }}</small>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="copyNow('password')">
        <el-icon :size="28"><Lock /></el-icon>
        <span>随机密码</span>
        <small>{{ randomPwd }}</small>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="goTo('/json')">
        <el-icon :size="28"><Document /></el-icon>
        <span>JSON 格式化</span>
        <small>快速格式化</small>
      </el-card>
    </div>

    <!-- 常用工具 -->
    <div class="section">
      <h3>常用工具</h3>
      <div class="tool-grid">
        <el-card
          v-for="(tool, i) in favoriteTools"
          :key="i"
          shadow="hover"
          class="tool-card"
          @click="goTo(tool.path)"
        >
          <el-icon :size="24"><component :is="tool.icon" /></el-icon>
          <span>{{ tool.title }}</span>
        </el-card>
      </div>
    </div>

    <!-- 最近使用 -->
    <div class="section" v-if="recentTools.length">
      <h3>最近使用</h3>
      <div class="recent-list">
        <el-tag
          v-for="(tool, i) in recentTools"
          :key="i"
          type="info"
          class="recent-tag"
          @click="goTo(tool.path)"
        >
          {{ tool.title }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const timestamp = computed(() => Date.now())
const uuidStr = computed(() => crypto.randomUUID())
const randomPwd = computed(() => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let pwd = ''
  for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
})

const favoriteTools = [
  { title: 'JSON 工具', path: '/json', icon: 'Document' },
  { title: '时间戳', path: '/timestamp', icon: 'Clock' },
  { title: 'Base64', path: '/encode', icon: 'Transform' },
  { title: '哈希加密', path: '/hash', icon: 'Lock' },
  { title: '文本处理', path: '/text-process', icon: 'Edit' },
  { title: '进制转换', path: '/base-convert', icon: 'Switch' },
  { title: '正则测试', path: '/regex', icon: 'Search' },
  { title: 'UUID 生成', path: '/uuid', icon: 'Key' }
]

const recentTools = ref(loadRecent())

function loadRecent() {
  try { return JSON.parse(localStorage.getItem('recentTools') || '[]') } catch { return [] }
}

function saveRecent(path, title) {
  const list = loadRecent().filter(t => t.path !== path)
  list.unshift({ path, title })
  localStorage.setItem('recentTools', JSON.stringify(list.slice(0, 10)))
  recentTools.value = list.slice(0, 10)
}

function goTo(path) {
  const route = router.resolve(path)
  const title = route.meta?.title || path
  saveRecent(path, title)
  router.push(path)
}

async function copyNow(type) {
  let text = ''
  if (type === 'timestamp') text = String(timestamp.value)
  else if (type === 'uuid') text = uuidStr.value
  else if (type === 'password') text = randomPwd.value
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
}

.welcome {
  text-align: center;
  margin-bottom: 30px;
}

.welcome h2 {
  font-size: 28px;
  color: #409eff;
  margin-bottom: 8px;
}

.welcome p {
  color: #9090a0;
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.action-card {
  text-align: center;
  cursor: pointer;
  background: #1e1e3f;
  border-color: #2a2a5a;
  transition: transform 0.15s;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: #409eff;
}

.action-card .el-icon {
  color: #409eff;
  margin-bottom: 8px;
}

.action-card span {
  display: block;
  color: #c0c0d0;
  font-size: 14px;
  margin-bottom: 4px;
}

.action-card small {
  color: #707080;
  font-size: 12px;
  word-break: break-all;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  color: #c0c0d0;
  font-size: 16px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.tool-card {
  text-align: center;
  cursor: pointer;
  background: #1e1e3f;
  border-color: #2a2a5a;
  padding: 16px 8px;
  transition: transform 0.15s;
}

.tool-card:hover {
  transform: translateY(-2px);
  border-color: #409eff;
}

.tool-card .el-icon {
  color: #409eff;
  margin-bottom: 6px;
}

.tool-card span {
  display: block;
  color: #c0c0d0;
  font-size: 13px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-tag {
  cursor: pointer;
  background: #2a2a5a;
  border-color: #3a3a6a;
  color: #c0c0d0;
}

.recent-tag:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>