/**
 * Camera Page
 * AI-powered sign language practice with real-time ML feedback
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@hooks/useUserData";
import { useNotification } from "@hooks/useNotification";
import {
  IoCamera,
  IoVideocam,
  IoVideocamOff,
  IoRefresh,
  IoTrophy,
} from "react-icons/io5";
import Button from "@components/common/Button";
import Card from "@components/common/Card";


import mlModelService from "@/services/mlModel"; // ✅ ML service

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const { updateProgress } = useUserData();
  const notification = useNotification();

  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const [modelReady, setModelReady] = useState(false);

  // A–Z alphabet list for camera practice
const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const allSigns = ALPHABETS.map((letter) => ({
  id: letter,
  word: letter,
  description: `Practice the ASL sign for letter "${letter}"`,
  lessonTitle: "ASL Alphabet (A–Z)",
}));


  /* ───────────── Load ML Model ───────────── */
  useEffect(() => {
    const initModel = async () => {
      try {
        await mlModelService.loadModel();
        setModelReady(true);
      } catch (err) {
        console.error("ML model load error:", err);
        notification.error("Failed to load ML model");
      }
    };

    initModel();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ───────────── Camera Handling ───────────── */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setStream(mediaStream);

      if (!videoRef.current) {
        console.error("❌ videoRef still null");
        return;
      }

      console.log("✅ Attaching stream");
      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      await videoRef.current.play();
      console.log("🎥 Video is playing");
    } catch (error) {
      console.error("❌ Camera error:", error);
      notification.error("Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRecording(false);
  };

  /* ───────────── ML Practice Logic ───────────── */
  const handleStartPractice = async () => {
    if (!modelReady) {
      notification.error("Model not ready yet");
      return;
    }

    if (!selectedSign) {
      notification.error("Select a sign first");
      return;
    }

    if (!stream) {
      await startCamera();
    }

    setIsRecording(true);
    setFeedback(null);
    setScore(null);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const result = await mlModelService.predictFromVideo(videoRef.current);
      if (!result) return;

      const detected = result.label;
      const confidence = result.confidence;

      const accuracy = Math.round(confidence * 100);
      setScore(accuracy);

      const target = selectedSign.word.toUpperCase();

      if (detected === target && confidence >= 0.8) {
        setFeedback({
          type: "success",
          message: "Great job! Your sign is accurate!",
          suggestions: ["Nice hand shape", "Good positioning"],
        });

        setPracticeHistory((prev) => [
          {
            sign: target,
            score: accuracy,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 4),
        ]);

        updateProgress({ todayProgress: 1 });

        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRecording(false);
      } else if (confidence < 0.5) {
        setFeedback({
          type: "warning",
          message: "Keep your hand inside the frame",
          suggestions: ["Move closer to camera", "Hold steady"],
        });
      } else {
        setFeedback({
          type: "warning",
          message: `That looks like "${detected}". Try again.`,
          suggestions: ["Adjust finger positions", "Match tutorial shape"],
        });
      }
    }, 1000);
  };

  const handleReset = () => {
    setSelectedSign(null);
    setFeedback(null);
    setScore(null);
    setShowInstructions(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRecording(false);
  };

  /* ───────────── UI ───────────── */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Practice with Camera
        </h1>
        <p className="text-gray-600">
          Use AI-powered feedback to perfect your signs in real-time
        </p>
        <p className="text-sm mt-2">
          Model status: {modelReady ? "✅ Ready" : "⏳ Loading ML model..."}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Camera View */}
        <div className="lg:col-span-2">
          <Card padding="large">
            <div className="bg-gray-900 rounded-xl aspect-video mb-6 relative overflow-hidden">
              {/* 🎥 VIDEO ALWAYS MOUNTED */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transform scale-x-[-1] ${
                  stream ? "block" : "hidden"
                }`}
                muted
                playsInline
              />

              {/* Overlay when camera is off */}
              {!stream && (
                <div className="flex items-center justify-center h-full text-white absolute inset-0">
                  <div className="text-center">
                    <IoCamera className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-4">Camera is off</p>
                    <Button onClick={startCamera} variant="primary">
                      <IoVideocam className="mr-2" />
                      Turn On Camera
                    </Button>
                  </div>
                </div>
              )}

              {score !== null && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                  Accuracy: {score}%
                </div>
              )}
            </div>

            {selectedSign && (
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  Practicing: {selectedSign.word}
                </h2>
                <p className="text-gray-600">{selectedSign.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                onClick={handleStartPractice}
                disabled={!selectedSign || isRecording || !modelReady}
                size="large"
                fullWidth
              >
                <IoCamera className="mr-2" />
                {isRecording ? "Analyzing..." : "Start Practice"}
              </Button>

              <Button onClick={stopCamera} variant="danger" size="large">
                <IoVideocamOff className="mr-2" />
                Stop
              </Button>
            </div>

            {feedback && (
              <Card
                padding="medium"
                className={`mt-6 ${
                  feedback.type === "success"
                    ? "bg-success-50 border-2 border-success-200"
                    : "bg-warning-50 border-2 border-warning-200"
                }`}
              >
                <h3 className="font-semibold mb-2">{feedback.message}</h3>
                <ul className="text-sm space-y-1">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>

                <Button
                  onClick={handleStartPractice}
                  variant="outline"
                  size="small"
                  className="mt-4"
                >
                  <IoRefresh className="mr-2" />
                  Try Again
                </Button>
              </Card>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card padding="medium">
            <h3 className="font-semibold mb-4">Select a Sign</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allSigns.map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => {
                    setSelectedSign(sign);
                    setFeedback(null);
                    setScore(null);
                    setShowInstructions(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedSign?.id === sign.id
                      ? "bg-primary-100 border-2 border-primary-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="font-medium">{sign.word}</div>
                  <div className="text-xs text-gray-600">
                    ASL Alphabet (A–Z)
                  </div>

                </button>
              ))}
            </div>
          </Card>

          {practiceHistory.length > 0 && (
            <Card padding="medium">
              <h3 className="font-semibold mb-4 flex items-center">
                <IoTrophy className="mr-2 text-warning-500" />
                Recent Practice
              </h3>

              {practiceHistory.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span>{item.sign}</span>
                  <span>{item.score}%</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
