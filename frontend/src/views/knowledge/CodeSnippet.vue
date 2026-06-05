<template>
  <div class="tool-page">
    <div class="header">
      <h3>代码片段</h3>
      <el-button type="primary" @click="showAdd = true">新增片段</el-button>
    </div>

    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="搜索片段..." clearable style="width: 300px" />
      <el-select v-model="filterLang" placeholder="语言筛选" clearable style="width: 150px">
        <el-option v-for="l in allLangs" :key="l" :label="l" :value="l" />
      </el-select>
    </div>

    <div class="snippet-list">
      <el-empty v-if="filteredList.length === 0" description="暂无代码片段" />
      <el-card v-for="s in filteredList" :key="s.id" class="snippet-card" shadow="hover">
        <div class="snippet-header">
          <span class="snippet-title">{{ s.title }}</span>
          <el-tag size="small">{{ s.lang }}</el-tag>
        </div>
        <el-input v-model="s.code" type="textarea" :rows="4" readonly />
        <div class="snippet-footer">
          <span class="snippet-note">{{ s.note }}</span>
          <div class="snippet-actions">
            <el-button size="small" @click="copy(s.code)">复制</el-button>
            <el-button size="small" type="danger" @click="removeSnippet(s.id)">删除</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showAdd" title="新增代码片段" width="500px">
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="newSnippet.title" placeholder="片段名称" />
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="newSnippet.lang" filterable allow-create>
            <el-option v-for="l in langs" :key="l" :label="l" :value="l" />
          </el-select>
        </el-form-item>
        <el-form-item label="代码">
          <el-input v-model="newSnippet.code" type="textarea" :rows="8" placeholder="粘贴代码..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newSnippet.note" placeholder="使用说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="saveSnippet">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const langs = ['JavaScript', 'TypeScript', 'Java', 'Go', 'Python', 'SQL', 'Shell', 'HTML', 'CSS', 'YAML', 'Dockerfile', 'Nginx', 'Other']
const searchText = ref('')
const filterLang = ref('')
const showAdd = ref(false)

const newSnippet = ref({ title: '', lang: 'JavaScript', code: '', note: '' })

const snippets = ref(loadSnippets())

const allLangs = computed(() => [...new Set(snippets.value.map(s => s.lang))])

const filteredList = computed(() => {
  let list = snippets.value
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter(s => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.note.toLowerCase().includes(q))
  }
  if (filterLang.value) {
    list = list.filter(s => s.lang === filterLang.value)
  }
  return list
})

function loadSnippets() {
  try { return JSON.parse(localStorage.getItem('codeSnippets') || '[]') } catch { return [] }
}

function saveSnippets() {
  localStorage.setItem('codeSnippets', JSON.stringify(snippets.value))
}

function saveSnippet() {
  if (!newSnippet.value.title || !newSnippet.value.code) {
    ElMessage.warning('标题和代码不能为空')
    return
  }
  snippets.value.unshift({
    id: Date.now(),
    title: newSnippet.value.title,
    lang: newSnippet.value.lang,
    code: newSnippet.value.code,
    note: newSnippet.value.note
  })
  saveSnippets()
  newSnippet.value = { title: '', lang: 'JavaScript', code: '', note: '' }
  showAdd.value = false
  ElMessage.success('已保存')
}

async function removeSnippet(id) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  snippets.value = snippets.value.filter(s => s.id !== id)
  saveSnippets()
  ElMessage.success('已删除')
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  ElMessage.success('已复制')
}
</script>

<style scoped>
.tool-page { max-width: 900px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header h3 { color: #c0c0d0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.snippet-list { display: flex; flex-direction: column; gap: 12px; }
.snippet-card { background: #1e1e3f; border-color: #2a2a5a; }
.snippet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.snippet-title { color: #409eff; font-weight: bold; }
.snippet-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.snippet-note { color: #9090a0; font-size: 12px; }
.snippet-actions { display: flex; gap: 4px; }
</style>