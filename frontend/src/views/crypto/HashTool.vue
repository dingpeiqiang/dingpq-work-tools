<template>
  <div class="tool-page">
    <h3>哈希加密</h3>
    <el-input v-model="input" type="textarea" :rows="4" placeholder="输入文本..." />
    <div class="toolbar">
      <el-button type="primary" @click="hash('MD5')">MD5</el-button>
      <el-button @click="hash('SHA-1')">SHA-1</el-button>
      <el-button @click="hash('SHA-256')">SHA-256</el-button>
      <el-button @click="hash('SHA-512')">SHA-512</el-button>
    </div>
    <div v-if="result" class="result-card">
      <div class="result-label">{{ algorithm }}</div>
      <div class="result-value">{{ result }}</div>
      <el-button size="small" @click="copy(result)">复制</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const result = ref('')
const algorithm = ref('')

async function hash(algo) {
  if (!input.value.trim()) { ElMessage.warning('请输入文本'); return }
  algorithm.value = algo
  const encoder = new TextEncoder()
  const data = encoder.encode(input.value)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  result.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 700px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.result-card { margin-top: 16px; background: #1e1e3f; padding: 16px; border-radius: 8px; border: 1px solid #2a2a5a; }
.result-label { color: #409eff; font-size: 14px; margin-bottom: 8px; }
.result-value { color: #c0c0d0; font-family: monospace; word-break: break-all; margin-bottom: 8px; }
</style>