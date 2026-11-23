/**
 * Deletes every SAMPLE document (products, brands, projects with isSample),
 * then the sample images. Real content is never touched.
 *   npm run samples:remove        (in /studio)
 * Run it before launch, once real products are in.
 */
import { getCliClient } from "sanity/cli";
import { API_VERSION } from "../lib/constants";

const client = getCliClient({ apiVersion: API_VERSION });

async function main() {
  const ids = await client.fetch<string[]>(
    `*[_type in ["product", "brand", "project", "catalogFile"] && isSample == true]._id`,
  );
  // Remove references to sample docs from the home page first.
  await client
    .patch("homePage")
    .unset(
      ids.flatMap((id) => [
        `featuredProducts[_ref=="${id}"]`,
        `brands[_ref=="${id}"]`,
      ]),
    )
    .commit()
    .catch(() => undefined);

  // Sample hero video / poster on the home page (filenames start with "sample-").
  const home = await client.fetch<Record<string, string | null> | null>(
    `*[_id == "homePage"][0]{
      "heroVideo": heroVideo.asset->originalFilename,
      "heroVideoMobile": heroVideoMobile.asset->originalFilename,
      "heroPoster": heroPoster.asset->originalFilename
    }`,
  );
  const sampleFields = Object.entries(home ?? {})
    .filter(([, name]) => name?.startsWith("sample-"))
    .map(([field]) => field);
  if (sampleFields.length)
    await client.patch("homePage").unset(sampleFields).commit();

  const tx = client.transaction();
  for (const id of ids) {
    tx.delete(id);
    tx.delete(`drafts.${id}`);
  }
  await tx.commit();
  console.log(`Deleted ${ids.length} sample documents.`);

  const assets = await client.fetch<string[]>(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"] && originalFilename match "sample-*" && count(*[references(^._id)]) == 0]._id`,
  );
  for (const id of assets) await client.delete(id);
  console.log(`Deleted ${assets.length} sample images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
