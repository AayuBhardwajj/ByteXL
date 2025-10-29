const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/studentDB')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Connection Error:', err));

// ✅ Student Schema and Model
const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  course: String
});
const Student = mongoose.model('Student', studentSchema);

// ✅ CRUD Operations (Controller Logic)
app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.send(students);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send({ message: 'Student Not Found' });
    res.send(student);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).send({ message: 'Student Not Found' });
    res.send(student);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).send({ message: 'Student Not Found' });
    res.send({ message: 'Student Deleted Successfully' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ✅ Start Server
app.listen(3000, () => console.log('🚀 Server running on port 3000'));
