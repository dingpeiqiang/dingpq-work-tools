<template>
  <div class="tool-page">
    <h3>文本处理</h3>
    <el-input v-model="input" type="textarea" :rows="10" placeholder="输入文本..." />
    <div class="toolbar">
      <el-button @click="operation('trim')">去首尾空格</el-button>
      <el-button @click="operation('trimAll')">去所有空格</el-button>
      <el-button @click="operation('removeBlankLines')">去空行</el-button>
      <el-button @click="operation('removeDupLines')">去重行</el-button>
      <el-button @click="operation('sortLines')">排序行</el-button>
      <el-button @click="operation('shuffleLines')">随机打乱</el-button>
      <el-button @click="operation('upper')">转大写</el-button>
      <el-button @click="operation('lower')">转小写</el-button>
      <el-button @click="operation('addPrefix')">添加前缀</el-button>
      <el-button @click="operation('addSuffix')">添加后缀</el-button>
      <el-button @click="operation('replace')">批量替换</el-button>
    </div>
    <div class="extras" v-if="showPrefix">
      <el-input v-model="extVal" placeholder="前缀/后缀内容" size="small" style="width: 200px" />
      <el-button size="small" type="primary" @click="applyExtra">应用</el-button>
    </div>
    <div class="extras" v-if="showReplace">
      <el-input v-model="extVal" placeholder="查找内容" size="small" style="width: 200px" />
      <el-input v-model="extVal2" placeholder="替换为" size="small" style="width: 200px" />
      <el-button size="small" type="primary" @click="applyExtra">替换</el-button>
    </div>
    <el-input v-if="output" v-model="output" type="textarea" :rows="10" readonly style="margin-top: 12px" />
    <div class="stats" v-if="output">
      <span>字符数: {{ output.length }}</span>
      <span>行数: {{ output.split('\n').length }}</span>
      <el-button size="small" style="margin-top: 8px" @click="copy(output)">复制结果</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
const extVal = ref('')
const extVal2 = ref('')
const showPrefix = ref(false)
const showReplace = ref(false)
let pendingOp = ''

function operation(op) {
  showPrefix.value = false
  showReplace.value = false
  if (op === 'addPrefix' || op === 'addSuffix') {
    showPrefix.value = true
    pendingOp = op
    return
  }
  if (op === 'replace') {
    showReplace.value = true
    pendingOp = op
    return
  }
  applyOp(op)
}

function applyExtra() {
  if (pendingOp === 'addPrefix') {
    const lines = input.value.split('\n')
    output.value = lines.map(l => extVal.value + l).join('\n')
  } else if (pendingOp === 'addSuffix') {
    const lines = input.value.split('\n')
    output.value = lines.map(l => l + extVal.value).join('\n')
  } else if (pendingOp === 'replace') {
    try {
      output.value = input.value.split(extVal.value).join(extVal2.value)
    } catch { output.value = input.value }
  }
  showPrefix.value = false
  showReplace.value = false
  pendingOp = ''
}

function applyOp(op) {
  const t = input.value
  switch (op) {
    case 'trim': output.value = t.split('\n').map(l => l.trim()).join('\n'); break
    case 'trimAll': output.value = t.replace(/\s/g, ''); break
    case 'removeBlankLines': output.value = t.split('\n').filter(l => l.trim()).join('\n'); break
    case 'removeDupLines': output.value = [...new Set(t.split('\n'))].join('\n'); break
    case 'sortLines': output.value = t.split('\n').sort().join('\n'); break
    case 'shuffleLines': output.value = t.split('\n').sort(() => Math.random() - 0.5).join('\n'); break
    case 'upper': output.value = t.toUpperCase(); break
    case 'lower': output.value = t.toLowerCase(); break
  }
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
.extras { margin-top: 8px; display: flex; gap: 8px; align-items: center; }
.stats { margin-top: 12px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; color: #9090a0; font-size: 13px; }
</style>