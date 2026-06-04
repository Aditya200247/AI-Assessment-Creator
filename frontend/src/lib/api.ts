import axios from 'axios';
import { Assignment, QuestionPaper } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.error || err?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export async function getAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>('/assignments');
  return data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const { data } = await api.get<Assignment>(`/assignments/${id}`);
  return data;
}

export async function createAssignment(
  formData: FormData
): Promise<{ assignmentId: string; status: string }> {
  const { data } = await api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function regenerateAssignment(id: string): Promise<void> {
  await api.post(`/assignments/${id}/regenerate`);
}

export async function getQuestionPaper(id: string): Promise<QuestionPaper> {
  const { data } = await api.get<QuestionPaper>(`/assignments/${id}/paper`);
  return data;
}
