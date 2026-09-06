const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

// Folder where generated audio files will temporarily be stored
const audioFolder = path.join(__dirname, "audio");

if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder);
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MediKiosk TTS backend is running",
  });
});

// Marathi / Gujarati local TTS
app.post("/api/tts", (req, res) => {
  const { text, language } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: "Text is required",
    });
  }

  let voice;

  if (language === "mr") {
    voice = "mr";
  } else if (language === "gu") {
    voice = "gu";
  } else {
    return res.status(400).json({
      success: false,
      message: "Local TTS supports Marathi and Gujarati only",
    });
  }

  const fileName = `tts-${Date.now()}.wav`;
  const outputPath = path.join(audioFolder, fileName);

  console.log("TTS request:", {
    language,
    voice,
    text,
  });

  execFile(
    "espeak-ng",
    [
        "-v",
        voice,
        "-s",
        "135",
        "-p",
        "45",
        "-w",
        outputPath,
        text,
    ],
    (error) => {
      if (error) {
        console.error("eSpeak NG error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to generate speech",
          error: error.message,
        });
      }

      res.sendFile(outputPath, (sendError) => {
        if (sendError) {
          console.error("Audio send error:", sendError);
        }

        // Delete temporary audio file after sending
        setTimeout(() => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (deleteError) {
            console.error("Could not delete temporary audio:", deleteError);
          }
        }, 5000);
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`MediKiosk TTS backend running at http://localhost:${PORT}`);
});