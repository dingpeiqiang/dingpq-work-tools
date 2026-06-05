<template>
  <div class="json-tool">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="small" @click="doFormat">格式化</el-button>
        <el-button size="small" @click="doCompact">压缩</el-button>
        <el-button size="small" @click="doValidate">校验</el-button>
        <el-button size="small" @click="doEscape">转义</el-button>
        <el-button size="small" @click="doUnescape">去转义</el-button>
        <el-button size="small" @click="doSortKeys">排序 Key</el-button>
        <el-button size="small" @click="doRepair">修复</el-button>
      </div>
      <div class="toolbar-right">
        <el-button size="small" @click="loadSample">示例</el-button>
        <el-button size="small" @click="clearAll">清空</el-button>
        <el-button size="small" type="success" @click="copyCode" :disabled="!codeText">复制</el-button>
        <el-button size="small" @click="downloadJson" :disabled="!parsedJson">下载</el-button>
      </div>
    </div>

    <!-- 双栏编辑区 -->
    <div class="editor-panes" ref="panesRef">
      <!-- 左侧：代码编辑器 -->
      <div class="pane pane-left" :style="{ width: leftWidth + 'px' }">
        <div class="pane-header">
          <span class="pane-title">JSON</span>
          <el-button link size="small" @click="pasteFromClipboard">粘贴</el-button>
        </div>
        <el-input
          v-model="codeText"
          type="textarea"
          class="code-editor"
          placeholder="在此粘贴或编辑 JSON 数据..."
          @input="onCodeChange"
        />
      </div>

      <!-- 分割线 -->
      <div class="splitter" @mousedown="startSplit" ref="splitterRef"></div>

      <!-- 右侧：树形视图 -->
      <div class="pane pane-right" :style="{ width: rightWidth + 'px' }">
        <div class="pane-header">
          <span class="pane-title">树形视图</span>
          <div class="pane-actions">
            <el-input
              v-model="searchText"
              size="small"
              placeholder="搜索 key 或 value..."
              clearable
              @input="doSearch"
              @clear="clearSearch"
              style="width: 180px"
            >
              <template #suffix>
                <span v-if="matchPaths.length" class="search-count">{{ currentMatchIndex + 1 }}/{{ matchPaths.length }}</span>
              </template>
            </el-input>
            <el-button link size="small" @click="prevMatch" :disabled="matchPaths.length === 0" title="上一个">↑</el-button>
            <el-button link size="small" @click="nextMatch" :disabled="matchPaths.length === 0" title="下一个">↓</el-button>
            <span class="pane-actions-sep">|</span>
            <el-button link size="small" @click="expandAllNodes">展开全部</el-button>
            <el-button link size="small" @click="collapseAllNodes">折叠全部</el-button>
          </div>
        </div>
        <div class="tree-area">
          <div v-if="parsedJson" class="tree-content">
            <JsonTreeNode
              :value="parsedJson"
              :depth="0"
              name="root"
              path="root"
              :matchPaths="matchPaths"
              :currentMatchPath="currentMatchPath"
              @update="(v) => onTreeUpdate(null, v)"
              @remove="() => { parsedJson = null; codeText = '' }"
            />
          </div>
          <el-empty v-else description="请输入有效 JSON 数据" :image-size="60" />
        </div>
      </div>
    </div>

    <!-- 底部统计栏 -->
    <div class="stats-bar">
      <span v-if="errorMsg" class="stat-error">{{ errorMsg }}</span>
      <span v-else-if="parsedJson" class="stat-ok">JSON 有效</span>
      <span v-else class="stat-idle">等待输入</span>
      <span class="stat-divider">|</span>
      <span>字符: {{ codeText.length }}</span>
      <span>大小: {{ sizeInfo }}</span>
      <span>节点: {{ nodeCount }}</span>
      <span>深度: {{ maxDepth }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import JsonTreeNode from '@/components/JsonTreeNode.vue'

const codeText = ref('')
const parsedJson = ref(null)
const errorMsg = ref('')
const expandAll = ref(0)

// 搜索
const searchText = ref('')
const matchPaths = ref([])
const currentMatchIndex = ref(0)

function collectPaths(obj, path = '') {
  const results = []
  if (obj === null || typeof obj !== 'object') return results
  const entries = Array.isArray(obj) ? obj.map((v, i) => [String(i), v]) : Object.entries(obj)
  for (const [k, v] of entries) {
    const p = Array.isArray(obj) ? (path ? path + '.' + k : k) : (path ? path + '.' + k : k)
    results.push({ path: p, key: k, value: v })
    if (v !== null && typeof v === 'object') {
      results.push(...collectPaths(v, p))
    }
  }
  return results
}

function doSearch() {
  const text = searchText.value.trim().toLowerCase()
  if (!text || !parsedJson.value) {
    matchPaths.value = []
    currentMatchIndex.value = 0
    return
  }
  const allPaths = collectPaths(parsedJson.value, 'root')
  matchPaths.value = allPaths
    .filter(p => String(p.key).toLowerCase().includes(text) || String(p.value).toLowerCase().includes(text))
    .map(p => p.path)
  currentMatchIndex.value = matchPaths.value.length > 0 ? 0 : -1
}

function clearSearch() {
  searchText.value = ''
  matchPaths.value = []
  currentMatchIndex.value = 0
}

function nextMatch() {
  if (matchPaths.value.length === 0) return
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matchPaths.value.length
}

function prevMatch() {
  if (matchPaths.value.length === 0) return
  currentMatchIndex.value = (currentMatchIndex.value - 1 + matchPaths.value.length) % matchPaths.value.length
}

const currentMatchPath = computed(() => {
  if (matchPaths.value.length === 0) return ''
  return matchPaths.value[currentMatchIndex.value] || ''
})

// 分栏拖拽
const panesRef = ref(null)
const splitterRef = ref(null)
const leftWidth = ref(0)
const rightWidth = ref(0)
let dragging = false

function initSplit() {
  if (!panesRef.value) return
  const total = panesRef.value.offsetWidth - 6
  leftWidth.value = Math.floor(total * 0.45)
  rightWidth.value = Math.floor(total * 0.55)
}

function startSplit(e) {
  e.preventDefault()
  dragging = true
  document.addEventListener('mousemove', onSplitMove)
  document.addEventListener('mouseup', onSplitUp)
}

function onSplitMove(e) {
  if (!dragging || !panesRef.value) return
  const rect = panesRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const minW = 200
  const total = rect.width - 6
  if (x > minW && x < total - minW) {
    leftWidth.value = x
    rightWidth.value = total - x
  }
}

function onSplitUp() {
  dragging = false
  document.removeEventListener('mousemove', onSplitMove)
  document.removeEventListener('mouseup', onSplitUp)
}

const nodeCount = ref(0)
const maxDepth = ref(0)

const sizeInfo = computed(() => {
  const bytes = new Blob([codeText.value]).size
  if (bytes < 1024) return bytes + ' B'
  return (bytes / 1024).toFixed(1) + ' KB'
})

function calcStats(obj, depth = 1) {
  if (obj === null || typeof obj !== 'object') return { count: 1, depth }
  let count = 1
  let maxD = depth
  const entries = Array.isArray(obj) ? obj : Object.values(obj)
  for (const v of entries) {
    if (v !== null && typeof v === 'object') {
      const r = calcStats(v, depth + 1)
      count += r.count
      if (r.depth > maxD) maxD = r.depth
    } else {
      count++
      maxD = Math.max(maxD, depth + 1)
    }
  }
  return { count, depth: maxD }
}

function onCodeChange() {
  errorMsg.value = ''
  if (!codeText.value.trim()) {
    parsedJson.value = null
    nodeCount.value = 0
    maxDepth.value = 0
    return
  }
  try {
    parsedJson.value = JSON.parse(codeText.value)
    const stats = calcStats(parsedJson.value)
    nodeCount.value = stats.count
    maxDepth.value = stats.depth
  } catch (e) {
    parsedJson.value = null
    errorMsg.value = 'JSON 解析错误: ' + e.message
  }
}

function onTreeUpdate(key, val) {
  // Update the parsedJson reference to trigger re-render
  parsedJson.value = val
  // Sync back to code editor
  codeText.value = JSON.stringify(parsedJson.value, null, 2)
  const stats = calcStats(parsedJson.value)
  nodeCount.value = stats.count
  maxDepth.value = stats.depth
  errorMsg.value = ''
}

function doFormat() {
  if (!parsedJson.value) return
  codeText.value = JSON.stringify(parsedJson.value, null, 2)
  errorMsg.value = ''
}

function doCompact() {
  if (!parsedJson.value) return
  codeText.value = JSON.stringify(parsedJson.value)
  errorMsg.value = ''
}

function doValidate() {
  try {
    JSON.parse(codeText.value)
    errorMsg.value = ''
    ElMessage.success('JSON 格式正确')
  } catch (e) {
    errorMsg.value = 'JSON 格式错误: ' + e.message
  }
}

function doEscape() {
  codeText.value = JSON.stringify(codeText.value)
  parsedJson.value = null
  errorMsg.value = ''
}

function doUnescape() {
  try {
    const obj = JSON.parse(codeText.value)
    codeText.value = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
    onCodeChange()
  } catch {
    errorMsg.value = '无法反转义'
  }
}

function doSortKeys() {
  if (!parsedJson.value) return
  const sorted = deepSortKeys(parsedJson.value)
  parsedJson.value = sorted
  codeText.value = JSON.stringify(sorted, null, 2)
  errorMsg.value = ''
}

function deepSortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(deepSortKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = deepSortKeys(obj[k]); return acc }, {})
  }
  return obj
}

function doRepair() {
  const text = codeText.value
    .replace(/,\s*}/g, '}')    // trailing comma before }
    .replace(/,\s*\]/g, ']')   // trailing comma before ]
    .replace(/(['"])?([a-zA-Z_]\w*)(['"])?\s*:/g, '"$2":') // unquoted keys
    .replace(/:\s*'([^']*)'/g, ':"$1"') // single quotes
    .replace(/\n/g, '')
  try {
    const obj = JSON.parse(text)
    parsedJson.value = obj
    codeText.value = JSON.stringify(obj, null, 2)
    errorMsg.value = ''
    ElMessage.success('修复成功')
  } catch (e) {
    errorMsg.value = '无法自动修复: ' + e.message
  }
}

function expandAllNodes() {
  expandAll.value++
  if (parsedJson.value) {
    parsedJson.value = JSON.parse(JSON.stringify(parsedJson.value))
  }
}

function collapseAllNodes() {
  expandAll.value--
  if (parsedJson.value) {
    parsedJson.value = JSON.parse(JSON.stringify(parsedJson.value))
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(codeText.value)
  ElMessage.success('已复制')
}

async function pasteFromClipboard() {
  try {
    codeText.value = await navigator.clipboard.readText()
    onCodeChange()
  } catch {
    ElMessage.warning('无法读取剪贴板')
  }
}

function downloadJson() {
  if (!parsedJson.value) return
  const blob = new Blob([JSON.stringify(parsedJson.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearAll() {
  codeText.value = ''
  parsedJson.value = null
  errorMsg.value = ''
  nodeCount.value = 0
  maxDepth.value = 0
}

function loadSample() {
  parsedJson.value = {
    name: 'DevTools',
    version: '1.0.0',
    databases: {
      mysql: { host: 'localhost', port: 3306, user: 'root' },
      redis: { host: '127.0.0.1', port: 6379, db: 0 }
    },
    features: [
      { id: 1, name: 'JSON Editor', enabled: true, tags: ['format', 'tree'] },
      { id: 2, name: 'XML Tool', enabled: true, tags: ['format', 'convert'] },
      { id: 3, name: 'HTTP Client', enabled: false, tags: [] }
    ],
    meta: { author: 'Dev', license: 'MIT', created: '2025-01-01' }
  }
  codeText.value = JSON.stringify(parsedJson.value, null, 2)
  const stats = calcStats(parsedJson.value)
  nodeCount.value = stats.count
  maxDepth.value = stats.depth
  errorMsg.value = ''
}

onMounted(() => {
  initSplit()
  window.addEventListener('resize', initSplit)
  loadSample()
})

onUnmounted(() => {
  window.removeEventListener('resize', initSplit)
})
</script>

<style scoped>
.json-tool {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #2a2a5a;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 4px;
}

/* 双栏编辑器 */
.editor-panes {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #1e1e3f;
  border: 1px solid #2a2a5a;
  border-radius: 6px;
  overflow: hidden;
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
  background: #16163a;
  border-bottom: 1px solid #2a2a5a;
  flex-shrink: 0;
}

.pane-title {
  font-size: 13px;
  color: #c0c0d0;
  font-weight: 600;
}

.pane-actions {
  display: flex;
  gap: 4px;
}

.pane-actions-sep {
  color: #3a3a6a;
  font-size: 14px;
  margin: 0 2px;
}

.search-count {
  font-size: 11px;
  color: #409eff;
  white-space: nowrap;
}

/* 分割线 */
.splitter {
  width: 6px;
  cursor: col-resize;
  flex-shrink: 0;
  background: transparent;
  transition: background 0.2s;
  border-radius: 3px;
  margin: 0 2px;
}

.splitter:hover {
  background: #409eff;
}

/* 代码编辑器 */
.code-editor {
  height: 100%;
}

.code-editor :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 300px;
  background: transparent;
  border: none;
  color: #c0c0d0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  box-shadow: none;
  padding: 8px;
}

.code-editor :deep(.el-textarea__inner):focus {
  box-shadow: none;
}

/* 树形区域 */
.tree-area {
  flex: 1;
  overflow: auto;
  padding: 6px;
}

.tree-content {
  min-height: 100%;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 12px;
  color: #9090a0;
  flex-shrink: 0;
  border-top: 1px solid #2a2a5a;
  margin-top: 6px;
}

.stat-ok { color: #67c23a; }
.stat-error { color: #f56c6c; }
.stat-idle { color: #9090a0; }
.stat-divider { color: #3a3a6a; }
</style>