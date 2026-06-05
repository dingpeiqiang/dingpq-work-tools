<template>
  <div class="tool-page">
    <div class="header">
      <h3>技术笔记</h3>
      <el-button type="primary" @click="showAdd = true">新建笔记</el-button>
    </div>

    <div class="filter-bar">
      <el-input v-model="searchText" placeholder="搜索笔记..." clearable style="width: 300px" />
    </div>

    <div class="notes-list">
      <el-empty v-if="filteredList.length === 0" description="暂无笔记" />
      <el-card v-for="n in filteredList" :key="n.id" class="note-card" shadow="hover">
        <div class="note-header">
          <span class="note-title" @click="editNote(n)">{{ n.title }}</span>
          <span class="note-date">{{ formatDate(n.updatedAt) }}</span>
        </div>
        <div class="note-preview">{{ n.content.substring(0, 100) }}{{ n.content.length > 100 ? '...' : '' }}</div>
        <div class="note-footer">
          <el-tag v-for="t in n.tags" :key="t" size="small">{{ t }}</el-tag>
          <el-button size="small" type="danger" @click="removeNote(n.id)">删除</el-button>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showAdd" :title="editingNote ? '编辑笔记' : '新建笔记'" width="700px" @closed="resetForm">
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="笔记标题" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create placeholder="输入标签" />
        </el-form-item>
        <el-form-item label="内容 (Markdown)">
          <el-input v-model="form.content" type="textarea" :rows="12" placeholder="支持 Markdown 格式..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchText = ref('')
const showAdd = ref(false)
const editingNote = ref(null)

const form = ref({ title: '', tags: [], content: '' })

const notes = ref(loadNotes())

const filteredList = computed(() => {
  if (!searchText.value) return notes.value
  const q = searchText.value.toLowerCase()
  return notes.value.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  )
})

function loadNotes() {
  try { return JSON.parse(localStorage.getItem('techNotes') || '[]') } catch { return [] }
}

function saveNotes() {
  localStorage.setItem('techNotes', JSON.stringify(notes.value))
}

function saveNote() {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  if (editingNote.value) {
    const idx = notes.value.findIndex(n => n.id === editingNote.value.id)
    if (idx > -1) {
      notes.value[idx] = { ...editingNote.value, ...form.value, updatedAt: Date.now() }
    }
  } else {
    notes.value.unshift({
      id: Date.now(),
      ...form.value,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }
  saveNotes()
  showAdd.value = false
  ElMessage.success('已保存')
}

function editNote(note) {
  editingNote.value = note
  form.value = { title: note.title, tags: [...note.tags], content: note.content }
  showAdd.value = true
}

function resetForm() {
  editingNote.value = null
  form.value = { title: '', tags: [], content: '' }
}

async function removeNote(id) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
  ElMessage.success('已删除')
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.tool-page { max-width: 900px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header h3 { color: #c0c0d0; }
.filter-bar { margin-bottom: 16px; }
.notes-list { display: flex; flex-direction: column; gap: 12px; }
.note-card { background: #1e1e3f; border-color: #2a2a5a; }
.note-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.note-title { color: #409eff; font-weight: bold; cursor: pointer; }
.note-title:hover { text-decoration: underline; }
.note-date { color: #707080; font-size: 12px; }
.note-preview { color: #c0c0d0; font-size: 13px; margin-bottom: 8px; }
.note-footer { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>