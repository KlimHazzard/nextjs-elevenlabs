// src/app/page.tsx
"use client"; // Add this line to mark the component as a Client Component
// Example: src/index.tsx or src/App.tsx
// import "./globals.css"; // Adjust the path as necessary
import React, { useEffect, useState, useRef } from "react";
import { play } from "elevenlabs";

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [exists, setExists] = useState(false);
  const [file, setFile] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null); // Create a ref for the audio element

  // ElevenLabs
  const handleAudioGeneration = async () => {
    if (exists) {
      console.log(exists);
      console.log(response);
      const speechResponse = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${response}`,
        }),
      });

      if (speechResponse.ok) {
        const data = await speechResponse.json();
        const audioUrl = data.audio; // Get the audio URL or base64 data

        if (audioUrl.startsWith("data:")) {
          // Check if it's base64
          const audioBlob = await fetch(audioUrl).then((res) => res.blob());
          const blobUrl = URL.createObjectURL(audioBlob);
          if (audioRef.current) {
            audioRef.current.src = blobUrl; // Set the audio source to the Blob URL
            audioRef.current.play(); // Play the audio
          }
        } else {
          if (audioRef.current) {
            audioRef.current.src = audioUrl; // Set the audio source
            audioRef.current.play(); // Play the audio
          }
        }
      } else {
        console.error("Error generating audio");
      }
    } else {
      const response = await fetch("/api/elevenlabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hello! 你好! Hola! नमस्ते! Bonjour! こんにちは! مرحبا! 안녕하세요! Ciao! Cześć! Привіт! வணக்கம்!",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const audioUrl = data.audio; // Get the audio URL or base64 data

        if (audioUrl.startsWith("data:")) {
          // Check if it's base64
          const audioBlob = await fetch(audioUrl).then((res) => res.blob());
          const blobUrl = URL.createObjectURL(audioBlob);
          if (audioRef.current) {
            audioRef.current.src = blobUrl; // Set the audio source to the Blob URL
            audioRef.current.play(); // Play the audio
          }
        } else {
          if (audioRef.current) {
            audioRef.current.src = audioUrl; // Set the audio source
            audioRef.current.play(); // Play the audio
          }
        }
      } else {
        console.error("Error generating audio");
      }
    }
  };

  // OpenAI Voice
  const handleOpenAIVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      if (audioRef.current) {
        audioRef.current.play(); // Play the audio
      }
    } else {
      try {
        const res = await fetch("/api/oa-voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
          console.error("Error fetching OpenAI voice response");
          return;
        }

        const data = await res.json();
        setResponse(data.message);
        setFile(data.audioFileName);

        if (audioRef.current) {
          audioRef.current.src = data.audio; // Set the audio source to the URL
          audioRef.current.play(); // Play the audio
        }
      } catch (error) {
        console.error("Error in handleOpenAIVoice:", error);
      }
      setExists(true);
      console.log("(OpenAI Voice) Exists state changed:", exists);
    }
  };

  // OpenAI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit function called");
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json(); // Parse the JSON response
    console.log("OpenAI API response:", data); // Log the full response

    // Check for errors in the response
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      if (data.error.code === "insufficient_quota") {
        setResponse(
          "Error: You have exceeded your quota. Please check your plan and billing details."
        );
      } else {
        setResponse("Error: " + data.error.message); // Set error message for other errors
      }
      return;
    }

    // Safely access the response content
    setResponse(data.choices[0]?.message.content || "No response");
    setExists(true);
    console.log("(SUBMIT) Exists state changed:", exists);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        Welcome to Eleven Labs
      </h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border p-2 rounded text-black"
          placeholder="Enter your prompt here"
        />
        <hr />
        <div>
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white p-2 rounded"
          >
            Submit to OpenAI, Receive Text
          </button>
        </div>
        <div>
          <button
            onClick={handleOpenAIVoice}
            className="mt-2 bg-red-600 text-white p-2 rounded"
          >
            Play OpenAI Voice
          </button>
        </div>
      </form>
      <div>
        <button
          onClick={handleAudioGeneration} // Trigger audio generation on button click
          className="mt-2 bg-green-600 text-white p-2 rounded"
        >
          Play ElevenLabs Audio
        </button>
      </div>
      {response && <p className="mt-4 text-lg text-gray-700">{response}</p>}
      <audio ref={audioRef} style={{ display: "none" }} />{" "}
      {/* Hidden audio element */}
    </div>
  );
};

export default HomePage;
