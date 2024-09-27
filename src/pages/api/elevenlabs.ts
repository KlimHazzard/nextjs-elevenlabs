import { NextApiRequest, NextApiResponse } from "next";
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY, // Use environment variable for API key
});

// Helper function to convert Readable stream to Buffer
const streamToBuffer = async (stream: Readable) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { text } = req.body;
      const audioStream = await elevenlabs.generate({
        voice: "Alice",
        text: text,
        model_id: "eleven_multilingual_v2",
      });

      console.log("Audio object:", audioStream); // Log the audio object to inspect its structure

      // Convert Readable stream to buffer
      const audioBuffer = await streamToBuffer(audioStream);
      const audioUrl = `data:audio/wav;base64,${audioBuffer.toString(
        "base64"
      )}`; // Create a base64 URL

      res.status(200).json({ audio: audioUrl }); // Return the audio URL
    } catch (error) {
      console.error(error); // Log the error
      res.status(500).json({ error: "Error generating audio" });
    }
  } else {
    console.log("Received request:", req.body);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
