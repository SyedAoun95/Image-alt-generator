import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// 🔑 Replace this with your actual Google AI Studio API key
const API_KEY = "AIzaSyA_cgnKqRYI3pv-6a-xru10Hqzsk3fva_Q";

app.post("/generate-alt", async (req, res) => {
  try {
    const { imageData, mimeType } = req.body;
    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mime type" });
    }

    // ✅ Using Gemini 2.5 Flash (multimodal, supports image input)
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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

    const response = await fetch(endpoint, {
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

app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
