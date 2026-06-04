import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { IAssignment } from '../models/Assignment';
import { IQuestionPaperData } from '../types';

const QuestionSchema = z.object({
  text: z.string().min(5),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']),
  marks: z.number().int().positive(),
  options: z.array(z.string()).optional(),
});

const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

const QuestionPaperSchema = z.object({
  sections: z.array(SectionSchema).min(1),
});

function buildPrompt(assignment: IAssignment): string {
  const {
    title,
    questionTypes,
    numQuestions,
    marksPerQuestion,
    difficulty,
    instructions,
    fileContent,
  } = assignment;

  const perTypeCount = Math.ceil(numQuestions / questionTypes.length);
  const easyCount = Math.round((numQuestions * difficulty.easy) / 100);
  const moderateCount = Math.round((numQuestions * difficulty.moderate) / 100);
  const hardCount = numQuestions - easyCount - moderateCount;

  const sectionsDesc = questionTypes
    .map(
      (type, i) =>
        `Section ${String.fromCharCode(65 + i)}: ${type} — approximately ${perTypeCount} questions`
    )
    .join('\n');

  return `You are an expert academic exam paper creator.

Generate a structured question paper for the following assignment and return ONLY valid JSON matching the schema exactly. Do not include any markdown, explanation, or text outside the JSON.

Assignment Details:
- Subject/Topic: ${title}
- Question Types & Sections:
${sectionsDesc}
- Total Questions: ${numQuestions}
- Marks per Question: ${marksPerQuestion}
- Difficulty Distribution: ${easyCount} Easy, ${moderateCount} Moderate, ${hardCount} Hard
- Additional Instructions: ${instructions || 'None'}
${fileContent ? `\nReference Material:\n${fileContent.slice(0, 2000)}` : ''}

Rules:
1. Create one section per question type (Section A, Section B, etc.)
2. Each section must have a meaningful instruction (e.g., "Attempt all questions", "Answer any 3 of the following")
3. Spread difficulty across sections proportionally
4. For MCQ questions, include exactly 4 options in the "options" array
5. For other types, omit the "options" field
6. Make questions specific, academic, and relevant to the topic
7. Vary question complexity appropriately per difficulty level

Required JSON format:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries equal marks.",
      "questions": [
        {
          "text": "Question text here?",
          "difficulty": "Easy",
          "marks": ${marksPerQuestion},
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
  ]
}

Generate exactly ${numQuestions} questions total across all sections. Output ONLY the JSON object.`;
}

function parseResponse(raw: string): IQuestionPaperData {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const result = QuestionPaperSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`LLM response failed validation: ${result.error.message}`);
  }

  return result.data;
}

export async function generateQuestionPaper(
  assignment: IAssignment
): Promise<IQuestionPaperData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  const prompt = buildPrompt(assignment);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Gemini attempt ${attempt} for assignment ${assignment._id}`);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const paperData = parseResponse(text);
      console.log(`Generated ${paperData.sections.length} sections successfully`);
      return paperData;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Attempt ${attempt} failed:`, lastError.message);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw lastError ?? new Error('Unknown LLM error');
}
