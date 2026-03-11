import { useState, useRef, useCallback } from "react";

const SAMPLE_SENTENCES = [
  "I spent twenty years as a dementia carer, and I built this platform because nothing else existed.",
  "Memory Mirror is a care platform designed for people living with dementia and the families who love them.",
  "Six AI companions, hands-free voice, and twelve features — all in one place at memory-mirror.app.",
  "This was built by a carer, for carers. From Melton, Victoria, reaching families in twenty-eight countries.",
  "Try it free today — no credit card, no commitment. Just go to memory-mirror.app.",
];

const MARKETING_SCRIPTS = [
  {
    label: "60-Second Ad",
    text: `Twenty years ago, I became a carer for someone I loved who had dementia. And I discovered something every carer discovers — there is almost nothing out there to help you. So I built it myself. MM AI is a unified care platform with six AI companions, hands-free voice, a shower guide, phone contacts, photo albums, and so much more. It's reached carers in twenty-eight countries — with zero advertising. Just carers finding it and sharing it with other carers. Because when something genuinely helps, people tell the people they love. Try it free today at memory-mirror.app.`,
  },
  {
    label: "30-Second Ad",
    text: `If you care for someone with dementia, I built this for you. MM AI gives your loved one a warm AI companion — always available, always patient, never tired. Hands-free voice. Step-by-step shower guide. Family phone contacts. All at memory-mirror.app. Free to try. No credit card needed.`,
  },
  {
    label: "15-Second Reel",
    text: `Twenty years as a dementia carer. Zero tech background. One burning question — why is there nothing to help us? So I built it. MM AI. Free to try at memory-mirror.app.`,
  },
  {
    label: "Custom Script",
    text: "",
  },
];

export default function VoiceOverStudio() {
  const [screen, setScreen] = useState("home");
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [currentSample, setCurrentSample] = useState(0);
  const [recordings, setRecordings] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [existingVoices, setExistingVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [cloningStatus, setCloningStatus] = useState("");
  const [cloningLoading, setCloningLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState(0);
  const [customScript, setCustomScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const handleSetApiKey = async () => {
    setApiKeyError("");
    if (!apiKey.trim()) { setApiKeyError("Please enter your API key."); return; }
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": apiKey.trim() }
      });
      if (!res.ok) { setApiKeyError("Invalid API key — please check and try again."); return; }
      const data = await res.json();
      const cloned = data.voices?.filter(v => v.category === "cloned") || [];
      setExistingVoices(data.voices || []);
      if (cloned.length > 0) {
        setClonedVoiceId(cloned[0].voice_id);
        setSelectedVoiceId(cloned[0].voice_id);
      }
      setApiKeySet(true);
    } catch {
      setApiKeyError("Could not connect to ElevenLabs. Check your internet and try again.");
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordings(r => ({ ...r, [currentSample]: blob }));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert("Microphone access denied. Please allow mic access and try again.");
    }
  }, [currentSample]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const allRecorded = SAMPLE_SENTENCES.every((_, i) => recordings[i]);

  const cloneVoice = async () => {
    setCloningLoading(true);
    setCloningStatus("Uploading your voice samples to ElevenLabs...");
    try {
      const formData = new FormData();
      formData.append("name", "Michael McNamara — MM AI");
      formData.append("description", "Voice of Michael McNamara, founder of MM AI Technologies");
      Object.values(recordings).forEach((blob, i) => {
        formData.append("files", blob, `sample_${i}.webm`);
      });
      const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: { "xi-api-key": apiKey },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setCloningStatus(`Error: ${err.detail?.message || "Could not clone voice. Try again."}`);
        setCloningLoading(false);
        return;
      }
      const data = await res.json();
      setClonedVoiceId(data.voice_id);
      setSelectedVoiceId(data.voice_id);
      setCloningStatus("✅ Your voice has been cloned! Ready to generate voiceovers.");
      setCloningLoading(false);
      setScreen("generate");
    } catch {
      setCloningStatus("Something went wrong. Check your internet and try again.");
      setCloningLoading(false);
    }
  };

  const generateVoiceover = async () => {
    const script = selectedScript === 3 ? customScript : MARKETING_SCRIPTS[selectedScript].text;
    if (!script.trim()) { setGenerateError("Please enter or select a script."); return; }
    if (!selectedVoiceId) { setGenerateError("No voice selected. Please clone your voice first."); return; }
    setGenerating(true);
    setGenerateError("");
    setAudioUrl("");
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setGenerateError(err.detail?.message || "Could not generate audio. You may have hit your monthly limit.");
        setGenerating(false);
        return;
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setScreen("result");
    } catch {
      setGenerateError("Something went wrong. Check your internet and try again.");
    }
    setGenerating(false);
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const S = {
    app:    { minHeight: "100vh", background: "#060d1a", fontFamily: "Georgia, serif", color: "#fff" },
    header: { background: "linear-gradient(135deg,#1B5E20,#0a3d0a)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #2E7D3244" },
    card:   { background: "#0f1e35", border: "1px solid #1e3050", borderRadius: 20, padding: "20px 22px", marginBottom: 16 },
    btn:    (color="#1B5E20", light=false) => ({ background: light ? "none" : `linear-gradient(135deg,${color},${color}cc)`, border: `2px solid ${color}`, borderRadius: 14, padding: "13px 28px", color: "#fff", cursor: "pointer", fontSize: 15, fontFamily: "Georgia,serif", fontWeight: 700, transition: "all 0.2s" }),
    input:  { width: "100%", background: "#080f1e", border: "1px solid #1e3050", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" },
    label:  { color: "#74C69D", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" },
    error:  { color: "#ef5350", fontSize: 13, marginTop: 8 },
  };

  if (screen === "home") return (
    <div style={S.app}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={S.header}>
        <div style={{ fontSize: 28 }}>🎙️</div>
        <div>
          <div style={{ fontFamily: "'Arial',sans-serif", fontSize: 20, fontWeight: 900, color: "#fff" }}>VoiceOver Studio</div>
          <div style={{ color: "#74C69D", fontSize: 12 }}>Powered by ElevenLabs • Your voice • Free tier</div>
        </div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ ...S.card, animation: "fadeUp 0.3s ease both" }}>
          <div style={{ color: "#74C69D", fontSize: 13, fontWeight: 700, marginBottom: 14, fontFamily: "Arial,sans-serif" }}>HOW IT WORKS</div>
          {[["1️⃣","Enter your ElevenLabs API key"],["2️⃣","Record 5 short sentences in your voice"],["3️⃣","Your voice gets cloned on ElevenLabs"],["4️⃣","Pick a script or write your own"],["5️⃣","Download MP3 — drop it into your video"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ color: "#ccc", fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, animation: "fadeUp 0.3s ease 0.1s both" }}>
          <span style={S.label}>Your ElevenLabs API Key</span>
          <p style={{ color: "#667", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
            Find it at: <span style={{ color: "#74C69D" }}>elevenlabs.io → Profile → API Key</span>
          </p>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSetApiKey()} placeholder="xi-..." style={S.input} />
          {apiKeyError && <div style={S.error}>{apiKeyError}</div>}
          <button onClick={handleSetApiKey} style={{ ...S.btn(), marginTop: 14, width: "100%" }}>Connect to ElevenLabs →</button>
        </div>
        {apiKeySet && existingVoices.filter(v => v.category === "cloned").length > 0 && (
          <div style={{ ...S.card, border: "1px solid #2E7D3244", animation: "fadeUp 0.3s ease both" }}>
            <div style={{ color: "#74C69D", fontSize: 13, fontWeight: 700, marginBottom: 12, fontFamily: "Arial,sans-serif" }}>
              ✅ CONNECTED — {existingVoices.filter(v => v.category === "cloned").length} cloned voice{existingVoices.filter(v => v.category === "cloned").length !== 1 ? "s" : ""} found
            </div>
            <p style={{ color: "#889", fontSize: 13, marginBottom: 12 }}>You already have a cloned voice — skip straight to generating:</p>
            <select value={selectedVoiceId} onChange={e => setSelectedVoiceId(e.target.value)} style={{ ...S.input, marginBottom: 12 }}>
              {existingVoices.filter(v => v.category === "cloned").map(v => (
                <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
              ))}
            </select>
            <button onClick={() => setScreen("generate")} style={{ ...S.btn(), width: "100%" }}>🎬 Use This Voice → Generate</button>
            <div style={{ textAlign: "center", margin: "10px 0", color: "#556", fontSize: 12 }}>— or —</div>
            <button onClick={() => setScreen("record")} style={{ ...S.btn("#1A5276", true), width: "100%" }}>🎙️ Record a New Voice Clone</button>
          </div>
        )}
        {apiKeySet && existingVoices.filter(v => v.category === "cloned").length === 0 && (
          <div style={{ ...S.card, animation: "fadeUp 0.3s ease both" }}>
            <div style={{ color: "#74C69D", fontSize: 13, marginBottom: 10 }}>✅ Connected! No cloned voices yet — let's record yours.</div>
            <button onClick={() => setScreen("record")} style={{ ...S.btn(), width: "100%" }}>🎙️ Record Your Voice →</button>
          </div>
        )}
      </div>
    </div>
  );

  if (screen === "record") return (
    <div style={S.app}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}} @keyframes ripple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}`}</style>
      <div style={S.header}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontFamily: "Arial,sans-serif", fontSize: 18, fontWeight: 900 }}>Record Your Voice</div>
          <div style={{ color: "#74C69D", fontSize: 12 }}>Sample {currentSample + 1} of {SAMPLE_SENTENCES.length}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {SAMPLE_SENTENCES.map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: recordings[i] ? "#74C69D" : i === currentSample ? "#fff" : "#1e3050", border: "1px solid #74C69D44" }} />
          ))}
        </div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ background: "#0f1e35", borderRadius: 12, height: 6, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#1B5E20,#74C69D)", width: `${(Object.keys(recordings).length / SAMPLE_SENTENCES.length) * 100}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ ...S.card, border: "2px solid #1B5E2044", textAlign: "center" }}>
          <div style={{ color: "#74C69D", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Read this sentence clearly and naturally:</div>
          <p style={{ color: "#fff", fontSize: 18, lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>\