
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://task-manager-api-01cw.onrender.com/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadTasks() {
    try {
      setError('')
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Could not load tasks from the server.')
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError('Cannot connect to the backend. Make sure your server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const completed = tasks.filter(task => task.status === 'Done').length
  const pending = tasks.length - completed
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0

  async function addTask(event) {
    event.preventDefault()

    if (!title.trim()) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
          status: 'Pending',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not create task.')
      }

      setTasks(previous => [data, ...previous])
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
    } catch (err) {
      setError(err.message || 'Could not save task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(task) {
    const newStatus = task.status === 'Done' ? 'Pending' : 'Done'
    setError('')

    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update task.')
      }

      setTasks(previous =>
        previous.map(item => item._id === task._id ? data : item)
      )
    } catch (err) {
      setError(err.message || 'Could not update task.')
    }
  }

  async function deleteTask(id) {
    setError('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete task.')
      }

      setTasks(previous => previous.filter(task => task._id !== id))
    } catch (err) {
      setError(err.message || 'Could not delete task.')
    }
  }

  const visibleTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase().trim())
    return matchesFilter && matchesSearch
  })

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✓</span>
          TaskFlow
        </div>
        <span className="top-note">Your personal productivity space</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">MY WORKSPACE</p>
        <h1>Manage your tasks<span>.</span></h1>
        <p>Plan your day, stay focused, and get things done.</p>
      </section>

      {error && (
        <div role="alert" style={{ background: '#fff0ef', color: '#b42318', padding: 14, borderRadius: 10, marginBottom: 18 }}>
          {error}
          <button type="button" onClick={loadTasks} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      <section className="stats">
        <article className="stat-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </article>
        <article className="stat-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </article>
      </section>

      <section className="progress-card">
        <div className="progress-heading">
          <div>
            <h2>Your progress</h2>
            <p>Every completed task counts!</p>
          </div>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="workspace">
        <section className="panel form-panel">
          <h2>＋ Add a new task</h2>
          <form onSubmit={addTask}>
            <label htmlFor="task-title">Task title *</label>
            <input
              id="task-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="What needs to be done?"
              required
            />

            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Add some details..."
              rows="3"
            />

            <div className="form-row">
              <div>
                <label htmlFor="task-priority">Priority</label>
                <select id="task-priority" value={priority} onChange={event => setPriority(event.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-date">Due date</label>
                <input id="task-date" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
              </div>
            </div>

            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : '＋ Create task'}
            </button>
          </form>
        </section>

        <section className="panel tasks-panel">
          <div className="tasks-heading">
            <div>
              <h2>Your tasks</h2>
              <p>{loading ? 'Loading tasks...' : `${visibleTasks.length} tasks shown`}</p>
            </div>
            <input
              className="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
            />
          </div>

          <div className="filters">
            {['All', 'Pending', 'Done'].map(item => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'filter active' : 'filter'}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="task-list">
            {visibleTasks.map(task => (
              <article className={`task-item ${task.status === 'Done' ? 'task-done' : ''}`} key={task._id}>
                <button
                  type="button"
                  className="check-btn"
                  onClick={() => toggleTask(task)}
                  aria-label={`Toggle ${task.title}`}
                >
                  {task.status === 'Done' ? '✓' : ''}
                </button>

                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta">
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    {task.dueDate && <span>Due: {task.dueDate}</span>}
                    <span>{task.status}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteTask(task._id)}
                  aria-label={`Delete ${task.title}`}
                >
                  ×
                </button>
              </article>
            ))}

            {!loading && visibleTasks.length === 0 && (
              <p className="empty">
                {tasks.length === 0
                  ? 'No tasks yet. Create your first task!'
                  : 'No tasks match your search or filter.'}
              </p>
            )}
          </div>
        </section>
      </div>

      <footer>TaskFlow · Organize your work, one task at a time.</footer>
    </main>
  )
}

export default App
