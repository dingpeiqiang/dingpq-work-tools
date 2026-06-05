import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node.js backend!' })
})

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})