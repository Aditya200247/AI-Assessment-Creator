import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { Assignment } from '../models/Assignment';
import { QuestionPaper } from '../models/QuestionPaper';
import { addGenerationJob } from '../queue/queue';
import { getRedis } from '../config/redis';
import { QuestionType } from '../types';

const router = Router();

const CACHE_KEY = 'assignments:list';
const CACHE_TTL = 60; // seconds

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

async function extractFileContent(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8').slice(0, 5000);
  }
  if (file.mimetype === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      return data.text.slice(0, 5000);
    } catch (err) {
      console.error('PDF parsing failed, skipping file content:', err);
      return '';
    }
  }
  return '';
}

// POST /api/assignments — Create assignment and queue generation
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      dueDate,
      questionTypes,
      numQuestions,
      marksPerQuestion,
      difficulty,
      instructions,
    } = req.body;

    const parsedQuestionTypes: QuestionType[] =
      typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;
    const parsedDifficulty =
      typeof difficulty === 'string' ? JSON.parse(difficulty) : difficulty;

    if (!title || !dueDate || !parsedQuestionTypes?.length || !numQuestions || !marksPerQuestion) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let fileContent = '';
    if (req.file) {
      fileContent = await extractFileContent(req.file);
    }

    const assignment = await Assignment.create({
      title: title.trim().slice(0, 200),
      dueDate: new Date(dueDate),
      questionTypes: parsedQuestionTypes,
      numQuestions: Number(numQuestions),
      marksPerQuestion: Number(marksPerQuestion),
      difficulty: parsedDifficulty ?? { easy: 40, moderate: 40, hard: 20 },
      instructions: instructions || '',
      fileContent,
      status: 'pending',
    });

    await addGenerationJob(String(assignment._id));

    // Invalidate the list cache so the new assignment shows up immediately
    await getRedis().del(CACHE_KEY);

    return res.status(201).json({
      assignmentId: assignment._id,
      status: assignment.status,
      message: 'Assignment created and queued for generation',
    });
  } catch (err) {
    console.error('POST /assignments error:', err);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// GET /api/assignments — List all (cached for 60s)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const redis = getRedis();
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const assignments = await Assignment.find()
      .select('-fileContent')
      .sort({ createdAt: -1 });

    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(assignments));

    return res.json(assignments);
  } catch (err) {
    console.error('GET /assignments error:', err);
    return res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id — Single assignment + question paper
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select('-fileContent');
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const questionPaper = await QuestionPaper.findOne({ assignmentId: assignment._id });

    return res.json({ ...assignment.toObject(), questionPaper: questionPaper ?? null });
  } catch (err) {
    console.error('GET /assignments/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// GET /api/assignments/:id/paper — Question paper only
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id });
    if (!paper) {
      return res.status(404).json({ error: 'Question paper not found' });
    }
    return res.json(paper);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch question paper' });
  }
});

// POST /api/assignments/:id/regenerate — Re-queue generation
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status === 'processing') {
      return res.status(409).json({ error: 'Generation already in progress' });
    }

    assignment.status = 'pending';
    await assignment.save();

    await addGenerationJob(String(assignment._id));

    // Invalidate cache so status reflects immediately
    await getRedis().del(CACHE_KEY);

    return res.json({ message: 'Regeneration queued', assignmentId: assignment._id });
  } catch (err) {
    console.error('POST /assignments/:id/regenerate error:', err);
    return res.status(500).json({ error: 'Failed to queue regeneration' });
  }
});

export default router;
