import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import session from 'express-session';
import passport from 'passport';
import './passport-setup.js';

const app = express();
app.set('trust proxy', 1);

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in the environment variables.');
}

app.use(express.json());

app.use(cors({
  origin: ['https://daily-scrum-tracker.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json({ message: "Usuário criado com sucesso!", userId: user.id });
  } catch (error) {
    res.status(400).json({ message: "Email já existe." });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

app.get('/auth/google', passport.authenticate('google'));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google-auth-failed`,
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/success?token=${token}`);
  }
);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    next();
  });
};

app.get('/api/tasks', authenticateToken, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, status, projectId, taskTypeId } = req.body;
  const userId = req.userId;

  if (!title || !status) {
    return res.status(400).json({ message: 'Título e status são obrigatórios.' });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        userId,
        projectId,
        taskTypeId,
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, status, projectId, taskTypeId } = req.body;
  const userId = req.userId;

  if (!title || !status) {
    return res.status(400).json({ message: 'Título e status são obrigatórios.' });
  }

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: parseInt(id),
        userId: userId 
      },
      data: { title, description, status, updatedAt: new Date(), projectId, taskTypeId }
    });
    res.json(updatedTask);
  } catch (error) {
    console.error(`Erro ao atualizar tarefa ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário.' });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar tarefa.' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await prisma.task.delete({
      where: {
        id: parseInt(id),
        userId: userId,
      }
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar tarefa ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário.' });
    }
    res.status(500).json({ message: 'Erro interno ao deletar tarefa.' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.userId },
    include: { taskTypes: true }, 
    orderBy: { name: 'asc' }
  });
  res.json(projects);
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id), userId: req.userId },
      data: { name, color }
    });
    res.json(updatedProject);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    res.status(500).json({ message: 'Erro ao atualizar projeto.' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id: parseInt(id), userId: req.userId }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({ message: 'Não é possível excluir. O projeto atrelado a tarefas ou tipos de tarefa.' });
    }
    res.status(500).json({ message: 'Erro ao deletar projeto.' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ message: 'O nome do projeto é obrigatório.' });

  const newProject = await prisma.project.create({
    data: { name, color, userId: req.userId }
  });
  res.status(201).json(newProject);
});

app.post('/api/task-types', authenticateToken, async (req, res) => {
  const { name, projectId } = req.body;
  if (!name || !projectId) {
    return res.status(400).json({ message: 'Nome e ID do projeto são obrigatórios.' });
  }

  const newType = await prisma.taskType.create({
    data: { name, projectId }
  });
  res.status(201).json(newType);
});

// Healthcheck
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de API rodando na porta ${PORT}`));