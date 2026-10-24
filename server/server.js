
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5001

// Task database schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    dueDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Done'],
      default: 'Pending',
    },
  },
  { timestamps: true }
)

const Task = mongoose.model('Task', taskSchema)

// Test route
app.get('/', (req, res) => {
  res.send('Task Manager API is running!')
})

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' })
  }
})

// Create a task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      dueDate,
      status,
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(task)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Connect to MongoDB and start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Task Manager API running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
  }
}

startServer()
