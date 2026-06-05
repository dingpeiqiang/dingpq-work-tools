<template>
  <div class="tool-page">
    <h3>编码转换</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="URL 编码" name="url">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input v-model="urlInput" type="textarea" :rows="8" placeholder="输入文本..." />
          </el-col>
          <el-col :span="12">
            <el-input v-model="urlOutput" type="textarea" :rows="8" readonly placeholder="结果..." />
          </el-col>
        </el-row>
        <div class="toolbar">
          <el-button type="primary" @click="urlOutput = encodeURIComponent(urlInput)">URL 编码</el-button>
          <el-button @click="urlOutput = decodeURIComponent(urlInput)">URL 解码</el-button>
          <el-button @click="copy(urlOutput)" :disabled="!urlOutput">复制</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Base64" name="base64">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input v-model="b64Input" type="textarea" :rows="8" placeholder="输入文本..." />
          </el-col>
          <el-col :span="12">
            <el-input v-model="b64Output" type="textarea" :rows="8" readonly placeholder="结果..." />
          </el-col>
        </el-row>
        <div class="toolbar">
          <el-button type="primary" @click="b64Output = btoa(unescape(encodeURIComponent(b64Input)))">Base64 编码</el-button>
          <el-button @click="b64Output = decodeURIComponent(escape(atob(b64Input)))">Base64 解码</el-button>
          <el-button @click="copy(b64Output)" :disabled="!b64Output">复制</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Unicode" name="unicode">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input v-model="uniInput" type="textarea" :rows="8" placeholder="输入文本..." />
          </el-col>
          <el-col :span="12">
            <el-input v-model="uniOutput" type="textarea" :rows="8" readonly placeholder="结果..." />
          </el-col>
        </el-row>
        <div class="toolbar">
          <el-button type="primary" @click="encodeUnicode">Unicode 编码</el-button>
          <el-button @click="decodeUnicode">Unicode 解码</el-button>
          <el-button @click="copy(uniOutput)" :disabled="!uniOutput">复制</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('url')
const urlInput = ref('')
const urlOutput = ref('')
const b64Input = ref('')
const b64Output = ref('')
const uniInput = ref('')
const uniOutput = ref('')

function encodeUnicode() {
  uniOutput.value = uniInput.value.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('')
}

function decodeUnicode() {
  uniOutput.value = uniInput.value.replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 900px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.toolbar { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
</style>