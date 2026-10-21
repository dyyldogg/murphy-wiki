// Comments for the /aura page. No accounts: a visitor gives a name and a comment.
//
//   GET  /api/comments  -> { comments: [{ id, name, text, date }] }, newest first
//   POST /api/comments  <- { name, text, website }  (website is a hidden spam trap)
//
// Each comment is its own small JSON file in the "murphy-wiki-comments" Vercel Blob store,
// under aura-comments/. To remove a comment, delete its file in the Vercel dashboard
// (Storage -> murphy-wiki-comments -> Browser); it disappears from the page within about a minute.

import { list, put } from "@vercel/blob";
import { createHash, randomBytes } from "node:crypto";

const PREFIX = "aura-comments/";
const MAX_NAME = 40;
const MAX_TEXT = 500;
const MAX_SHOWN = 300;
const COOLDOWN_MS = 20_000;

// Strip control characters (keeping line breaks), tidy whitespace.
export function clean(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// A short one-way tag for the sender, so the same person can't post twice within 20 seconds.
// Salted with the store's secret token, so it can't be traced back to an IP address.
function senderTag(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "";
  return createHash("sha256").update(`${ip}|${process.env.BLOB_READ_WRITE_TOKEN || ""}`).digest("hex").slice(0, 12);
}

// aura-comments/2026-10-20T17-05-03-123Z-<tag>-<random>.json
function parsePath(pathname) {
  const m = /^aura-comments\/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)-([0-9a-f]{12})-([0-9a-f]{8})\.json$/.exec(pathname);
  if (!m) return null;
  const iso = m[1].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, "T$1:$2:$3.$4Z");
  return { time: Date.parse(iso), tag: m[2], id: `${m[1]}-${m[3]}` };
}

async function allCommentBlobs(blob) {
  const blobs = [];
  let cursor;
  do {
    const page = await blob.list({ prefix: PREFIX, limit: 1000, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs
    .map((b) => ({ ...b, meta: parsePath(b.pathname) }))
    .filter((b) => b.meta)
    .sort((a, b) => b.meta.time - a.meta.time);
}

export function makeHandler(blob = { list, put }, fetchImpl = fetch) {
  async function getComments(res) {
    const blobs = (await allCommentBlobs(blob)).slice(0, MAX_SHOWN);
    const comments = (
      await Promise.all(
        blobs.map(async (b) => {
          try {
            const r = await fetchImpl(b.url);
            if (!r.ok) return null;
            const c = await r.json();
            return { id: b.meta.id, name: clean(c.name).slice(0, MAX_NAME), text: clean(c.text).slice(0, MAX_TEXT), date: c.date };
          } catch {
            return null;
          }
        })
      )
    ).filter((c) => c && c.name && c.text);
    // Cached briefly at Vercel's edge so page views don't each hit storage.
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ comments });
  }

  async function postComment(req, res) {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch { body = {}; }
    }
    body = body && typeof body === "object" ? body : {};
    res.setHeader("Cache-Control", "no-store");

    // Spam trap: real visitors never see or fill this field. Pretend it worked.
    if (clean(body.website)) return res.status(201).json({ comment: null });

    const name = clean(body.name);
    const text = clean(body.text);
    if (!name || !text) return res.status(400).json({ error: "Write a name and a comment." });
    if (name.length > MAX_NAME) return res.status(400).json({ error: `Names can be up to ${MAX_NAME} characters.` });
    if (text.length > MAX_TEXT) return res.status(400).json({ error: `Comments can be up to ${MAX_TEXT} characters.` });

    const tag = senderTag(req);
    const now = Date.now();
    const recent = (await allCommentBlobs(blob)).find((b) => b.meta.tag === tag && now - b.meta.time < COOLDOWN_MS);
    if (recent) return res.status(429).json({ error: "You just posted. Wait a few seconds and try again." });

    const date = new Date(now).toISOString();
    const stamp = date.replace(/[:.]/g, "-");
    const rand = randomBytes(4).toString("hex");
    await blob.put(`${PREFIX}${stamp}-${tag}-${rand}.json`, JSON.stringify({ name, text, date }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return res.status(201).json({ comment: { id: `${stamp}-${rand}`, name, text, date } });
  }

  return async function handler(req, res) {
    try {
      if (req.method === "GET") return await getComments(res);
      if (req.method === "POST") return await postComment(req, res);
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed." });
    } catch (err) {
      console.error("comments error", err);
      res.setHeader("Cache-Control", "no-store");
      return res.status(500).json({
        error: req.method === "POST" ? "Couldn't save your comment. Try again in a moment." : "Couldn't load comments.",
      });
    }
  };
}

export default makeHandler();
