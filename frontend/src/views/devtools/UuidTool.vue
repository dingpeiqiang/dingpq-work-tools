<template>
  <div class="tool-page">
    <h3>唯一ID生成</h3>

    <el-card class="section-card">
      <h4>UUID</h4>
      <el-input v-model="uuidVal" readonly>
        <template #append>
          <el-button @click="genUuid">生成</el-button>
          <el-button @click="copy(uuidVal)">复制</el-button>
        </template>
      </el-input>
      <div class="batch-section">
        <el-input-number v-model="uuidCount" :min="1" :max="100" size="small" />
        <el-button size="small" @click="genBatchUuid">批量生成</el-button>
      </div>
      <el-input v-if="batchUuidList.length" v-model="batchUuidStr" type="textarea" :rows="6" readonly />
    </el-card>

    <el-card class="section-card">
      <h4>雪花ID (Snowflake)</h4>
      <el-input v-model="snowflakeVal" readonly>
        <template #append>
          <el-button @click="genSnowflake">生成</el-button>
          <el-button @click="copy(snowflakeVal)">复制</el-button>
        </template>
      </el-input>
    </el-card>

    <el-card class="section-card">
      <h4>随机字符串</h4>
      <el-row :gutter="12" style="margin-bottom: 8px">
        <el-col :span="6">
          <el-input-number v-model="randLen" :min="4" :max="64" size="small" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="randType" size="small">
            <el-option label="字母+数字" value="mixed" />
            <el-option label="纯字母" value="alpha" />
            <el-option label="纯数字" value="num" />
            <el-option label="字母+数字+符号" value="all" />
          </el-select>
        </el-col>
      </el-row>
      <el-input v-model="randomStr" readonly>
        <template #append>
          <el-button @click="genRandom">生成</el-button>
          <el-button @click="copy(randomStr)">复制</el-button>
        </template>
      </el-input>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const uuidVal = ref(crypto.randomUUID())
const uuidCount = ref(5)
const batchUuidList = ref([])
const batchUuidStr = ref('')

const snowflakeVal = ref('')
const randLen = ref(16)
const randType = ref('mixed')
const randomStr = ref('')

function genUuid() { uuidVal.value = crypto.randomUUID() }
function genBatchUuid() {
  const list = []
  for (let i = 0; i < uuidCount.value; i++) list.push(crypto.randomUUID())
  batchUuidList.value = list
  batchUuidStr.value = list.join('\n')
}

function genSnowflake() {
  const ts = BigInt(Date.now())
  const workerId = BigInt(Math.floor(Math.random() * 32))
  const sequence = BigInt(Math.floor(Math.random() * 4096))
  snowflakeVal.value = String((ts << 22n) | (workerId << 17n) | sequence)
}

function genRandom() {
  const sets = {
    mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    num: '0123456789',
    all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  }
  const chars = sets[randType.value]
  let result = ''
  for (let i = 0; i < randLen.value; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  randomStr.value = result
}

async function copy(val) {
  if (!val) return
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 800px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.section-card { background: #1e1e3f; border-color: #2a2a5a; margin-bottom: 16px; }
.section-card h4 { color: #c0c0d0; margin-bottom: 10px; }
.batch-section { margin-top: 8px; display: flex; align-items: center; gap: 8px; }
</style>