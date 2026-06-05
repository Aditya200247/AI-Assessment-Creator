'use client';

import {
  Document, Page, Text, View, StyleSheet, pdf
} from '@react-pdf/renderer';
import { Assignment, QuestionPaper, Section, Question } from '@/types';
import { Download } from 'lucide-react';
import { format } from 'date-fns';



const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1a1a2e',
    margin: -50,
    marginBottom: 20,
    padding: 30,
    paddingTop: 25,
    paddingBottom: 25,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: '#ffffff22',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  headerMetaItem: {
    alignItems: 'center',
  },
  headerMetaLabel: {
    color: '#94a3b8',
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerMetaValue: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  studentSection: {
    backgroundColor: '#f8f9fe',
    padding: 12,
    marginBottom: 14,
    borderRadius: 4,
  },
  studentLabel: {
    fontSize: 7,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  studentFields: {
    flexDirection: 'row',
    gap: 20,
  },
  studentField: {
    flex: 1,
  },
  studentFieldLabel: {
    fontSize: 7,
    color: '#718096',
    marginBottom: 3,
  },
  studentFieldLine: {
    borderBottomColor: '#CBD5E0',
    borderBottomWidth: 1,
    height: 14,
  },
  instructions: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    marginBottom: 14,
    borderRadius: 4,
    borderLeftColor: '#FDCB6E',
    borderLeftWidth: 3,
  },
  instructionsLabel: {
    fontSize: 7,
    color: '#92400E',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 8,
    color: '#78350F',
    lineHeight: 1.5,
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  sectionBar: {
    width: 3,
    height: 20,
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2D3748',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionInstruction: {
    fontSize: 8,
    color: '#718096',
    marginLeft: 11,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  questionContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
  },
  questionNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#6C5CE7',
    width: 20,
    flexShrink: 0,
  },
  questionContent: {
    flex: 1,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionText: {
    fontSize: 10,
    color: '#2D3748',
    lineHeight: 1.5,
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  marksBox: {
    fontSize: 8,
    color: '#718096',
    backgroundColor: '#F8F9FE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexShrink: 0,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    width: '47%',
    alignItems: 'flex-start',
    gap: 3,
  },
  optionLetter: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6C5CE7',
  },
  optionText: {
    fontSize: 9,
    color: '#4A5568',
    flex: 1,
    lineHeight: 1.4,
  },
  difficultyBadge: {
    marginTop: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#A0AEC0',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    paddingTop: 8,
  },
});

function getDifficultyStyle(difficulty: string) {
  if (difficulty === 'Easy') return { bg: '#DCFCE7', color: '#166534' };
  if (difficulty === 'Moderate') return { bg: '#FEF9C3', color: '#854D0E' };
  return { bg: '#FEE2E2', color: '#991B1B' };
}

interface DocProps {
  assignment: Assignment;
  questionPaper: QuestionPaper;
}

function ExamPaperDocument({ assignment, questionPaper }: DocProps) {
  const totalMarks = assignment.numQuestions * assignment.marksPerQuestion;
  let qCounter = 0;

  return (
    <Document title={assignment.title} author="VedaAI">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{assignment.title}</Text>
          <Text style={styles.headerSub}>AI-Generated Examination Paper · VedaAI</Text>
          <View style={styles.headerMeta}>
            <View style={styles.headerMetaItem}>
              <Text style={styles.headerMetaLabel}>Date</Text>
              <Text style={styles.headerMetaValue}>
                {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.headerMetaItem}>
              <Text style={styles.headerMetaLabel}>Max Marks</Text>
              <Text style={styles.headerMetaValue}>{totalMarks}</Text>
            </View>
            <View style={styles.headerMetaItem}>
              <Text style={styles.headerMetaLabel}>Questions</Text>
              <Text style={styles.headerMetaValue}>{assignment.numQuestions}</Text>
            </View>
            <View style={styles.headerMetaItem}>
              <Text style={styles.headerMetaLabel}>Generated</Text>
              <Text style={styles.headerMetaValue}>
                {format(new Date(questionPaper.generatedAt), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Student Info */}
        <View style={styles.studentSection}>
          <Text style={styles.studentLabel}>Student Information</Text>
          <View style={styles.studentFields}>
            {['Full Name', 'Roll Number', 'Section'].map((label) => (
              <View key={label} style={styles.studentField}>
                <Text style={styles.studentFieldLabel}>{label}:</Text>
                <View style={styles.studentFieldLine} />
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsLabel}>General Instructions</Text>
          <Text style={styles.instructionsText}>
            {'• All questions are compulsory unless stated otherwise.\n'}
            {'• Write legibly. Marks may be deducted for illegible answers.\n'}
            {'• Do not write anything on the question paper except where indicated.'}
          </Text>
        </View>

        {/* Sections */}
        {questionPaper.sections.map((section: Section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionInstruction}>{section.instruction}</Text>

            {section.questions.map((q: Question) => {
              qCounter++;
              const diff = getDifficultyStyle(q.difficulty);
              return (
                <View key={qCounter} style={styles.questionContainer}>
                  <Text style={styles.questionNumber}>{qCounter}.</Text>
                  <View style={styles.questionContent}>
                    <View style={styles.questionRow}>
                      <Text style={styles.questionText}>{q.text}</Text>
                      <Text style={styles.marksBox}>[{q.marks} Mark{q.marks !== 1 ? 's' : ''}]</Text>
                    </View>
                    {q.options && q.options.length > 0 && (
                      <View style={styles.optionsGrid}>
                        {q.options.map((opt, oi) => (
                          <View key={opt} style={styles.optionItem}>
                            <Text style={styles.optionLetter}>{String.fromCharCode(65 + oi)})</Text>
                            <Text style={styles.optionText}>{opt}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={[styles.difficultyBadge, { backgroundColor: diff.bg }]}>
                      <Text style={[styles.difficultyText, { color: diff.color }]}>
                        {q.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          VedaAI Assessment Creator · All the best!
        </Text>
      </Page>
    </Document>
  );
}

interface ButtonProps {
  assignment: Assignment;
  questionPaper: QuestionPaper;
  className?: string;
}

export default function PDFDownloadButton({ assignment, questionPaper, className }: ButtonProps) {
  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <ExamPaperDocument assignment={assignment} questionPaper={questionPaper} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assignment.title.replace(/\s+/g, '_')}_question_paper.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  return (
    <button onClick={handleDownload} className={className || "btn-primary py-2.5 px-4 text-sm"}>
      <Download className="w-4 h-4" />
      <span>Download as PDF</span>
    </button>
  );
}
