import { create } from 'zustand';
import { Assignment } from '@/types';

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  loading: boolean;
  error: string | null;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),
  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, ...updates } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, ...updates }
          : state.currentAssignment,
    })),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
