<template>
  <div class="tool-page">
    <h3>正则测试</h3>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-input v-model="regex" placeholder="输入正则表达式，如: \d{3}-\d{4}" />
        <el-input v-model="flags" placeholder="标志位，如: g i m" style="margin-top: 8px; width: 200px" />
        <el-input v-model="testText" type="textarea" :rows="10" placeholder="输入测试文本..." style="margin-top: 8px" />
      </el-col>
      <el-col :span="12">
        <div class="match-result">
          <div v-if="matches.length" class="match-list">
            <div v-for="(m, i) in matches" :key="i" class="match-item">
              <span class="match-index">#{{ i + 1 }}</span>
              <el-tag>{{ m[0] }}</el-tag>
              <span v-if="m.length > 1" class="match-groups">
                <el-tag v-for="(g, j) in m.slice(1)" :key="j" type="info" size="small">Group {{ j }}: {{ g }}</el-tag>
              </span>
            </div>
          </div>
          <div v-else-if="testText" class="no-match">无匹配</div>
        </div>
      </el-col>
    </el-row>

    <div class="section">
      <h4>常用正则模板</h4>
      <div class="template-grid">
        <el-tag
          v-for="t in templates"
          :key="t.name"
          class="template-tag"
          @click="useTemplate(t)"
        >{{ t.name }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const regex = ref('')
const flags = ref('g')
const testText = ref('')
const matches = ref([])

const templates = [
  { name: '手机号', regex: '1[3-9]\\d{9}', flags: 'g' },
  { name: '邮箱', regex: '[\\w.-]+@[\\w.-]+\\.\\w+', flags: 'g' },
  { name: 'IP地址', regex: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', flags: 'g' },
  { name: '身份证', regex: '\\d{17}[\\dXx]', flags: 'g' },
  { name: 'URL', regex: 'https?://[\\w./-]+', flags: 'g' },
  { name: '中文', regex: '[\\u4e00-\\u9fa5]+', flags: 'g' },
  { name: '数字', regex: '\\d+', flags: 'g' },
  { name: '日期 YYYY-MM-DD', regex: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' }
]

function useTemplate(t) {
  regex.value = t.regex
  flags.value = t.flags
}

function runMatch() {
  matches.value = []
  if (!regex.value || !testText.value) return
  try {
    const re = new RegExp(regex.value, flags.value)
    const result = [...testText.value.matchAll(re)]
    matches.value = result
  } catch { /* ignore invalid regex */ }
}

watch([regex, flags, testText], runMatch)
</script>

<style scoped>
.tool-page { max-width: 1000px; margin: 0 auto; }
.tool-page h3 { color: #c0c0d0; margin-bottom: 16px; }
.match-result { padding: 8px; background: #1e1e3f; border-radius: 4px; min-height: 200px; }
.match-item { margin-bottom: 8px; }
.match-index { color: #9090a0; margin-right: 8px; font-size: 12px; }
.match-groups { margin-left: 8px; display: inline-flex; gap: 4px; flex-wrap: wrap; }
.no-match { color: #707080; text-align: center; padding-top: 40px; }
.section { margin-top: 20px; }
.section h4 { color: #c0c0d0; margin-bottom: 10px; }
.template-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.template-tag { cursor: pointer; }
.template-tag:hover { background: #409eff; color: #fff; }
</style>