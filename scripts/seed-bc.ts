import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const voyageApiKey = process.env.VOYAGE_API_KEY;
const voyageProjectId = process.env.VOYAGE_PROJECT_ID;
const voyageModel = process.env.VOYAGE_EMBEDDING_MODEL ?? 'voyage-3-lite';
const docxDir = process.env.BC_DOCX_DIR ?? 'C:\\CoastalTutor UI\\K-9';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials in .env.local. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.',
  );
  process.exit(1);
}

if (!voyageApiKey) {
  console.error('Missing VOYAGE_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type Grade = {
  value: number;
  label: string;
};

type CurriculumChunk = {
  subjectCode: string;
  subjectName: string;
  subjectArea: string;
  gradeLevel: number;
  sourceFile: string;
  chunkIndex: number;
  outcomeCode: string;
  contentKnowledge: string;
  elaboration: string;
  chunkText: string;
  sequenceOrder: number;
  difficultyLevel: number;
};

const GRADES: Grade[] = [
  { value: 0, label: 'Kindergarten' },
  ...Array.from({ length: 9 }, (_, index) => ({
    value: index + 1,
    label: `Grade ${index + 1}`,
  })),
];

const SUBJECTS = [
  {
    fileIncludes: 'mathematics',
    area: 'Math',
    docArea: 'MATHEMATICS',
    codePrefix: 'MATH',
    name: 'Mathematics',
  },
  {
    fileIncludes: 'english-language-arts',
    area: 'Language Arts',
    docArea: 'ENGLISH LANGUAGE ARTS',
    codePrefix: 'ELA',
    name: 'English Language Arts',
  },
  {
    fileIncludes: 'arts-education',
    area: 'Arts',
    docArea: 'ARTS EDUCATION',
    codePrefix: 'ARTS',
    name: 'Arts Education',
  },
  {
    fileIncludes: 'adst',
    area: 'ADST',
    docArea: 'ADST',
    codePrefix: 'ADST',
    name: 'Applied Design, Skills, and Technologies',
  },
];

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value: string) {
  return normalize(value).replace(/\s+/g, '-').slice(0, 42) || 'outcome';
}

async function readDocxParagraphs(filePath: string) {
  const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
  const documentXml = await zip.file('word/document.xml')?.async('string');

  if (!documentXml) {
    throw new Error(`Missing word/document.xml in ${filePath}`);
  }

  return [...documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)]
    .map((match) =>
      decodeXml(
        match[0]
          .replace(/<w:tab\/>/g, ' ')
          .replace(/<w:br\/>/g, ' ')
          .replace(/<[^>]+>/g, ''),
      ),
    )
    .filter(Boolean);
}

function gradeAreaIndex(paragraphs: string[], docArea: string, grade: Grade) {
  return paragraphs.findIndex(
    (paragraph) =>
      paragraph.includes(`Area of Learning: ${docArea}`) && paragraph.includes(grade.label),
  );
}

function nextGradeAreaIndex(paragraphs: string[], docArea: string, startIndex: number) {
  const next = paragraphs.findIndex(
    (paragraph, index) =>
      index > startIndex && paragraph.includes(`Area of Learning: ${docArea}`),
  );

  return next === -1 ? paragraphs.length : next;
}

function extractContentStandards(paragraphs: string[], docArea: string, grade: Grade) {
  const start = gradeAreaIndex(paragraphs, docArea, grade);
  if (start === -1) return [];

  const end = nextGradeAreaIndex(paragraphs, docArea, start);
  const contentStart = paragraphs.findIndex(
    (paragraph, index) =>
      index > start && index < end && paragraph === 'Students are expected to know the following:',
  );

  if (contentStart === -1) return [];

  const stopMarkers = new Set([
    'Learning Standards (continued)',
    'Curricular Competencies',
    'Content',
    'Connecting and reflecting',
  ]);

  const standards: string[] = [];
  for (let index = contentStart + 1; index < end; index += 1) {
    const paragraph = paragraphs[index];
    if (stopMarkers.has(paragraph) || paragraph.includes('Content – Elaborations')) break;
    if (paragraph.length > 2) standards.push(paragraph.replace(/:$/, ''));
  }

  return standards;
}

function extractElaborationSection(paragraphs: string[], docArea: string, grade: Grade) {
  const start = paragraphs.findIndex(
    (paragraph) =>
      paragraph.includes(`${docArea}Content`) &&
      paragraph.includes('Elaborations') &&
      paragraph.includes(grade.label),
  );

  if (start === -1) return [];

  const nextContent = paragraphs.findIndex(
    (paragraph, index) =>
      index > start && paragraph.includes(`${docArea}Content`) && paragraph.includes('Elaborations'),
  );
  const nextArea = nextGradeAreaIndex(paragraphs, docArea, start);
  const end = Math.min(nextContent === -1 ? paragraphs.length : nextContent, nextArea);

  return paragraphs.slice(start + 1, end);
}

function isHeaderForStandard(paragraph: string, standards: string[]) {
  const candidate = normalize(paragraph.replace(/:$/, ''));
  return standards.some((standard) => {
    const normalizedStandard = normalize(standard);
    return (
      candidate === normalizedStandard ||
      candidate.startsWith(normalizedStandard) ||
      normalizedStandard.startsWith(candidate)
    );
  });
}

function findStandardHeaderIndex(section: string[], standard: string) {
  const normalizedStandard = normalize(standard);
  return section.findIndex((paragraph) => {
    const candidate = normalize(paragraph.replace(/:$/, ''));
    return (
      candidate === normalizedStandard ||
      candidate.startsWith(normalizedStandard) ||
      normalizedStandard.startsWith(candidate)
    );
  });
}

function buildChunks(fileName: string, paragraphs: string[]) {
  const subject = SUBJECTS.find((item) => fileName.includes(item.fileIncludes));
  if (!subject) return [];

  const chunks: CurriculumChunk[] = [];

  for (const grade of GRADES) {
    const standards = extractContentStandards(paragraphs, subject.docArea, grade);
    const section = extractElaborationSection(paragraphs, subject.docArea, grade);

    standards.forEach((standard, standardIndex) => {
      const headerIndex = findStandardHeaderIndex(section, standard);
      let elaboration = '';

      if (headerIndex !== -1) {
        const nextHeaderIndex = section.findIndex(
          (paragraph, index) =>
            index > headerIndex && paragraph.endsWith(':') && isHeaderForStandard(paragraph, standards),
        );
        const end = nextHeaderIndex === -1 ? section.length : nextHeaderIndex;
        elaboration = section
          .slice(headerIndex + 1, end)
          .join('\n')
          .trim();
      }

      const gradeCode = grade.value === 0 ? 'K' : String(grade.value);
      const subjectCode = `${subject.codePrefix}-${gradeCode}`;
      const outcomeCode = `${subjectCode}-${String(standardIndex + 1).padStart(2, '0')}-${slug(
        standard,
      )}`;
      const chunkText = [
        `Subject: ${subject.name}`,
        `Grade: ${grade.label}`,
        `Knowledge point: ${standard}`,
        elaboration ? `Elaboration:\n${elaboration}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      chunks.push({
        subjectCode,
        subjectName: `${subject.name} ${grade.label}`,
        subjectArea: subject.area,
        gradeLevel: grade.value,
        sourceFile: fileName,
        chunkIndex: chunks.length,
        outcomeCode,
        contentKnowledge: standard,
        elaboration,
        chunkText,
        sequenceOrder: standardIndex + 1,
        difficultyLevel: Math.min(5, Math.max(1, Math.ceil((grade.value + 1) / 2))),
      });
    });
  }

  return chunks;
}

async function embedDocuments(inputs: string[]) {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${voyageApiKey}`,
      ...(voyageProjectId ? { 'X-Voyage-Project-ID': voyageProjectId } : {}),
    },
    body: JSON.stringify({
      model: voyageModel,
      input: inputs,
      input_type: 'document',
      output_dimension: 512,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage embedding failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { data: { embedding: number[] }[] };
  return payload.data.map((item) => item.embedding);
}

async function upsertSubject(chunk: CurriculumChunk) {
  const { data, error } = await supabase
    .from('bc_subjects')
    .upsert(
      {
        code: chunk.subjectCode,
        name: chunk.subjectName,
        grade_level: chunk.gradeLevel,
        subject_area: chunk.subjectArea,
        is_ap_course: false,
        source_file: chunk.sourceFile,
      },
      { onConflict: 'code' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

async function seed() {
  const files = fs
    .readdirSync(docxDir)
    .filter((file) => file.endsWith('.docx'))
    .sort();

  console.log(`Loading ${files.length} BC curriculum DOCX files from ${docxDir}`);

  const chunksBySubject = new Map<string, CurriculumChunk[]>();

  for (const file of files) {
    const paragraphs = await readDocxParagraphs(path.join(docxDir, file));
    const chunks = buildChunks(file, paragraphs);
    console.log(`${file}: ${chunks.length} chunks`);

    for (const chunk of chunks) {
      const existing = chunksBySubject.get(chunk.subjectCode) ?? [];
      existing.push(chunk);
      chunksBySubject.set(chunk.subjectCode, existing);
    }
  }

  let inserted = 0;

  for (const [subjectCode, chunks] of chunksBySubject.entries()) {
    const subjectId = await upsertSubject(chunks[0]);
    console.log(`Embedding ${chunks.length} chunks for ${subjectCode}`);

    for (let index = 0; index < chunks.length; index += 64) {
      const batch = chunks.slice(index, index + 64);
      const embeddings = await embedDocuments(batch.map((chunk) => chunk.chunkText));

      const rows = batch.map((chunk, batchIndex) => ({
        subject_id: subjectId,
        outcome_code: chunk.outcomeCode,
        big_idea: null,
        content_knowledge: chunk.contentKnowledge,
        elaboration: chunk.elaboration,
        chunk_text: chunk.chunkText,
        unit_name: chunk.contentKnowledge,
        sequence_order: chunk.sequenceOrder,
        difficulty_level: chunk.difficultyLevel,
        source_file: chunk.sourceFile,
        chunk_index: chunk.chunkIndex,
        metadata: {
          embedding_model: voyageModel,
          embedding_input_type: 'document',
          embedding_dimensions: 512,
        },
        embedding: `[${embeddings[batchIndex].join(',')}]`,
      }));

      const { error } = await supabase
        .from('bc_learning_outcomes')
        .upsert(rows, { onConflict: 'outcome_code' });

      if (error) throw error;
      inserted += rows.length;
      console.log(`  upserted ${inserted} chunks total`);
    }
  }

  console.log('BC curriculum seed completed.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
