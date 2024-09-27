import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;

      // Call OpenAI API here (make sure to handle the request properly)
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Use your OpenAI API key
          },
          body: JSON.stringify({
            model: "gpt-4o", // or "gpt-4" if you have access
            messages: [{ role: "user", content: prompt }], // Format the prompt as a message
          }), // Adjust the body as per OpenAI API requirements
        }
      );

      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text(); // Get the error response text
        // console.log("OpenAI API response:", data); // Log the full response
        console.error("OpenAI API error:", errorText); // Log the error
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json(); // Parse the JSON response
      res.status(200).json(data); // Return the data
      console.log("Message to show successful OpenAI API response");
    } catch (error) {
      console.error("Error in OpenAI API handler:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
