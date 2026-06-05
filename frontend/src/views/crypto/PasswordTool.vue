<template>
  <div class="tool-page">
    <h3>密码工具</h3>
    <el-card class="section-card">
      <h4>随机密码生成</h4>
      <div class="pwd-config">
        <div class="config-item">
          <span>长度</span>
          <el-input-number v-model="pwdLen" :min="4" :max="64" size="small" />
        </div>
        <div class="config-item">
          <el-checkbox v-model="hasUpper" @change="genPassword">大写字母</el-checkbox>
        </div>
        <div class="config-item">
          <el-checkbox v-model="hasLower" @change="genPassword">小写字母</el-checkbox>
        </div>
        <div class="config-item">
          <el-checkbox v-model="hasNum" @change="genPassword">数字</el-checkbox>
        </div>
        <div class="config-item">
          <el-checkbox v-model="hasSymbol" @change="genPassword">特殊符号</el-checkbox>
        </div>
      </div>
      <el-input v-model="password" readonly style="margin-top: 12px">
        <template #append>
          <el-button @click="genPassword">生成</el-button>
          <el-button @click="copy(password)">复制</el-button>
        </template>
      </el-input>
    </el-card>

    <el-card class="section-card">
      <h4>密码强度检测</h4>
      <el-input v-model="checkPwd" placeholder="输入密码检测强度" @input="checkStrength" />
      <div class="strength-bar" v-if="checkPwd">
        <div class="strength-fill" :style="{ width: strengthPercent + '%', background: strengthColor }"></div>
      </div>
      <div class="strength-text" v-if="checkPwd" :style="{ color: strengthColor }">
        {{ strengthLabel }}
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const pwdLen = ref(16)
const hasUpper = ref(true)
const hasLower = ref(true)
const hasNum = ref(true)
const hasSymbol = ref(true)
const password = ref('')
const checkPwd = ref('')

const strengthPercent = ref(0)
const strengthColor = ref('#909090')
const strengthLabel = ref('')

const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
const numChars = '0123456789'
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function genPassword() {
  let chars = ''
  if (hasUpper.value) chars += upperChars
  if (hasLower.value) chars += lowerChars
  if (hasNum.value) chars += numChars
  if (hasSymbol.value) chars += symbolChars
  if (!chars) { password.value = ''; return }
  let pwd = ''
  for (let i = 0; i < pwdLen.value; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  password.value = pwd
}

function checkStrength() {
  const pwd = checkPwd.value
  let score = 0
  if (pwd.length >= 8) score += 20
  if (pwd.length >= 12) score += 10
  if (/[A-Z]/.test(pwd)) score += 20
  if (/[a-z]/.test(pwd)) score += 15
  if (/[0-9]/.test(pwd)) score += 15
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20
  strengthPercent.value = Math.min(score, 100)
  if (score < 40) { strengthColor.value = '#f56c6c'; strengthLabel.value = '弱' }
  else if (score < 70) { strengthColor.value = '#e6a23c'; strengthLabel.value = '中' }
  else { strengthColor.value = '#67c23a'; strengthLabel.value = '强' }
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}

genPassword()
</script>

<style scoped>
.tool-page { max-width: 700px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.section-card { background: #1e1e3f; border-color: #2a2a5a; margin-bottom: 16px; }
.section-card h4 { color: #c0c0d0; margin-bottom: 10px; }
.pwd-config { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.config-item { display: flex; align-items: center; gap: 6px; color: #c0c0d0; font-size: 13px; }
.strength-bar { height: 6px; background: #2a2a5a; border-radius: 3px; margin-top: 8px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.strength-text { margin-top: 4px; font-size: 13px; font-weight: bold; }
</style>