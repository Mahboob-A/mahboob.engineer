// `tsx scripts/rag-reindex.ts` runs outside of `next dev`, so Next.js'
// built-in `.env` loader does not apply here. Loading dotenv explicitly
// keeps the script in sync with the dev server's env surface — the same
// vars the route reads at request time are also what the script reads at
// reindex time.
import "dotenv/config";
import { Index } from "@upstash/vector";
import { buildRagCorpus, type RagChunk } from "@/lib/rag/chunks";

type VectorMetadata = Record<string, unknown>;

const BATCH_SIZE = 20;

const DEFAULT_UPSTASH_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const DEFAULT_UPSTASH_EMBEDDING_DIMENSIONS = 1536;

function redactVectorUrl(url: string): string {
  // Never log the full UPSTASH_VECTOR_REST_URL (it embeds a project id).
  // Replace the prefix segment after the scheme with ***.
  return url.replace(/(https?:\/\/)[^.\-]+/, "$1***");
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const reset = args.has("--reset");
  const resetAll = args.has("--reset-all");
  if (reset && resetAll) {
    throw new Error("Pass only one of --reset or --reset-all, not both.");
  }
  const corpus = await buildRagCorpus();
  const byKind = countByKind(corpus.chunks);

  console.log(`RAG corpus: ${corpus.chunks.length} chunks`);
  console.log(`Corpus hash: ${corpus.hash}`);
  console.log("By kind:");
  for (const [kind, count] of Object.entries(byKind).sort()) {
    console.log(`  ${kind.padEnd(16, " ")} ${count}`);
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

  const embeddingModel =
    process.env.RAG_UPSTASH_EMBEDDING_MODEL ??
    DEFAULT_UPSTASH_EMBEDDING_MODEL;
  const embeddingDimensions = Number.parseInt(
    process.env.RAG_UPSTASH_EMBEDDING_DIMENSIONS ??
      String(DEFAULT_UPSTASH_EMBEDDING_DIMENSIONS),
    10,
  );
  if (!Number.isFinite(embeddingDimensions)) {
    throw new Error(
      `RAG_UPSTASH_EMBEDDING_DIMENSIONS must be an integer; got "${process.env.RAG_UPSTASH_EMBEDDING_DIMENSIONS}".`,
    );
  }

  const namespace = process.env.RAG_VECTOR_NAMESPACE ?? "portfolio-rag";
  const client = new Index<VectorMetadata>({ url, token });
  const index = client.namespace(namespace);

  // Optional sanity check: read the index's reported dimension and warn
  // loudly if it differs from the configured value. This catches a
  // recreate-index mistake before we waste a full reindex.
  try {
    const info = await client.info();
    if (info.dimension !== embeddingDimensions) {
      throw new Error(
        `Upstash index reports dimension ${info.dimension} but RAG_UPSTASH_EMBEDDING_DIMENSIONS=${embeddingDimensions}. ` +
          `Recreate the Upstash index at dimension ${embeddingDimensions} (matching the selected embedding model) and re-run.`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Upstash index")) {
      throw error;
    }
    console.warn(
      `Could not verify Upstash index dimension (${error instanceof Error ? error.message : String(error)}); proceeding with configured value ${embeddingDimensions}.`,
    );
  }

  console.log(`Upstash embed model: ${embeddingModel} (${embeddingDimensions}d, server-side)`);
  console.log(`Upstash endpoint: ${redactVectorUrl(url)}`);
  console.log(`Vector namespace: ${namespace}`);

  // Optional reset before upsert. Production deploys pass --reset so the
  // namespace is wiped clean before re-indexing — that way deleted /
  // renamed chunks don't leave stale vectors behind that pollute
  // retrieval. Local dev reindexes stay additive (no flag = no reset).
  if (reset) {
    const message = await index.reset();
    console.log(`Reset: ${message}`);
  } else if (resetAll) {
    const message = await client.reset({ all: true });
    console.log(`Reset all namespaces: ${message}`);
  }

  let upserted = 0;
  for (const batch of batches(corpus.chunks, BATCH_SIZE)) {
    const vectors = batch.map((item) => ({
      id: item.id,
      data: item.text,
      metadata: {
        ...item.metadata,
        text: item.text,
        corpusHash: corpus.hash,
        upstashEmbeddingModel: embeddingModel,
        upstashEmbeddingDimensions: embeddingDimensions,
      } satisfies VectorMetadata,
    }));
    await index.upsert(vectors);
    upserted += batch.length;
    process.stdout.write(`\rUpsert: ${upserted}/${corpus.chunks.length}`);
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
