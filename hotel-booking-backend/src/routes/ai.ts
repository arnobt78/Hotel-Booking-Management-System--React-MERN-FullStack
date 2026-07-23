import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import { generateDraft, SuggestKind } from "../lib/llm";

const router = express.Router();

/**
 * AI suggest — env-gated; returns draft only (client must Apply).
 * POST /api/ai/suggest
 * Multi-provider chain (Groq → OpenAI → OpenRouter → stub) with 429/5xx failover.
 */
router.post(
  "/suggest",
  verifyToken,
  [
    body("kind").isIn(["hotel_description", "insights_copy"]),
    body("input").isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid request",
        errors: errors.array(),
      });
    }

    if (process.env.AI_ASSIST_ENABLED !== "true") {
      return res.status(503).json({
        message: "AI assist is disabled (set AI_ASSIST_ENABLED=true)",
      });
    }

    const kind = req.body.kind as SuggestKind;
    const input = String(req.body.input || "");

    const result = await generateDraft(kind, input);
    return res.json({
      draft: result.draft,
      provider: result.provider,
      model: result.model,
      usedFallback: result.usedFallback,
    });
  }
);

export default router;
