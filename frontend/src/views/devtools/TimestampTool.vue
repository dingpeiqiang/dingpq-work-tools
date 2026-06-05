<template>
  <div class="tool-page">
    <h3>时间戳转换</h3>
    <div class="card-row">
      <el-card shadow="hover" class="info-card">
        <div class="card-label">当前时间戳（毫秒）</div>
        <div class="card-value">{{ now }}</div>
        <el-button size="small" @click="copy(now)">复制</el-button>
      </el-card>
      <el-card shadow="hover" class="info-card">
        <div class="card-label">当前时间戳（秒）</div>
        <div class="card-value">{{ nowSec }}</div>
        <el-button size="small" @click="copy(nowSec)">复制</el-button>
      </el-card>
      <el-card shadow="hover" class="info-card">
        <div class="card-label">当前北京时间</div>
        <div class="card-value">{{ nowStr }}</div>
        <el-button size="small" @click="copy(nowStr)">复制</el-button>
      </el-card>
      <el-card shadow="hover" class="info-card">
        <div class="card-label">当前 UTC 时间</div>
        <div class="card-value">{{ utcStr }}</div>
        <el-button size="small" @click="copy(utcStr)">复制</el-button>
      </el-card>
    </div>

    <el-divider />

    <div class="convert-section">
      <h4>时间戳 → 日期</h4>
      <el-input v-model="tsInput" placeholder="输入时间戳（毫秒）" style="width: 300px" @input="tsToDate" />
      <span class="result" v-if="tsDateResult">{{ tsDateResult }}</span>
    </div>

    <div class="convert-section">
      <h4>日期 → 时间戳</h4>
      <el-date-picker
        v-model="dateInput"
        type="datetime"
        placeholder="选择日期时间"
        format="YYYY-MM-DD HH:mm:ss"
        @change="dateToTs"
      />
      <span class="result" v-if="dateTsResult">{{ dateTsResult }} ms</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const now = computed(() => Date.now())
const nowSec = computed(() => Math.floor(Date.now() / 1000))
const nowStr = computed(() => new Date().toLocaleString('zh-CN', { hour12: false }))
const utcStr = computed(() => new Date().toISOString())

const tsInput = ref('')
const tsDateResult = ref('')
const dateInput = ref('')
const dateTsResult = ref('')

function tsToDate() {
  const ts = Number(tsInput.value)
  if (!ts) { tsDateResult.value = ''; return }
  const d = new Date(ts)
  tsDateResult.value = d.toLocaleString('zh-CN', { hour12: false })
}

function dateToTs() {
  if (!dateInput.value) { dateTsResult.value = ''; return }
  dateTsResult.value = new Date(dateInput.value).getTime()
}

async function copy(val) {
  await navigator.clipboard.writeText(String(val))
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 900px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.card-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.info-card { text-align: center; background: #1e1e3f; border-color: #2a2a5a; }
.card-label { color: #9090a0; font-size: 12px; margin-bottom: 6px; }
.card-value { color: #409eff; font-size: 16px; font-weight: bold; word-break: break-all; margin-bottom: 8px; }
.convert-section { margin-top: 16px; display: flex; align-items: center; gap: 12px; }
.convert-section h4 { color: #c0c0d0; font-size: 14px; min-width: 120px; }
.result { color: #67c23a; font-size: 14px; }
</style>