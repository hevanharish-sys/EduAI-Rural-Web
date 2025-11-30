import React, { useState, useRef } from "react";

// Language detection map
const LANG_MAP = {
  hi: "hi-IN",
  ta: "ta-IN",
  ml: "ml-IN",
  en: "en-US",
};

// Detect language by script pattern
function autoDetectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam
  return "en-US"; // Default English
}

// Fake AI reply generator (replace with your backend later)
async function getAIReply(question, lang) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const msgs = {
        "en-US": "Here is your answer explained clearly.",
        "hi-IN": "यह रहा आपका उत्तर, सरल तरीके से समझाया गया है।",
        "ta-IN": "இது உங்கள் கேள்விக்கு எளிய விளக்கம்.",
        "ml-IN": "ഇതാ നിങ്ങളുടെ ചോദ്യത്തിന് ഒരു സരളമായ വിശദീകരണം.",
      };
      resolve(msgs[lang] + " 😊");
    }, 800);
  });
}

export default function Tutor() {
  const [messages, setMessages] = useState([
    { role: "tutor", text: "Hi! I am your AI Voice Tutor. Ask me anything 🎤" },
  ]);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // -------- 🎤 Speech-to-Text (Voice Input) --------
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech Recognition not supported on this device.");
      return;
    }

    const recog = new SR();
    recog.lang = "en-US"; // initial, but auto-detect after
    recog.interimResults = false;

    recog.start();
    setListening(true);

    recog.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setInput(spoken);

      // Detect language of spoken input
      const detectedLang = autoDetectLanguage(spoken);
      setMessages((prev) => [
        ...prev,
        { role: "tutor", text: `🌐 Detected language: ${detectedLang}` },
      ]);

      recog.stop();
      setListening(false);
    };

    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
  };

  // -------- 🔊 Text-to-Speech (Voice Output) --------
  const speak = (text, lang) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.pitch = 1;
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  // -------- Send Question to AI --------
  const sendToTutor = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Auto language detection
    const lang = autoDetectLanguage(input);

    // Fake AI reply (replace with real API later)
    const reply = await getAIReply(input, lang);

    const tutorMsg = { role: "tutor", text: reply };
    setMessages((prev) => [...prev, tutorMsg]);

    // Speak AI reply in correct language
    speak(reply, lang);

    setInput("");
  };

  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-bold mb-4">Voice Tutor 🎤🔊</h1>

      {/* Chat box */}
      <div className="bg-white shadow p-4 rounded-xl h-[60vh] overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-lg ${
              m.role === "user"
                ? "bg-blue-100 ml-20 text-right"
                : "bg-gray-200 mr-20"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-xl bg-gray-100"
          placeholder="Speak or type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendToTutor}
          className="bg-blue-600 text-white px-4 rounded-xl"
        >
          Send
        </button>
      </div>

      {/* Floating Mic Button */}
      <button
        onClick={startListening}
        className={`fixed bottom-24 right-6 w-16 h-16 rounded-full flex items-center justify-center 
          text-white text-3xl shadow-xl transition-all duration-300 
          ${listening ? "bg-red-500" : "bg-green-600"} animate-bounce`}
      >
        🎤
      </button>
    </div>
  );
}




