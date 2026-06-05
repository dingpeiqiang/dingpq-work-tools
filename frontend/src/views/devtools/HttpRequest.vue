<template>
  <div class="tool-page">
    <h3>HTTP 请求工具</h3>
    <div class="request-form">
      <el-row :gutter="8" style="margin-bottom:12px">
        <el-col :span="3">
          <el-select v-model="method">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-input v-model="url" placeholder="输入 URL" />
        </el-col>
        <el-col :span="5">
          <el-button type="primary" :loading="loading" @click="send">发送请求</el-button>
        </el-col>
      </el-row>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="Headers" name="headers">
          <el-input v-model="headersStr" type="textarea" :rows="4" placeholder="Content-Type: application/json" />
        </el-tab-pane>
        <el-tab-pane label="Body" name="body" v-if="method !== 'GET'">
          <el-input v-model="body" type="textarea" :rows="6" placeholder='{"key": "value"}' />
        </el-tab-pane>
        <el-tab-pane label="Query" name="query">
          <el-input v-model="queryStr" type="textarea" :rows="3" placeholder="key1=value1&key2=value2" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="response-section" v-if="response">
      <div class="response-header">
        <span class="status" :class="{ ok: statusOk }">Status: {{ statusCode }}</span>
        <el-button size="small" @click="copy(response)">复制结果</el-button>
      </div>
      <el-input v-model="response" type="textarea" :rows="12" readonly />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const method = ref('GET')
const url = ref('')
const headersStr = ref('')
const body = ref('')
const queryStr = ref('')
const activeTab = ref('headers')
const loading = ref(false)
const response = ref('')
const statusCode = ref(0)

const statusOk = computed(() => statusCode.value >= 200 && statusCode.value < 300)

function parseHeaders(raw) {
  const headers = {}
  if (!raw.trim()) return headers
  raw.split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx > 0) headers[line.substring(0, idx).trim()] = line.substring(idx + 1).trim()
  })
  return headers
}

async function send() {
  if (!url.value.trim()) { ElMessage.warning('请输入 URL'); return }
  loading.value = true
  response.value = ''
  try {
    let fullUrl = url.value
    if (queryStr.value.trim()) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryStr.value.trim()
    }
    const options = {
      method: method.value,
      headers: parseHeaders(headersStr.value)
    }
    if (method.value !== 'GET' && body.value.trim()) {
      options.body = body.value
    }
    const res = await fetch(fullUrl, options)
    statusCode.value = res.status
    const text = await res.text()
    try {
      response.value = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      response.value = text
    }
  } catch (e) {
    response.value = '请求失败: ' + e.message
    statusCode.value = 0
  }
  loading.value = false
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 900px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.request-form { background: #1e1e3f; padding: 16px; border-radius: 8px; border: 1px solid #2a2a5a; }
.response-section { margin-top: 16px; background: #1e1e3f; padding: 16px; border-radius: 8px; border: 1px solid #2a2a5a; }
.response-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.status { font-weight: bold; color: #f56c6c; }
.status.ok { color: #67c23a; }
</style>