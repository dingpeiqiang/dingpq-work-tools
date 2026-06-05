<template>
  <div class="tool-page">
    <h3>XML 工具</h3>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-input v-model="input" type="textarea" :rows="18" placeholder="粘贴 XML 数据..." />
      </el-col>
      <el-col :span="12">
        <el-input v-model="output" type="textarea" :rows="18" readonly placeholder="结果..." />
      </el-col>
    </el-row>
    <div class="toolbar">
      <el-button type="primary" @click="format">格式化</el-button>
      <el-button @click="compress">压缩</el-button>
      <el-button @click="xmlToJson">XML → JSON</el-button>
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

function format() {
  errorMsg.value = ''
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(input.value, 'text/xml')
    const err = doc.querySelector('parsererror')
    if (err) { errorMsg.value = err.textContent; return }
    output.value = formatXml(doc.documentElement)
  } catch (e) {
    errorMsg.value = e.message
  }
}

function formatXml(node, indent = 0) {
  const pad = '  '.repeat(indent)
  if (node.nodeType === 3) {
    const text = node.textContent.trim()
    return text ? pad + text + '\n' : ''
  }
  if (node.nodeType === 8) return pad + '<!--' + node.textContent + '-->\n'
  let result = pad + '<' + node.nodeName
  for (const attr of node.attributes || []) {
    result += ` ${attr.name}="${attr.value}"`
  }
  if (!node.childNodes.length) {
    result += ' />\n'
    return result
  }
  result += '>\n'
  for (const child of node.childNodes) {
    result += formatXml(child, indent + 1)
  }
  result += pad + '</' + node.nodeName + '>\n'
  return result
}

function compress() {
  output.value = input.value.replace(/>\s+</g, '><').trim()
}

function xmlToJson() {
  errorMsg.value = ''
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(input.value, 'text/xml')
    output.value = JSON.stringify(xmlNodeToJson(doc.documentElement), null, 2)
  } catch (e) {
    errorMsg.value = e.message
  }
}

function xmlNodeToJson(node) {
  const obj = { [node.nodeName]: {} }
  for (const attr of node.attributes || []) {
    obj[node.nodeName]['@' + attr.name] = attr.value
  }
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent.trim()
      if (text) obj[node.nodeName]['#text'] = text
    } else if (child.nodeType === 1) {
      const childObj = xmlNodeToJson(child)
      Object.assign(obj[node.nodeName], childObj)
    }
  }
  return obj
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