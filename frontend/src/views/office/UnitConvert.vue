<template>
  <div class="tool-page">
    <h3>单位换算</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="字节换算" name="byte">
        <div class="convert-row">
          <el-input v-model.number="byteVal" type="number" placeholder="输入数值" style="width: 200px" @input="convertByte" />
          <el-select v-model="byteUnit" style="width: 100px" @change="convertByte">
            <el-option label="B" value="B" />
            <el-option label="KB" value="KB" />
            <el-option label="MB" value="MB" />
            <el-option label="GB" value="GB" />
            <el-option label="TB" value="TB" />
          </el-select>
        </div>
        <div class="result-grid">
          <div v-for="u in byteUnits" :key="u.label" class="result-item">
            <span class="unit-label">{{ u.label }}</span>
            <span class="unit-value">{{ formatNum(byteResults[u.value]) }}</span>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="时间单位" name="time">
        <div class="convert-row">
          <el-input v-model.number="timeVal" type="number" placeholder="输入数值" style="width: 200px" @input="convertTime" />
          <el-select v-model="timeUnit" style="width: 100px" @change="convertTime">
            <el-option label="毫秒" value="ms" />
            <el-option label="秒" value="s" />
            <el-option label="分钟" value="min" />
            <el-option label="小时" value="h" />
            <el-option label="天" value="d" />
          </el-select>
        </div>
        <div class="result-grid">
          <div v-for="u in timeUnits" :key="u.label" class="result-item">
            <span class="unit-label">{{ u.label }}</span>
            <span class="unit-value">{{ timeResults[u.value] }}</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('byte')

const byteVal = ref(1)
const byteUnit = ref('MB')
const byteResults = reactive({})

const byteUnits = [
  { label: 'B', value: 'B' },
  { label: 'KB', value: 'KB' },
  { label: 'MB', value: 'MB' },
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' }
]

const byteMap = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 }

function convertByte() {
  const bytes = byteVal.value * (byteMap[byteUnit.value] || 1)
  for (const u of byteUnits) {
    byteResults[u.value] = bytes / byteMap[u.value]
  }
}

function formatNum(n) {
  if (n === undefined || n === null) return '-'
  if (Number.isInteger(n)) return n.toLocaleString()
  return Number(n.toFixed(4)).toLocaleString()
}

const timeVal = ref(1)
const timeUnit = ref('min')
const timeResults = reactive({})

const timeUnits = [
  { label: '毫秒', value: 'ms' },
  { label: '秒', value: 's' },
  { label: '分钟', value: 'min' },
  { label: '小时', value: 'h' },
  { label: '天', value: 'd' }
]

const timeMap = { ms: 1, s: 1000, min: 60000, h: 3600000, d: 86400000 }

function convertTime() {
  const ms = timeVal.value * (timeMap[timeUnit.value] || 1)
  for (const u of timeUnits) {
    timeResults[u.value] = ms / timeMap[u.value]
  }
}

convertByte()
convertTime()
</script>

<style scoped>
.tool-page { max-width: 700px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.convert-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.result-item { background: #1e1e3f; padding: 12px; border-radius: 8px; border: 1px solid #2a2a5a; text-align: center; }
.unit-label { display: block; color: #9090a0; font-size: 12px; margin-bottom: 4px; }
.unit-value { color: #409eff; font-size: 18px; font-weight: bold; word-break: break-all; }
</style>