<template>
  <div class="tool-page">
    <h3>个人中心</h3>

    <el-card class="section-card">
      <h4>主题设置</h4>
      <el-radio-group v-model="theme" @change="setTheme">
        <el-radio-button value="dark">深色模式</el-radio-button>
        <el-radio-button value="light">浅色模式</el-radio-button>
        <el-radio-button value="system">跟随系统</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card class="section-card">
      <h4>数据管理</h4>
      <div class="data-actions">
        <el-button type="primary" @click="exportData">导出备份</el-button>
        <el-upload :auto-upload="false" :show-file-list="false" accept=".json" @change="importData">
          <el-button>导入恢复</el-button>
        </el-upload>
        <el-popconfirm title="确定清空所有数据？此操作不可恢复！" @confirm="clearAll">
          <template #reference>
            <el-button type="danger">清空数据</el-button>
          </template>
        </el-popconfirm>
      </div>
    </el-card>

    <el-card class="section-card">
      <h4>关于</h4>
      <div class="about-info">
        <p><strong>WorkerManTools</strong> v1.0.0</p>
        <p>程序员个人效率工具集平台</p>
        <p>技术栈：Vue3 + Vite + Element Plus + Electron</p>
        <p>所有数据本地存储，不上传云端</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const theme = ref(localStorage.getItem('appTheme') || 'dark')

function setTheme(val) {
  localStorage.setItem('appTheme', val)
  applyTheme(val)
  ElMessage.success('主题已切换')
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#f5f5f5')
    root.style.setProperty('--bg-secondary', '#ffffff')
  } else {
    root.style.setProperty('--bg-primary', '#1a1a2e')
    root.style.setProperty('--bg-secondary', '#1e1e3f')
  }
}

function exportData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    data[key] = localStorage.getItem(key)
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `devtools-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('备份已导出')
}

function importData(file) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value)
      }
      ElMessage.success('数据已恢复，请刷新页面')
    } catch {
      ElMessage.error('文件格式错误')
    }
  }
  reader.readAsText(file.raw)
}

function clearAll() {
  localStorage.clear()
  ElMessage.success('数据已清空，请刷新页面')
}
</script>

<style scoped>
.tool-page { max-width: 700px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.section-card { background: #1e1e3f; border-color: #2a2a5a; margin-bottom: 16px; }
.section-card h4 { color: #c0c0d0; margin-bottom: 12px; }
.data-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.about-info { color: #9090a0; font-size: 13px; line-height: 1.8; }
.about-info p { margin: 0; }
</style>