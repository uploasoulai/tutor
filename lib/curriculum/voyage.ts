export type VoyageInputType = 'document' | 'query';

export type VoyageEmbeddingOptions = {
  input: string | string[];
  inputType: VoyageInputType;
  apiKey?: string;
  projectId?: string;
  model?: string;
  fetchFn?: typeof fetch;
};

export type VoyageEmbeddingResult = {
  embeddings: number[][];
  model: string;
  inputType: VoyageInputType;
  dimensions: number;
};

export async function createVoyageEmbeddings({
  input,
  inputType,
  apiKey = process.env.VOYAGE_API_KEY,
  projectId = process.env.VOYAGE_PROJECT_ID,
  model = process.env.VOYAGE_EMBEDDING_MODEL ?? 'voyage-3-lite',
  fetchFn = fetch,
}: VoyageEmbeddingOptions): Promise<VoyageEmbeddingResult> {
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is not configured');
  }

  const response = await fetchFn('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(projectId ? { 'X-Voyage-Project-ID': projectId } : {}),
    },
    body: JSON.stringify({
      model,
      input,
      input_type: inputType,
      output_dimension: 512,
    }),
  });

  if (!response.ok) {
    throw new Error(`Voyage embedding failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { data: { embedding: number[] }[] };
  const embeddings = payload.data.map((item) => item.embedding);

  return {
    embeddings,
    model,
    inputType,
    dimensions: embeddings[0]?.length ?? 512,
  };
}
