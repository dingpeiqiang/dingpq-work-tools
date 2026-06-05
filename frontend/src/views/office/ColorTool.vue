<template>
  <div class="tool-page">
    <h3>颜色工具</h3>
    <el-row :gutter="24">
      <el-col :span="10">
        <el-color-picker v-model="color" show-alpha />
        <div class="color-values">
          <div class="color-item">
            <span class="label">HEX</span>
            <el-input v-model="hexVal" readonly size="small">
              <template #append><el-button @click="copy(hexVal)" :icon="CopyDocument" /></template>
            </el-input>
          </div>
          <div class="color-item">
            <span class="label">RGB</span>
            <el-input v-model="rgbVal" readonly size="small">
              <template #append><el-button @click="copy(rgbVal)" :icon="CopyDocument" /></template>
            </el-input>
          </div>
          <div class="color-item">
            <span class="label">HSL</span>
            <el-input v-model="hslVal" readonly size="small">
              <template #append><el-button @click="copy(hslVal)" :icon="CopyDocument" /></template>
            </el-input>
          </div>
        </div>
      </el-col>
      <el-col :span="14">
        <h4>手动输入</h4>
        <el-input v-model="inputColor" placeholder="输入 HEX(#fff) / RGB(255,255,255) / HSL(0,0%,100%)" @input="parseColor" />
        <div class="preview" :style="{ background: parsedColor || '#1a1a2e' }" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const color = ref('#409EFF')
const inputColor = ref('')
const parsedColor = ref('')

const hexVal = computed(() => color.value || '')
const rgbVal = computed(() => hexToRgb(color.value))
const hslVal = computed(() => hexToHsl(color.value))

function hexToRgb(hex) {
  if (!hex) return ''
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return ''
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex) {
  if (!hex) return ''
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return ''
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function parseColor() {
  const val = inputColor.value.trim()
  if (val.startsWith('#')) {
    parsedColor.value = val
    color.value = val
  } else if (val.startsWith('rgb')) {
    parsedColor.value = val
  } else if (val.startsWith('hsl')) {
    parsedColor.value = val
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
.tool-page h4 { color: #c0c0d0; margin-bottom: 10px; }
.color-values { margin-top: 16px; }
.color-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.color-item .label { color: #9090a0; font-size: 12px; min-width: 30px; }
.preview { height: 80px; border-radius: 8px; margin-top: 12px; border: 1px solid #2a2a5a; }
</style>