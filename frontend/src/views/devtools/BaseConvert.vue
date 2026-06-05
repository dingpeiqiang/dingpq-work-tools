<template>
  <div class="tool-page">
    <h3>进制转换</h3>
    <div class="convert-grid">
      <div v-for="base in bases" :key="base.name" class="base-card">
        <div class="base-label">{{ base.name }} ({{ base.radix }}进制)</div>
        <el-input
          v-model="values[base.key]"
          :placeholder="base.placeholder"
          @input="convert(base.key)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const bases = [
  { name: '二进制', key: 'bin', radix: 2, placeholder: '1010' },
  { name: '八进制', key: 'oct', radix: 8, placeholder: '12' },
  { name: '十进制', key: 'dec', radix: 10, placeholder: '10' },
  { name: '十六进制', key: 'hex', radix: 16, placeholder: 'A' }
]

const values = reactive({ bin: '', oct: '', dec: '', hex: '' })

let converting = false

function convert(fromKey) {
  if (converting) return
  converting = true
  const from = bases.find(b => b.key === fromKey)
  const val = values[fromKey]
  if (!val.trim()) {
    for (const b of bases) values[b.key] = ''
    converting = false
    return
  }
  try {
    const num = parseInt(val, from.radix)
    if (isNaN(num)) { converting = false; return }
    for (const b of bases) {
      if (b.key !== fromKey) {
        values[b.key] = num.toString(b.radix).toUpperCase()
      }
    }
  } catch { /* ignore */ }
  converting = false
}
</script>

<style scoped>
.tool-page { max-width: 700px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.convert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.base-card { background: #1e1e3f; padding: 16px; border-radius: 8px; border: 1px solid #2a2a5a; }
.base-label { color: #409eff; font-size: 14px; margin-bottom: 8px; font-weight: bold; }
</style>