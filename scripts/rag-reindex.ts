import { Index } from "@upstash/vector";
import { buildRagCorpus, type RagChunk } from "@/lib/rag/chunks";
import { getRagModelClient } from "@/lib/rag/providers";

type VectorMetadata = Record<string, unknown>;

const BATCH_SIZE = 20;

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const corpus = await buildRagCorpus();
  const byKind = countByKind(corpus.chunks);

  console.log(`RAG corpus: ${corpus.chunks.length} chunks`);
  console.log(`Corpus hash: ${corpus.hash}`);
  console.log("By kind:");
  for (const [kind, count] of Object.entries(byKind).sort()) {
    console.log(`  ${kind.padEnd(12, " ")} ${count}`);
  }

  if (dryRun) {
    console.log("\nDry run: no embeddings or Upstash writes.");
    for (const sample of corpus.chunks.slice(0, 5)) {
      console.log(`\n- ${sample.id}`);
      console.log(`  ${sample.metadata.kind}: ${sample.metadata.title}`);
      console.log(`  ${sample.text.slice(0, 180).replace(/\s+/g, " ")}...`);
    }
    return;
  }

  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN are required for real reindexing. Use --dry-run to inspect the corpus locally.",
    );
  }

  const namespace = process.env.RAG_VECTOR_NAMESPACE ?? "portfolio-rag";
  const index = new Index<VectorMetadata>({ url, token }).namespace(namespace);
  const modelClient = getRagModelClient();

  console.log(`Provider: ${modelClient.provider}`);
  console.log(`Embedding model: ${modelClient.embeddingModel}`);
  console.log(`Vector namespace: ${namespace}`);

  let embedded = 0;
  for (const batch of batches(corpus.chunks, BATCH_SIZE)) {
    const vectors = [];
    for (const item of batch) {
      const result = await modelClient.embed(item.text);
      vectors.push({
        id: item.id,
        vector: result.embedding,
        metadata: {
          ...item.metadata,
          text: item.text,
          corpusHash: corpus.hash,
          embeddingModel: result.model,
          dimensions: result.dimensions,
        },
      });
      embedded += 1;
      process.stdout.write(`\rEmbedding: ${embedded}/${corpus.chunks.length}`);
    }
    await index.upsert(vectors);
  }

  console.log("\nUpstash upsert: complete");
}

function countByKind(chunks: readonly RagChunk[]): Record<string, number> {
  return chunks.reduce<Record<string, number>>((acc, item) => {
    acc[item.metadata.kind] = (acc[item.metadata.kind] ?? 0) + 1;
    return acc;
  }, {});
}

function batches<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
