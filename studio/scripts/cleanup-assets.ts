/**
 * Deletes uploaded images/files that no document uses anymore (e.g. replaced
 * product photos). Keeps the dataset under the free plan's document limit
 * (every uploaded file counts as a document).
 *   npm run assets:cleanup        (in /studio)
 * Pass --dry to only list what would be deleted.
 */
import { getCliClient } from "sanity/cli";
import { API_VERSION } from "../lib/constants";

const client = getCliClient({ apiVersion: API_VERSION });
const dryRun = process.argv.includes("--dry");

async function main() {
  const unused = await client.fetch<
    { _id: string; originalFilename?: string; size?: number }[]
  >(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && count(*[references(^._id)]) == 0]{_id, originalFilename, size}`,
  );
  const total = await client.fetch<number>(`count(*[!(_id in path("_.**"))])`);
  console.log(`Documents in dataset: ${total} (free plan limit: 10,000)`);
  console.log(`Unused files: ${unused.length}`);
  for (const asset of unused) {
    console.log(`  ${asset.originalFilename ?? asset._id}`);
    if (!dryRun) await client.delete(asset._id);
  }
  if (dryRun) console.log("Dry run: nothing deleted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
