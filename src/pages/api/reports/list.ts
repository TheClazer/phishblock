// src/pages/api/reports/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.status(200).json({ ok: true, reports });
  } catch (err: any) {
    console.error("Failed to list reports:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
