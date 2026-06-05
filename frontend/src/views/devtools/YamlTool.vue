<template>
  <div class="tool-page">
    <h3>YAML 工具</h3>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-input v-model="input" type="textarea" :rows="18" placeholder="粘贴 YAML 数据..." />
      </el-col>
      <el-col :span="12">
        <el-input v-model="output" type="textarea" :rows="18" readonly placeholder="结果..." />
      </el-col>
    </el-row>
    <div class="toolbar">
      <el-button type="primary" @click="yamlToJson">YAML → JSON</el-button>
      <el-button @click="jsonToYaml">JSON → YAML</el-button>
      <el-button @click="validate">校验</el-button>
      <el-button @click="copyOutput" :disabled="!output">复制结果</el-button>
      <el-button @click="clear">清空</el-button>
    </div>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
const errorMsg = ref('')

function yamlToJson() {
  errorMsg.value = ''
  try {
    const obj = parseYaml(input.value)
    output.value = JSON.stringify(obj, null, 2)
  } catch (e) {
    errorMsg.value = 'YAML 格式错误: ' + e.message
  }
}

function jsonToYaml() {
  errorMsg.value = ''
  try {
    const obj = JSON.parse(input.value)
    output.value = toYaml(obj)
  } catch (e) {
    errorMsg.value = 'JSON 格式错误: ' + e.message
  }
}

function validate() {
  errorMsg.value = ''
  try {
    parseYaml(input.value)
    ElMessage.success('YAML 格式正确')
  } catch (e) {
    errorMsg.value = 'YAML 格式错误: ' + e.message
  }
}

// 简易 YAML 解析器
function parseYaml(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
  // 检测是否为 JSON
  if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
    return JSON.parse(text)
  }
  const result = {}
  let currentObj = result
  const stack = [{ obj: result, indent: -1 }]

  for (const line of lines) {
    const indent = line.search(/\S/)
    const trimmed = line.trim()
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    currentObj = stack[stack.length - 1].obj

    const key = trimmed.substring(0, colonIdx).trim()
    let value = trimmed.substring(colonIdx + 1).trim()

    if (value === '' || value === '|' || value === '>') {
      currentObj[key] = {}
      stack.push({ obj: currentObj[key], indent })
    } else {
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (value === 'null' || value === '~') value = null
      else if (/^-?\d+\.?\d*$/.test(value)) value = Number(value)
      else if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1)
      }
      currentObj[key] = value
    }
  }
  return result
}

function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'boolean') return String(obj)
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') {
    if (/[:\n#{}[\]&*!|>'%@`]/.test(obj) || obj.includes('  ')) return `"${obj}"`
    return obj
  }
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]'
    return obj.map(item => pad + '- ' + toYaml(item, indent + 1).replace(/^  /, '')).join('\n')
  }
  const entries = Object.entries(obj)
  if (!entries.length) return '{}'
  return entries.map(([k, v]) => {
    if (typeof v === 'object' && v !== null) {
      return pad + k + ':\n' + toYaml(v, indent + 1)
    }
    return pad + k + ': ' + toYaml(v)
  }).join('\n')
}

async function copyOutput() {
  await navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}

function clear() { input.value = ''; output.value = ''; errorMsg.value = '' }
</script>

<style scoped>
.tool-page { max-width: 1100px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.error { color: #f56c6c; margin-top: 8px; font-size: 13px; }
</style>