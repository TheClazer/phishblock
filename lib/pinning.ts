// phishblock/lib/pinning.ts
/**
 * Pin JSON to Pinata (https://pinata.cloud).
 * Expects process.env.PINATA_API_KEY and process.env.PINATA_API_SECRET to be set.
 * Returns CID string on success.
 */
export async function pinJsonToPinata(json: any): Promise<string> {
  const key = process.env.PINATA_API_KEY;
  const secret = process.env.PINATA_API_SECRET;
  if (!key || !secret) {
    throw new Error("PINATA_API_KEY or PINATA_API_SECRET not set in environment");
  }

  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const body = JSON.stringify(json);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: key,
      pinata_secret_api_key: secret,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = await res.json();
  // Example response: { "IpfsHash": "Qm...", "PinSize": 123, "Timestamp": "2025-10-23T..." }
  if (!data || !data.IpfsHash) {
    throw new Error("Invalid response from Pinata");
  }
  return data.IpfsHash as string;
}
