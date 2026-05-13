import { describe, expect, it, vi } from 'vitest';
import { createVoyageEmbeddings } from '@/lib/curriculum/voyage';

describe('Voyage curriculum embeddings', () => {
  it('uses query input_type for search embeddings', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: [0.1, 0.2] }] }),
    });

    const result = await createVoyageEmbeddings({
      input: 'Grade 2 number concepts to 100',
      inputType: 'query',
      apiKey: 'test-key',
      projectId: 'test-project',
      fetchFn,
    });

    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body).toMatchObject({
      model: 'voyage-3-lite',
      input_type: 'query',
      output_dimension: 512,
    });
    expect(result.inputType).toBe('query');
    expect(result.embeddings).toEqual([[0.1, 0.2]]);
  });

  it('uses document input_type for stored curriculum chunks', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: [0.3, 0.4] }] }),
    });

    await createVoyageEmbeddings({
      input: ['Knowledge point plus elaboration'],
      inputType: 'document',
      apiKey: 'test-key',
      fetchFn,
    });

    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body.input_type).toBe('document');
  });
});
