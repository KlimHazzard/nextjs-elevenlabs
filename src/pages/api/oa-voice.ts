import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;

      // Call OpenAI API for text completion
      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error("OpenAI API error:", errorText);
        return res.status(openAIResponse.status).json({ error: errorText });
      }

      const openAIData = await openAIResponse.json();
      const message = openAIData.choices[0].message.content;

      // Call OpenAI API for text-to-speech
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: message,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const audioFileName = `${uuidv4()}.mp3`;
      const audioFilePath = path.join(process.cwd(), "public", audioFileName);
      await fs.promises.writeFile(audioFilePath, buffer);

      res
        .status(200)
        .json({ message, audio: `/${audioFileName}`, audioFileName });
    } catch (error) {
      console.error("Error in handler:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
