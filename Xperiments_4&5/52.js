/**
 * studentApp.js
 * Single-file Student Management System (MVC-style)
 *
 * Usage:
 * 1. npm init -y
 * 2. npm install express mongoose
 * 3. node studentApp.js
 *
 * Endpoints:
 * POST   /students        -> create student
 * GET    /students        -> list all students
 * GET    /students/:id    -> get single student
 * PUT    /students/:id    -> update student
 * DELETE /students/:id    -> delete student
 */

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studentDB';
const PORT = process.env.PORT || 3000;

// ---------- CONNECT ----------
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ---------- MODEL ----------
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  course: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// ---------- CONTROLLER-LIKE HELPERS ----------
async function createStudent(data) {
  const s = new Student(data);
  return await s.save();
}

async function getAllStudents() {
  return await Student.find().sort({ createdAt: -1 });
}

async function getStudentById(id) {
  return await Student.findById(id);
}

async function updateStudent(id, data) {
  return await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteStudent(id) {
  return await Student.findByIdAndDelete(id);
}

// ---------- ROUTES ----------
app.post('/students', async (req, res) => {
  try {
    const student = await createStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/students/:id', async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const student = await updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const student = await deleteStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// health
app.get('/', (req, res) => res.json({ ok: true, service: 'Student Management' }));

// ---------- START ----------
app.listen(PORT, () => console.log(`🚀 Student app listening on http://localhost:${PORT}`));
