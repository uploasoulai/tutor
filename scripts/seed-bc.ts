import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 1536-dimensional mock embedding for pgvector
const mockEmbedding = Array(1536).fill(0.01);

const subjects = [
  { code: 'MATH-K', name: 'Mathematics Kindergarten', grade_level: 0, is_ap_course: false },
  { code: 'MATH-1', name: 'Mathematics Grade 1', grade_level: 1, is_ap_course: false },
  { code: 'MATH-2', name: 'Mathematics Grade 2', grade_level: 2, is_ap_course: false },
  { code: 'MATH-3', name: 'Mathematics Grade 3', grade_level: 3, is_ap_course: false },
  { code: 'MATH-4', name: 'Mathematics Grade 4', grade_level: 4, is_ap_course: false },
];

const outcomes = [
  {
    subjectCode: 'MATH-K',
    code: 'MATH-K-N1',
    idea: 'Numbers to 10 represent quantities',
    content: 'Number concepts to 10',
    unit: 'Numbers',
    seq: 1,
    diff: 1,
  },
  {
    subjectCode: 'MATH-1',
    code: 'MATH-1-N1',
    idea: 'Numbers to 20 represent quantities',
    content: 'Number concepts to 20',
    unit: 'Numbers',
    seq: 1,
    diff: 2,
  },
  {
    subjectCode: 'MATH-1',
    code: 'MATH-1-C1',
    idea: 'Addition and subtraction with numbers to 20',
    content: 'Addition and subtraction facts to 20',
    unit: 'Computation',
    seq: 2,
    diff: 2,
  },
  {
    subjectCode: 'MATH-2',
    code: 'MATH-2-N1',
    idea: 'Numbers to 100 represent quantities',
    content: 'Number concepts to 100',
    unit: 'Numbers',
    seq: 1,
    diff: 3,
  },
  {
    subjectCode: 'MATH-2',
    code: 'MATH-2-C1',
    idea: 'Addition and subtraction with numbers to 100',
    content: 'Addition and subtraction facts to 100',
    unit: 'Computation',
    seq: 2,
    diff: 3,
  },
  {
    subjectCode: 'MATH-3',
    code: 'MATH-3-F1',
    idea: 'Fractions represent parts of a whole',
    content: 'Fractions',
    unit: 'Fractions',
    seq: 1,
    diff: 3,
  },
  {
    subjectCode: 'MATH-3',
    code: 'MATH-3-C1',
    idea: 'Addition and subtraction to 1000',
    content: 'Addition and subtraction to 1000',
    unit: 'Computation',
    seq: 2,
    diff: 3,
  },
  {
    subjectCode: 'MATH-4',
    code: 'MATH-4-D1',
    idea: 'Decimals represent quantities',
    content: 'Decimals',
    unit: 'Decimals',
    seq: 1,
    diff: 4,
  },
  {
    subjectCode: 'MATH-4',
    code: 'MATH-4-C1',
    idea: 'Multiplication and division of larger numbers',
    content: 'Multiplication and division',
    unit: 'Computation',
    seq: 2,
    diff: 4,
  },
];

async function seed() {
  console.log('Starting seed...');

  // 1. Seed Subjects
  for (const subject of subjects) {
    const { data: existing, error: checkErr } = await supabase
      .from('bc_subjects')
      .select('id')
      .eq('code', subject.code)
      .single();

    let subjectId;

    if (existing) {
      subjectId = existing.id;
      console.log(`Subject ${subject.code} already exists.`);
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('bc_subjects')
        .insert({
          code: subject.code,
          name: subject.name,
          grade_level: subject.grade_level,
          is_ap_course: subject.is_ap_course,
        })
        .select()
        .single();

      if (insertErr) {
        console.error('Error inserting subject', subject.code, insertErr);
        continue;
      }
      subjectId = inserted.id;
      console.log(`Inserted subject ${subject.code}.`);
    }

    // 2. Seed Outcomes for this subject
    const subjectOutcomes = outcomes.filter((o) => o.subjectCode === subject.code);
    for (const outcome of subjectOutcomes) {
      const { data: existingOutcome } = await supabase
        .from('bc_learning_outcomes')
        .select('id')
        .eq('outcome_code', outcome.code)
        .single();

      if (existingOutcome) {
        console.log(`Outcome ${outcome.code} already exists.`);
      } else {
        const { error: outcomeErr } = await supabase.from('bc_learning_outcomes').insert({
          subject_id: subjectId,
          outcome_code: outcome.code,
          big_idea: outcome.idea,
          content_knowledge: outcome.content,
          unit_name: outcome.unit,
          sequence_order: outcome.seq,
          difficulty_level: outcome.diff,
          embedding: `[${mockEmbedding.join(',')}]`,
        });

        if (outcomeErr) {
          console.error('Error inserting outcome', outcome.code, outcomeErr);
        } else {
          console.log(`Inserted outcome ${outcome.code}.`);
        }
      }
    }
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
