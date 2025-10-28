import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// ✅ Load from .env
const API_KEY = process.env.GOOGLE_API_KEY;
const API_URL = process.env.GEMINI_API_URL;
const PORT = process.env.PORT || 3000;

if (!API_KEY || !API_URL) {
  console.error("❌ Missing API key or URL in .env file");
  process.exit(1);
}

app.post("/generate-alt", async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;
    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mime type" });
    }

    const payload = {
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageData } },
            {
              text: `
                Generate a concise, meaningful alt text for this image.
                Guidelines:
                - Limit to 120 characters.
                - Focus on the main subject or context.
                - Avoid phrases like "image of" or "picture of".
                Respond only with the alt text.
              `,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("🔍 Gemini raw response:", JSON.stringify(data, null, 2));

    const altText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ No alt text generated.";

    res.json({ altText });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Failed to generate alt text" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
