<template>
  <div class="tool-page">
    <h3>RSA 加密（演示）</h3>
    <el-alert
      title="RSA 加密说明"
      type="info"
      description="浏览器 Web Crypto API 支持 RSA-OAEP 加密。请粘贴 PEM 格式公钥/私钥。"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />
    <el-row :gutter="16">
      <el-col :span="12">
        <el-input v-model="input" type="textarea" :rows="6" placeholder="输入文本..." />
      </el-col>
      <el-col :span="12">
        <el-input v-model="output" type="textarea" :rows="6" readonly placeholder="结果..." />
      </el-col>
    </el-row>
    <div class="config">
      <el-input v-model="pemKey" type="textarea" :rows="5" placeholder="粘贴 PEM 格式公钥或私钥..." />
    </div>
    <div class="toolbar">
      <el-button type="primary" @click="encrypt">公钥加密</el-button>
      <el-button @click="decrypt">私钥解密</el-button>
      <el-button @click="genKeyPair">生成密钥对</el-button>
      <el-button @click="copy(output)" :disabled="!output">复制</el-button>
    </div>
    <div v-if="generatedKeys" class="keys-output">
      <h4>生成的密钥对：</h4>
      <h5>公钥：</h5>
      <el-input v-model="generatedKeys.publicKey" type="textarea" :rows="4" readonly />
      <h5>私钥：</h5>
      <el-input v-model="generatedKeys.privateKey" type="textarea" :rows="6" readonly />
    </div>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
const pemKey = ref('')
const errorMsg = ref('')
const generatedKeys = ref(null)

async function importPemKey(usage) {
  const pem = pemKey.value.trim()
  const isPrivate = pem.includes('PRIVATE KEY')
  const b64 = pem
    .replace(/-----[^-]+-----/g, '')
    .replace(/\s/g, '')
  const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  const format = isPrivate ? 'pkcs8' : 'spki'
  return await crypto.subtle.importKey(
    format, binary,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false, [usage]
  )
}

async function encrypt() {
  errorMsg.value = ''
  try {
    const key = await importPemKey('encrypt')
    const encoder = new TextEncoder()
    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, encoder.encode(input.value))
    output.value = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  } catch (e) {
    errorMsg.value = '加密失败: ' + e.message
  }
}

async function decrypt() {
  errorMsg.value = ''
  try {
    const key = await importPemKey('decrypt')
    const data = Uint8Array.from(atob(input.value), c => c.charCodeAt(0))
    const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, data)
    output.value = new TextDecoder().decode(decrypted)
  } catch (e) {
    errorMsg.value = '解密失败: ' + e.message
  }
}

async function genKeyPair() {
  try {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true, ['encrypt', 'decrypt']
    )
    const pubKey = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    generatedKeys.value = {
      publicKey: '-----BEGIN PUBLIC KEY-----\n' + btoa(String.fromCharCode(...new Uint8Array(pubKey))) + '\n-----END PUBLIC KEY-----',
      privateKey: '-----BEGIN PRIVATE KEY-----\n' + btoa(String.fromCharCode(...new Uint8Array(privKey))) + '\n-----END PRIVATE KEY-----'
    }
    ElMessage.success('密钥对已生成')
  } catch (e) {
    errorMsg.value = '生成失败: ' + e.message
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
.config { margin-top: 12px; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
.keys-output { margin-top: 16px; background: #1e1e3f; padding: 16px; border-radius: 8px; border: 1px solid #2a2a5a; }
.keys-output h4 { color: #409eff; margin-bottom: 8px; }
.keys-output h5 { color: #c0c0d0; font-size: 13px; margin: 8px 0 4px; }
.error { color: #f56c6c; margin-top: 8px; font-size: 13px; }
</style>