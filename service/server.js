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
const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in the environment variables.');
}

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// --- ROTAS DE AUTENTICAÇÃO ---
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

// --- ROTAS DE AUTENTICAÇÃO COM GOOGLE (OAuth 2.0) ---

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

// Este middleware será usado para proteger as rotas da API
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


// --- ROTAS DA API DE TAREFAS ---

app.get('/api/entries', authenticateToken, async (req, res) => {
  const entries = await prisma.entry.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' }
  });
  res.json(entries);
});

app.post('/api/task', authenticateToken, async (req, res) => {
    const { date, type, text, time } = req.body;
    const userId = req.userId;

    let entry = await prisma.entry.findFirst({ where: { date, userId } });
    const task = { id: Date.now(), text, time };

    if (!entry) {
        const initialDid = type === 'did' ? [task] : [];
        const initialWill = type === 'will' ? [task] : [];
        entry = await prisma.entry.create({
            data: { date, userId, did: initialDid, will: initialWill }
        });
    } else {
        const tasks = entry[type] || [];
        tasks.push(task);
        await prisma.entry.update({
            where: { id: entry.id },
            data: { [type]: tasks }
        });
    }
    res.status(201).json(task);
});

app.put('/api/task', authenticateToken, async (req, res) => {
  const { date, type, id, text } = req.body;
  const userId = req.userId;

  const entry = await prisma.entry.findFirst({ where: { date, userId } });
  if (!entry) return res.status(404).json({ message: 'Registro não encontrado' });

  const arrKey = type === 'did' ? 'did' : 'will';
  const tasks = entry[arrKey] || [];
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return res.status(404).json({ message: 'Tarefa não encontrada' });

  tasks[taskIndex].text = text;

  await prisma.entry.update({
    where: { id: entry.id },
    data: { [arrKey]: tasks }
  });

  res.json(tasks[taskIndex]);
});

app.delete('/api/task', authenticateToken, async (req, res) => {
  const { date, type, id } = req.body;
  const userId = req.userId;

  const entry = await prisma.entry.findFirst({ where: { date, userId } });
  if (!entry) return res.status(404).json({ message: 'Registro não encontrado' });

  const arrKey = type === 'did' ? 'did' : 'will';
  let tasks = entry[arrKey] || [];

  const updatedTasks = tasks.filter(t => t.id !== id);

  await prisma.entry.update({
    where: { id: entry.id },
    data: { [arrKey]: updatedTasks }
  });

  res.sendStatus(204);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de API rodando na porta ${PORT}`));