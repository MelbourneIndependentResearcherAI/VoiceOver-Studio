import { useState, useRef, useCallback, useEffect } from "react";

// ─── Companion definitions ────────────────────────────────────────────────────

const COMPANIONS = [
  {
    id: "margaret",
    name: "Margaret",
    emoji: "👵",
    role: "Caring Companion",
    accentColor: "#7B3F9E",
    description:
      "Warm, gentle and full of kindness. Margaret loves a good cup of tea and cherishes family stories.",
    greeting:
      "Hello dear, it's so lovely to chat with you today. How are you feeling?",
  },
  {
    id: "james",
    name: "James",
    emoji: "👨‍⚕️",
    role: "Trusted Friend",
    accentColor: "#1B5E20",
    description:
      "Calm and reassuring, James is a great listener who always knows the right thing to say.",
    greeting:
      "Good to see you! I've been thinking about you. What would you like to talk about today?",
  },
  {
    id: "grace",
    name: "Grace",
    emoji: "🌸",
    role: "Garden Friend",
    accentColor: "#C2185B",
    description:
      "Grace finds joy in nature's beauty and loves sharing memories of gardens and seasons.",
    greeting:
      "Oh, what a beautiful day! I was just thinking about the garden. Shall we have a chat?",
  },
  {
    id: "henry",
    name: "Henry",
    emoji: "📚",
    role: "Storyteller",
    accentColor: "#1565C0",
    description:
      "Henry is full of wonderful stories and loves exploring memories and history together.",
    greeting:
      "Ah, there you are! I was hoping we'd have a chance to talk. What stories shall we share today?",
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🎵",
    role: "Music Lover",
    accentColor: "#E65100",
    description:
      "Rose's warm laugh and love of music makes every conversation feel like a joyful melody.",
    greeting:
      "Hello sunshine! How has your day been? I'd love to hear all about it.",
  },
  {
    id: "arthur",
    name: "Arthur",
    emoji: "👨‍🍳",
    role: "Kitchen Friend",
    accentColor: "#4E342E",
    description:
      "Arthur's warmth and wonderful kitchen tales can make anyone feel right at home.",
    greeting:
      "Come in, come in! I've been reminiscing about wonderful recipes. How are you today?",
  },
];

// ─── Response pools (never echo user input) ──────────────────────────────────

const RESPONSE_POOLS = {
  margaret: {
    feel: [
      "I hear you, and your feelings matter so much. Would you like to tell me a little more about what's on your mind?",
      "Thank you for sharing that with me, dear. It takes courage to open up. I'm right here listening.",
      "I understand — some days are harder than others. You're not alone in this, I promise.",
    ],
    family: [
      "Family is such a treasure, isn't it? Those shared moments stay with us forever.",
      "How lovely to think about family. What is one of your favourite memories together?",
      "Family means everything. Tell me more — I'd love to hear about them.",
    ],
    food: [
      "A warm cup of tea and a biscuit fixes so many things! What's your favourite treat?",
      "There's nothing quite like a home-cooked meal to bring comfort and warmth.",
      "Oh, I do love a good kitchen story. What was your favourite meal growing up?",
    ],
    music: [
      "Music has such a wonderful way of bringing back the most beautiful memories.",
      "A good song can change everything about a day, don't you think? Do you have a favourite?",
    ],
    garden: [
      "Gardens are such peaceful places. Is there a particular flower or plant that you love?",
      "There's nothing more calming than time in a garden. What does yours look like?",
    ],
    memory: [
      "How special to hold onto those memories. Would you like to share one with me?",
      "Those times we look back on are precious gifts. What comes to mind?",
    ],
    weather: [
      "Isn't it wonderful how the weather can set the mood for the whole day?",
      "A lovely sunny day always lifts the spirits, doesn't it? Or do you prefer the cosiness of rain?",
    ],
    greeting: [
      "Oh, hello dear! How wonderful to see you. How has your day been treating you?",
      "Hello! I'm so glad you're here. What shall we chat about today?",
    ],
    default: [
      "That's so interesting! Tell me more — I'm all ears.",
      "How wonderful. What else has been on your mind lately?",
      "I love hearing about your experiences. What happened next?",
      "Thank you for sharing that. Is there more you'd like to talk about?",
    ],
  },
  james: {
    feel: [
      "I'm glad you told me. It's important to acknowledge how we feel. What do you think is at the root of it?",
      "That's completely understandable. Sometimes just putting it into words helps. I'm here.",
      "You're doing well to reflect on that. Take your time — there's no rush.",
    ],
    family: [
      "Family connections are so important for wellbeing. What's a happy family moment you treasure?",
      "It sounds like family means a lot to you. How are they all getting on?",
    ],
    food: [
      "Good nutrition and shared meals are wonderful for the spirit! What do you enjoy cooking?",
      "A good meal shared with good company — is there anything better?",
    ],
    music: [
      "Music is remarkable medicine for the soul. What kind do you enjoy?",
      "There's real science behind how music lifts the mood. Do you have a favourite era of music?",
    ],
    garden: [
      "Being in nature does wonders for our wellbeing. Do you spend much time outdoors?",
      "Fresh air and greenery — there's nothing like it. What's your favourite outdoor spot?",
    ],
    memory: [
      "Our memories shape who we are. It's beautiful to revisit them. What's one you hold dear?",
      "Reflecting on the past can be both comforting and joyful. What comes to mind?",
    ],
    weather: [
      "The weather does have such an effect on our mood and energy, doesn't it?",
      "A good day outside can do wonders. How has the weather been with you lately?",
    ],
    greeting: [
      "Hello! Great to connect with you. How are you feeling today?",
      "Good to see you! What's been happening in your world?",
    ],
    default: [
      "That's worth thinking about. What do you make of it?",
      "How interesting — can you tell me a bit more?",
      "I find that fascinating. What's your perspective on it?",
    ],
  },
  grace: {
    feel: [
      "Oh, I always say a little time in the garden helps clear the mind! How are you really doing?",
      "Your feelings are like seasons — sometimes bright, sometimes grey, but always valid.",
      "I'm here and I care. Nature teaches us that after every winter comes spring.",
    ],
    family: [
      "Family is like a garden — it needs tending, but the blooms are worth everything!",
      "How lovely. Family roots run so deep, don't they? What's a favourite memory?",
    ],
    food: [
      "Have you ever grown your own vegetables? There's nothing tastier than home-grown tomatoes!",
      "A garden with herbs is such a joy — do you have any favourites?",
    ],
    music: [
      "I love humming along to something cheerful while I'm in the garden! Do you have a favourite tune?",
      "Birdsong is nature's music — have you heard any lovely birds lately?",
    ],
    garden: [
      "Oh, now you're speaking my language! What's your favourite flower or plant?",
      "Gardens have such personality. Mine is a bit wild but I love it that way! What about yours?",
    ],
    memory: [
      "Nature is so full of beautiful memories, isn't it? What's a favourite outdoor memory for you?",
      "I always feel close to the past when I'm in the garden. What memories does nature bring up for you?",
    ],
    weather: [
      "Every kind of weather has its charm! I love a warm sunny day for gardening, personally.",
      "Rain is wonderful for the garden! Do you ever enjoy walking in light rain?",
    ],
    greeting: [
      "Hello! What a wonderful surprise — I was just admiring the flowers! How are you?",
      "Oh, how lovely to chat! The day is all the brighter for it.",
    ],
    default: [
      "How delightful! Tell me more — I love a good story.",
      "That sounds wonderful. What else has been brightening your day?",
      "How interesting! I'd love to hear more about that.",
    ],
  },
  henry: {
    feel: [
      "History teaches us that every difficult chapter leads to a new one. How are you holding up?",
      "Thank you for telling me. A good listener is sometimes all we need. I'm here.",
      "Every great story has its challenging moments. Yours is no different. What's weighing on you?",
    ],
    family: [
      "Family history is the richest kind! Are there any stories passed down through the generations?",
      "Our families are our greatest legacy. What's a tale from your family you love to share?",
    ],
    food: [
      "The history of food is fascinating! Every recipe has a story. Do you have a favourite dish with a history?",
      "Sharing a meal together is one of humanity's oldest traditions. What's a memorable meal for you?",
    ],
    music: [
      "Music marks the moments of history — what era's music speaks to you?",
      "Every generation has its soundtrack. What music reminds you of younger days?",
    ],
    garden: [
      "Gardens have been at the heart of civilisation for millennia! Do you enjoy spending time outdoors?",
      "Some of history's greatest thinkers did their best work in gardens. I find that rather lovely.",
    ],
    memory: [
      "Ah, memories are history's greatest treasure. Which one shall we explore today?",
      "The past has so much to teach us. What memory would you like to revisit?",
    ],
    weather: [
      "The weather has shaped so much of human history! What's the weather like with you today?",
      "There's something timeless about the weather — it unites us across the centuries.",
    ],
    greeting: [
      "Ah, wonderful to see you! Pull up a chair — I have a feeling we'll have a good conversation today.",
      "Hello! I've been looking forward to a good chat. What shall we explore?",
    ],
    default: [
      "Fascinating — I'd love to explore that further. Tell me more.",
      "Now that's an interesting topic. What do you think about it?",
      "How curious! There's always a story behind everything. What's the story here?",
    ],
  },
  rose: {
    feel: [
      "Music always knows what words can't say. How are you feeling today, really?",
      "I hear you, and I'm right here. Sometimes the heart just needs to be heard.",
      "Every feeling is valid — like every note in a song. Tell me what's going on.",
    ],
    family: [
      "Family is the best kind of harmony! Are there songs that remind you of family times?",
      "The people we love leave melodies in our hearts forever. Who's in your heart today?",
    ],
    food: [
      "Some meals are like perfect songs — every bite is just right! What's your comfort food?",
      "Good food and good music go together beautifully. What do you love to eat?",
    ],
    music: [
      "Oh, music — my greatest love! What song would you want to hear right now?",
      "Is there a song that always takes you back to a special moment? I'd love to hear about it.",
      "Music is the language of the soul. What kind of music moves you?",
    ],
    garden: [
      "I think flowers and music are both nature's way of spreading joy! Do you have a favourite flower?",
      "A garden in bloom is almost like a symphony. Do you enjoy being in the garden?",
    ],
    memory: [
      "Music is the greatest time machine — one song and we're right back there. What song takes you back?",
      "Memories set to music never fade. What's a memory you hold close to your heart?",
    ],
    weather: [
      "Every kind of weather has its own soundtrack! What does today's weather feel like?",
      "Rainy days call for cosy music. What would you listen to on a grey day?",
    ],
    greeting: [
      "Hello sunshine! You've made my day brighter just by being here. How are you?",
      "Oh, what a treat! Hello! What shall we talk about today?",
    ],
    default: [
      "Oh, how lovely! Tell me more — I could listen to you all day.",
      "That's music to my ears! What else is on your mind?",
      "How delightful. I love chatting with you. What else has been in your heart?",
    ],
  },
  arthur: {
    feel: [
      "In my kitchen, the cure for everything starts with a warm meal and good company. How are you?",
      "I hear you. Life isn't always simple, but we face it better together. What's going on?",
      "You remind me of my best customers — honest and open. I'm all ears.",
    ],
    family: [
      "Family recipes are the best kind! Is there a dish that reminds you of family?",
      "The kitchen is where family memories are made. What's a favourite family meal?",
    ],
    food: [
      "Now we're talking! What's your absolute favourite meal — the one you could eat every day?",
      "Food is love, that's what I always say. What's a dish that really brings you comfort?",
      "I always say you can tell everything about a person from what they love to eat! What's yours?",
    ],
    music: [
      "In my kitchen, there was always music! What was playing in your home growing up?",
      "Good music and good food — the perfect recipe for happiness! What do you enjoy?",
    ],
    garden: [
      "Fresh herbs from the garden make everything taste better! Do you enjoy growing things?",
      "There's nothing better than cooking with something you've grown yourself. Do you garden?",
    ],
    memory: [
      "Food memories are the strongest kind, I find. What taste or smell takes you right back?",
      "The smell of something baking can take you back decades in an instant. What's a food memory you love?",
    ],
    weather: [
      "On a cold day, there's nothing like something warm from the kitchen. What's your comfort food?",
      "Lovely weather calls for a celebration meal! What would be on your perfect menu?",
    ],
    greeting: [
      "Come in! I was just thinking about you. How has your day been?",
      "Well, hello there! Perfect timing — the kitchen is warm. How are you doing today?",
    ],
    default: [
      "That's a wonderful thing to share! Tell me more — I love a good story.",
      "Interesting! You know, that reminds me of something. Go on, tell me more.",
      "How wonderful! What else has been on your mind? I'm all ears.",
    ],
  },
};

// ─── Response builder — NEVER echoes the user's own words back ───────────────

function buildResponse(companion, userMessage, history) {
  const m = userMessage.toLowerCase();

  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|how are you|howdy)\b/.test(m);
  const isFeel = /\b(feel|feeling|tired|sad|happy|loneli|anxious|worried|good|bad|fine|not great|ok\b|down|upset|bored|depressed)\b/.test(m);
  const isFamily = /\b(famil|child|grandchild|son|daughter|wife|husband|mother|father|parent|brother|sister|grandkids)\b/.test(m);
  const isFood = /\b(food|eat|dinner|lunch|breakfast|cook|meal|recipe|hungry|drink|tea|coffee|biscuit)\b/.test(m);
  const isMusic = /\b(music|song|sing|danc|tune|melod|radio|listen|album|band)\b/.test(m);
  const isGarden = /\b(garden|flower|plant|tree|nature|bird|outside|fresh air|grow|yard)\b/.test(m);
  const isMemory = /\b(remember|memor|past|ago|used to|when i was|back then|years ago|childhood)\b/.test(m);
  const isWeather = /\b(weather|rain|sun|warm|cold|hot|outside|wind|forecast|temperature)\b/.test(m);

  const pool = RESPONSE_POOLS[companion.id] || RESPONSE_POOLS.margaret;

  let category = "default";
  if (isGreeting) category = "greeting";
  else if (isFeel) category = "feel";
  else if (isFamily) category = "family";
  else if (isFood) category = "food";
  else if (isMusic) category = "music";
  else if (isGarden) category = "garden";
  else if (isMemory) category = "memory";
  else if (isWeather) category = "weather";

  const options = pool[category] || pool.default;

  // Avoid repeating the immediately preceding companion response
  const lastCompanionText = [...history].reverse().find(msg => msg.role === "companion")?.text || "";
  const filtered = options.filter(r => r !== lastCompanionText);
  const candidates = filtered.length > 0 ? filtered : options;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemoryMirrorCompanion({ apiKey, voices, onBack }) {
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  // Map companion id → ElevenLabs voice_id chosen by the user
  const [companionVoiceMap, setCompanionVoiceMap] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // isSpeaking=true while ElevenLabs audio is playing — blocks new input to break the loop
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const [showVoiceSetup, setShowVoiceSetup] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const messagesRef = useRef(messages);

  // Keep ref in sync so callbacks always see fresh messages
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── ElevenLabs TTS ──────────────────────────────────────────────────────────
  const speakText = useCallback(async (text, companion) => {
    const voiceId = companionVoiceMap[companion.id] || voices[0]?.voice_id;
    if (!apiKey || !voiceId) return;

    setIsSpeaking(true);
    setTtsError("");

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.85,
              style: 0.15,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setTtsError(
          err.detail?.message ||
            "Could not generate voice. Check your API key and voice assignment."
        );
        setIsSpeaking(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.play().catch(() => setIsSpeaking(false));
      }
    } catch {
      setTtsError("Something went wrong with voice generation. Please try again.");
      setIsSpeaking(false);
    }
  }, [apiKey, voices, companionVoiceMap]);

  // ── Stop speaking ───────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  // ── Select companion ────────────────────────────────────────────────────────
  const selectCompanion = useCallback((companion) => {
    setSelectedCompanion(companion);
    const greeting = { role: "companion", text: companion.greeting, id: Date.now() };
    setMessages([greeting]);
    setTtsError("");
    // Speak the greeting after a short delay to let the UI settle
    setTimeout(() => speakText(companion.greeting, companion), 300);
  }, [speakText]);

  // ── Send message (the fixed loop-safe path) ─────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || isSpeaking) return;

    const userMsg = { role: "user", text: trimmed, id: Date.now() };
    const updated = [...messagesRef.current, userMsg];
    setMessages(updated);
    setInput("");

    // Build a reply that is NEVER a copy of what the user just said
    const reply = buildResponse(selectedCompanion, trimmed, updated);
    const companionMsg = { role: "companion", text: reply, id: Date.now() + 1 };
    setMessages(prev => [...prev, companionMsg]);

    // Speak the reply — isSpeaking=true blocks further input until audio ends
    await speakText(reply, selectedCompanion);
  }, [isSpeaking, selectedCompanion, speakText]);

  // ── Web Speech API (mic input) ───────────────────────────────────────────────
  const startListening = useCallback(() => {
    // Critical loop fix: never start listening while the companion is speaking
    if (isSpeaking) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-AU";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript || "";
      if (transcript.trim()) sendMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeaking, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    app:    { minHeight: "100vh", background: "#060d1a", fontFamily: "Georgia, serif", color: "#fff" },
    header: { background: "linear-gradient(135deg,#1B5E20,#0a3d0a)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #2E7D3244" },
    card:   { background: "#0f1e35", border: "1px solid #1e3050", borderRadius: 20, padding: "20px 22px", marginBottom: 16 },
    btn:    (color = "#1B5E20", light = false) => ({ background: light ? "none" : `linear-gradient(135deg,${color},${color}cc)`, border: `2px solid ${color}`, borderRadius: 14, padding: "13px 28px", color: "#fff", cursor: "pointer", fontSize: 15, fontFamily: "Georgia,serif", fontWeight: 700, transition: "all 0.2s" }),
    input:  { width: "100%", background: "#080f1e", border: "1px solid #1e3050", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" },
    label:  { color: "#74C69D", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" },
    error:  { color: "#ef5350", fontSize: 13, marginTop: 8 },
  };

  // ─── Voice assignment setup screen ──────────────────────────────────────────
  if (showVoiceSetup) return (
    <div style={S.app}>
      <div style={S.header}>
        <button onClick={() => setShowVoiceSetup(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontFamily: "Arial,sans-serif", fontSize: 18, fontWeight: 900 }}>Assign Voices</div>
          <div style={{ color: "#74C69D", fontSize: 12 }}>Link an ElevenLabs voice to each companion</div>
        </div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
        {voices.length === 0 && (
          <div style={{ ...S.card, color: "#aaa", fontSize: 14 }}>
            No voices found in your ElevenLabs account. Add voices at elevenlabs.io and reconnect.
          </div>
        )}
        {COMPANIONS.map(c => (
          <div key={c.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 32 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.name}</div>
              <select
                value={companionVoiceMap[c.id] || ""}
                onChange={e => setCompanionVoiceMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                style={{ ...S.input, padding: "8px 12px", fontSize: 13 }}
              >
                <option value="">— pick a voice —</option>
                {voices.map(v => (
                  <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button onClick={() => setShowVoiceSetup(false)} style={{ ...S.btn(), width: "100%", marginTop: 8 }}>
          ✅ Save & Back to Companions
        </button>
      </div>
    </div>
  );

  // ─── Companion selection screen ──────────────────────────────────────────────
  if (!selectedCompanion) return (
    <div style={S.app}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={S.header}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
        <div>
          <div style={{ fontFamily: "Arial,sans-serif", fontSize: 18, fontWeight: 900 }}>Memory Mirror</div>
          <div style={{ color: "#74C69D", fontSize: 12 }}>AI Companions • Powered by ElevenLabs</div>
        </div>
        <button
          onClick={() => setShowVoiceSetup(true)}
          style={{ marginLeft: "auto", background: "none", border: "1px solid #74C69D44", borderRadius: 10, color: "#74C69D", padding: "6px 14px", cursor: "pointer", fontSize: 12 }}
        >
          🎙️ Voices
        </button>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
        <p style={{ color: "#889", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Choose a companion to chat with. Each has their own personality and speaks in their own ElevenLabs voice.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {COMPANIONS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => selectCompanion(c)}
              style={{
                background: "#0f1e35",
                border: `2px solid ${c.accentColor}44`,
                borderRadius: 20,
                padding: "18px 14px",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                transition: "border-color 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = c.accentColor)}
              onMouseOut={e => (e.currentTarget.style.borderColor = `${c.accentColor}44`)}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: c.accentColor, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{c.role}</div>
              <div style={{ color: "#889", fontSize: 12, lineHeight: 1.5 }}>{c.description}</div>
              {companionVoiceMap[c.id] && (
                <div style={{ color: "#74C69D", fontSize: 11, marginTop: 8 }}>
                  🎙️ {voices.find(v => v.voice_id === companionVoiceMap[c.id])?.name || "Voice assigned"}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Chat screen ─────────────────────────────────────────────────────────────
  const c = selectedCompanion;
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column" }}>
      <audio ref={audioRef} style={{ display: "none" }} />
      <div style={S.header}>
        <button
          onClick={() => { stopSpeaking(); stopListening(); setSelectedCompanion(null); setMessages([]); }}
          style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}
        >
          ←
        </button>
        <div style={{ fontSize: 28 }}>{c.emoji}</div>
        <div>
          <div style={{ fontFamily: "Arial,sans-serif", fontSize: 18, fontWeight: 900 }}>{c.name}</div>
          <div style={{ color: c.accentColor, fontSize: 12 }}>{c.role}</div>
        </div>
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            style={{ marginLeft: "auto", background: "none", border: `1px solid ${c.accentColor}`, borderRadius: 10, color: c.accentColor, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 560, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 14,
            }}
          >
            {msg.role === "companion" && (
              <div style={{ fontSize: 22, marginRight: 10, alignSelf: "flex-end" }}>{c.emoji}</div>
            )}
            <div
              style={{
                maxWidth: "75%",
                background: msg.role === "user" ? `linear-gradient(135deg,${c.accentColor},${c.accentColor}cc)` : "#0f1e35",
                border: msg.role === "companion" ? `1px solid ${c.accentColor}44` : "none",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                padding: "13px 16px",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#fff",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isSpeaking && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 22 }}>{c.emoji}</div>
            <div style={{ background: "#0f1e35", border: `1px solid ${c.accentColor}44`, borderRadius: "20px 20px 20px 4px", padding: "13px 16px" }}>
              <span style={{ color: c.accentColor, animation: "pulse 1s infinite" }}>●●●</span>
            </div>
          </div>
        )}
        {ttsError && <div style={S.error}>{ttsError}</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: "#060d1a", borderTop: "1px solid #1e3050", padding: "14px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !isSpeaking && sendMessage(input)}
            placeholder={isSpeaking ? `${c.name} is speaking…` : "Type a message…"}
            disabled={isSpeaking}
            style={{ ...S.input, flex: 1, opacity: isSpeaking ? 0.5 : 1 }}
          />
          {hasSR && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              style={{
                background: isListening ? "#ef5350" : "#0f1e35",
                border: `2px solid ${isListening ? "#ef5350" : c.accentColor}`,
                borderRadius: 14,
                padding: "13px 16px",
                color: "#fff",
                cursor: isSpeaking ? "not-allowed" : "pointer",
                fontSize: 18,
                opacity: isSpeaking ? 0.4 : 1,
                transition: "all 0.2s",
              }}
              title={isListening ? "Stop listening" : "Speak"}
            >
              {isListening ? "🔴" : "🎤"}
            </button>
          )}
          <button
            onClick={() => sendMessage(input)}
            disabled={isSpeaking || !input.trim()}
            style={{
              ...S.btn(c.accentColor),
              padding: "13px 20px",
              opacity: isSpeaking || !input.trim() ? 0.4 : 1,
              cursor: isSpeaking || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
        {isListening && (
          <div style={{ textAlign: "center", color: "#ef5350", fontSize: 12, marginTop: 8 }}>
            🎤 Listening… speak now
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
