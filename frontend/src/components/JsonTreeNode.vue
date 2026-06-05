<template>
  <div class="json-node">
    <div class="node-row" :class="{ collapsed: !effectiveExpanded && isExpandable, matched: isMatched && !isCurrentMatch, 'current-match': isCurrentMatch }">
      <!-- 拖拽手柄 -->
      <span class="node-handle" title="拖拽排序">⋮⋮</span>

      <!-- 展开/折叠箭头 -->
      <span class="node-arrow" v-if="isExpandable" @click="expanded = !expanded">
        {{ effectiveExpanded ? '▼' : '▶' }}
      </span>
      <span class="node-arrow" v-else></span>

      <!-- 类型标签 -->
      <span class="node-type-badge" :class="type" v-if="!isExpandable">{{ typeBadge }}</span>
      <span class="node-type-badge" :class="type" v-else>{{ isArray ? '[' + (childrenVal || []).length + ']' : '{' + Object.keys(childrenVal || {}).length + '}' }}</span>

      <!-- Key -->
      <span class="node-key" v-if="name !== null" @dblclick="startEditKey">{{ editingKey ? '' : displayName }}</span>
      <input v-if="name !== null && editingKey" ref="keyInput" v-model="editKeyVal" class="node-inline-input" @blur="finishEditKey" @keydown.enter="finishEditKey" />
      <span class="node-colon" v-if="name !== null">: </span>

      <!-- Value (for leaf nodes) -->
      <template v-if="!isExpandable">
        <span class="node-value" :class="type" v-if="!editingValue" @dblclick="startEditValue">{{ displayValue }}</span>
        <input v-if="editingValue" ref="valInput" v-model="editVal" class="node-inline-input" @blur="finishEditValue" @keydown.enter="finishEditValue" />
      </template>

      <!-- Actions -->
      <span class="node-actions">
        <el-button link size="small" @click.stop="copyVal" title="复制值">📋</el-button>
        <el-button link size="small" @click.stop="copyPath" title="复制路径">🔗</el-button>
        <el-button link size="small" @click.stop="addSibling" title="添加同级">＋</el-button>
        <el-button link size="small" @click.stop="removeNode" title="删除">✕</el-button>
      </span>
    </div>

    <!-- Children -->
    <div v-if="effectiveExpanded && isExpandable" class="node-children">
      <JsonTreeNode
        v-for="(child, key) in childrenVal"
        :key="key"
        :name="isArray ? '[' + key + ']' : key"
        :value="child"
        :depth="depth + 1"
        :path="path ? path + '.' + key : String(key)"
        :matchPaths="matchPaths"
        :currentMatchPath="currentMatchPath"
        @update="(v) => updateChild(key, v)"
        @remove="() => removeChild(key)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  name: { default: null },
  value: { default: null },
  depth: { type: Number, default: 0 },
  path: { type: String, default: '' },
  matchPaths: { type: Array, default: () => [] },
  currentMatchPath: { type: String, default: '' }
})

const emit = defineEmits(['update', 'remove'])

const expanded = ref(props.depth < 2)

// 搜索匹配
const isMatched = computed(() => props.matchPaths.includes(props.path))
const isCurrentMatch = computed(() => props.currentMatchPath === props.path)

const hasMatchDescendant = computed(() => {
  if (!props.matchPaths.length) return false
  const prefix = props.path ? props.path + '.' : ''
  return props.matchPaths.some(p => p.startsWith(prefix) && p !== props.path)
})

// 有子节点匹配时自动展开
const effectiveExpanded = computed(() => {
  if (hasMatchDescendant.value) return true
  return expanded.value
})

// Inline editing
const editingKey = ref(false)
const editKeyVal = ref('')
const editingValue = ref(false)
const editVal = ref('')
const keyInput = ref(null)
const valInput = ref(null)

const type = computed(() => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  return typeof props.value
})

const isExpandable = computed(() => type.value === 'object' || type.value === 'array')
const isArray = computed(() => Array.isArray(props.value))

const childrenVal = computed(() => {
  if (Array.isArray(props.value)) return props.value
  if (typeof props.value === 'object' && props.value !== null) return props.value
  return null
})

const typeBadge = computed(() => {
  if (type.value === 'string') return 'str'
  if (type.value === 'number') return 'num'
  if (type.value === 'boolean') return 'bool'
  if (type.value === 'null') return 'null'
  return type.value
})

const displayName = computed(() => String(props.name))

const displayValue = computed(() => {
  if (props.value === null) return 'null'
  if (type.value === 'string') return '"' + props.value + '"'
  return String(props.value)
})

function startEditKey() {
  editKeyVal.value = String(props.name)
  editingKey.value = true
  nextTick(() => keyInput.value?.focus())
}

function finishEditKey() {
  editingKey.value = false
  if (editKeyVal.value !== String(props.name)) {
    emit('update', { key: editKeyVal.value, value: props.value })
  }
}

function startEditValue() {
  if (type.value === 'string') editVal.value = props.value
  else editVal.value = JSON.stringify(props.value)
  editingValue.value = true
  nextTick(() => valInput.value?.focus())
}

function finishEditValue() {
  editingValue.value = false
  let newVal = editVal.value
  // Try to parse number/boolean/null
  if (newVal === 'null') newVal = null
  else if (newVal === 'true') newVal = true
  else if (newVal === 'false') newVal = false
  else if (/^-?\d+(\.\d+)?$/.test(newVal)) newVal = Number(newVal)
  else if (/^\{.*\}$/.test(newVal.trim()) || /^\[.*\]$/.test(newVal.trim())) {
    try { newVal = JSON.parse(newVal) } catch { /* keep as string */ }
  }
  if (JSON.stringify(newVal) !== JSON.stringify(props.value)) {
    emit('update', newVal)
  }
}

function addSibling() {
  if (isArray.value) {
    emit('update', [...(childrenVal.value || []), null])
  } else {
    const newKey = 'newKey'
    emit('update', { ...(childrenVal.value || {}), [newKey]: '' })
  }
}

function removeNode() {
  emit('remove')
}

function updateChild(key, val) {
  if (isArray.value) {
    const arr = [...(childrenVal.value || [])]
    if (typeof val === 'object' && val !== null && 'key' in val) {
      // Key rename for objects
    } else {
      arr[key] = val
    }
    emit('update', arr)
  } else {
    const obj = { ...(childrenVal.value || {}) }
    if (typeof val === 'object' && val !== null && 'key' in val) {
      obj[val.key] = val.value
      delete obj[key]
    } else {
      obj[key] = val
    }
    emit('update', obj)
  }
}

function removeChild(key) {
  if (isArray.value) {
    const arr = [...(childrenVal.value || [])]
    arr.splice(key, 1)
    emit('update', arr)
  } else {
    const obj = { ...(childrenVal.value || {}) }
    delete obj[key]
    emit('update', obj)
  }
}

function copyVal() {
  const text = type.value === 'string' ? props.value : JSON.stringify(props.value)
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

function copyPath() {
  navigator.clipboard.writeText(props.path || String(props.name))
  ElMessage.success('路径已复制')
}
</script>

<style scoped>
.json-node {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.7;
  user-select: none;
}

.node-row {
  display: flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  transition: background 0.1s;
  cursor: default;
}

.node-row:hover {
  background: rgba(64, 158, 255, 0.08);
}

.node-row.matched {
  background: rgba(230, 162, 60, 0.15);
}

.node-row.current-match {
  background: rgba(64, 158, 255, 0.25);
  outline: 1px solid #409eff;
}

.node-row.collapsed {
  opacity: 0.7;
}

.node-handle {
  color: #505070;
  cursor: grab;
  font-size: 10px;
  letter-spacing: -2px;
  margin-right: 2px;
  opacity: 0;
  flex-shrink: 0;
}

.node-row:hover .node-handle {
  opacity: 0.6;
}

.node-arrow {
  width: 16px;
  color: #707090;
  font-size: 10px;
  flex-shrink: 0;
  cursor: pointer;
}

.node-type-badge {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  margin-right: 4px;
  flex-shrink: 0;
  font-weight: bold;
}

.node-type-badge.string { background: rgba(103, 194, 58, 0.2); color: #67c23a; }
.node-type-badge.number { background: rgba(64, 158, 255, 0.2); color: #409eff; }
.node-type-badge.boolean { background: rgba(230, 162, 60, 0.2); color: #e6a23c; }
.node-type-badge.null { background: rgba(144, 144, 160, 0.2); color: #9090a0; }
.node-type-badge.object { background: rgba(144, 144, 160, 0.15); color: #9090a0; }
.node-type-badge.array { background: rgba(144, 144, 160, 0.15); color: #9090a0; }

.node-key {
  color: #e6a23c;
  flex-shrink: 0;
}

.node-colon {
  color: #9090a0;
  margin-right: 4px;
}

.node-value {
  word-break: break-all;
}

.node-value.string { color: #67c23a; }
.node-value.number { color: #409eff; }
.node-value.boolean { color: #e6a23c; }
.node-value.null { color: #9090a0; font-style: italic; }

.node-inline-input {
  background: #2a2a5a;
  border: 1px solid #409eff;
  color: #c0c0d0;
  font-family: inherit;
  font-size: inherit;
  padding: 0 4px;
  border-radius: 2px;
  outline: none;
  min-width: 60px;
}

.node-actions {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  display: flex;
  gap: 0;
}

.node-row:hover .node-actions {
  opacity: 1;
}

.node-children {
  border-left: 1px solid #2a2a5a;
  margin-left: 8px;
}
</style>