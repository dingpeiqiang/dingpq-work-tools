<template>
  <div class="tool-page">
    <h3>AES / DES 加密</h3>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-input v-model="input" type="textarea" :rows="6" placeholder="输入文本..." />
      </el-col>
      <el-col :span="12">
        <el-input v-model="output" type="textarea" :rows="6" readonly placeholder="结果..." />
      </el-col>
    </el-row>
    <div class="config">
      <el-select v-model="algorithm" size="small" style="width: 120px">
        <el-option label="AES-CBC" value="AES-CBC" />
        <el-option label="AES-GCM" value="AES-GCM" />
        <el-option label="AES-CTR" value="AES-CTR" />
      </el-select>
      <el-input v-model="key" placeholder="密钥（16/24/32字符）" size="small" style="width: 220px" />
      <el-input v-model="iv" placeholder="IV（16字符）" size="small" style="width: 180px" />
    </div>
    <div class="toolbar">
      <el-button type="primary" @click="encrypt">加密</el-button>
      <el-button @click="decrypt">解密</el-button>
      <el-button @click="copy(output)" :disabled="!output">复制</el-button>
    </div>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
const algorithm = ref('AES-CBC')
const key = ref('1234567890123456')
const iv = ref('1234567890123456')
const errorMsg = ref('')

async function getKey() {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key.value).slice(0, 32)
  return await crypto.subtle.importKey('raw', keyData, { name: algorithm.value }, false, ['encrypt', 'decrypt'])
}

async function encrypt() {
  errorMsg.value = ''
  try {
    const cryptoKey = await getKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(input.value)
    const params = { name: algorithm.value }
    if (algorithm.value !== 'AES-GCM') {
      params.iv = new TextEncoder().encode(iv.value).slice(0, 16)
    } else {
      params.iv = new TextEncoder().encode(iv.value).slice(0, 12)
    }
    const encrypted = await crypto.subtle.encrypt(params, cryptoKey, data)
    output.value = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  } catch (e) {
    errorMsg.value = '加密失败: ' + e.message
  }
}

async function decrypt() {
  errorMsg.value = ''
  try {
    const cryptoKey = await getKey()
    const data = Uint8Array.from(atob(input.value), c => c.charCodeAt(0))
    const params = { name: algorithm.value }
    if (algorithm.value !== 'AES-GCM') {
      params.iv = new TextEncoder().encode(iv.value).slice(0, 16)
    } else {
      params.iv = new TextEncoder().encode(iv.value).slice(0, 12)
    }
    const decrypted = await crypto.subtle.decrypt(params, cryptoKey, data)
    output.value = new TextDecoder().decode(decrypted)
  } catch (e) {
    errorMsg.value = '解密失败: ' + e.message
  }
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 800px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.config { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.error { color: #f56c6c; margin-top: 8px; font-size: 13px; }
</style>