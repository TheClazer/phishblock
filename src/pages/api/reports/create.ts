// phishblock/src/pages/api/reports/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { pinJsonToPinata } from "../../../../lib/pinning";


type Data = { ok: boolean; report?: any; error?: string };

const MAX_REPORTS_PER_HOUR = 6;

async function followRedirectsAndGetChain(url: string) {
  const redirectChain: string[] = [];
  try {
    let current = url;
    for (let i = 0; i < 8; i++) {
      const res = await fetch(current, { method: "GET", redirect: "manual" as any });
      redirectChain.push(current);
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        current = new URL(loc, current).toString();
        continue;
      } else {
        return { finalUrl: current, chain: redirectChain };
      }
    }
    return { finalUrl: current, chain: redirectChain };
  } catch {
    return { finalUrl: url, chain: redirectChain };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ ok: false, error: "Not authenticated" });

  // ✅ handle fallback if oauthId missing
  const oauthId =
    (session as any)?.oauthId ??
    (session.user as any)?.oauthId ??
    (session.user as any)?.id ??
    (session.user as any)?.email ??
    null;

  if (!oauthId)
    return res
      .status(400)
      .json({ ok: false, error: "Session missing oauthId or email" });

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ oauthId }, { email: oauthId }],
    },
  });
  if (!dbUser)
    return res.status(403).json({ ok: false, error: "User not found in DB" });

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentReports = await prisma.report.count({
    where: { reporterId: dbUser.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentReports >= MAX_REPORTS_PER_HOUR)
    return res.status(429).json({ ok: false, error: "Rate limit exceeded" });

  const { targetUrl, description } = req.body ?? {};
  if (!targetUrl || typeof targetUrl !== "string")
    return res.status(400).json({ ok: false, error: "Missing targetUrl" });

  const { finalUrl, chain } = await followRedirectsAndGetChain(targetUrl);
  const normalizedFinal = finalUrl.replace(/\/$/, "");

  try {
    // 1️⃣ Create DB record (pending)
    const report = await prisma.report.create({
      data: {
        reporter: { connect: { id: dbUser.id } },
        targetType: "url",
        targetCanonical: normalizedFinal,
        redirectChain: JSON.stringify(chain),
        description: description || null,
        evidenceCid: null,
        status: "pending",
      },
    });

    // 2️⃣ Prepare JSON for IPFS pinning
    const pinData = {
      id: report.id,
      reporterOauthId: dbUser.oauthId,
      reporterUsername: dbUser.username,
      targetCanonical: report.targetCanonical,
      redirectChain: JSON.parse(report.redirectChain || "[]"),
      description: report.description,
      createdAt: report.createdAt.toISOString(),
      source: "phishblock",
    };

    // 3️⃣ Pin to nft.storage (IPFS)
    try {
      const cid = await pinJsonToPinata(pinData);

      await prisma.report.update({
        where: { id: report.id },
        data: { evidenceCid: cid },
      });
      const updated = await prisma.report.findUnique({ where: { id: report.id } });
      return res.status(201).json({ ok: true, report: updated });
    } catch (pinErr: any) {
      console.error("Pinning failed:", pinErr);
      return res.status(201).json({
        ok: true,
        report,
        error: `Pinned to IPFS failed: ${pinErr.message}`,
      });
    }
  } catch (err: any) {
    console.error("Create report error", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Server error" });
  }
}
