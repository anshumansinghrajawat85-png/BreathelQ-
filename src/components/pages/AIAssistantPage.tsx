import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ObservationRecord } from '../../types';
import {
  sendChatMessage,
  synthesizeTTS,
  transcribeAudio,
  analyzeEnvironmentalImage,
} from '../../services/api';
import { AIChatLogo } from '../common/AIChatLogo';
import {
  Bot,
  Send,
  Volume2,
  Mic,
  MicOff,
  Image,
  Sparkles,
  Zap,
  Brain,
  Trash2,
  Loader2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface AIAssistantPageProps {
  city: string;
  latestObservation: ObservationRecord | null;
  theme?: 'dark' | 'light';
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  city,
  latestObservation,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello! I am the **AirPredict AI Assistant**, grounded directly in the live environmental monitoring data of **${city}**.

Current observations report an AQI of **${latestObservation?.aqi || 168}** (${latestObservation?.aqiCategory || 'Moderate'}) with PM2.5 at **${latestObservation?.pollutants.pm25 || 78} µg/m³**.

You can ask me to explain pollution trends, analyze forecast uncertainty, audit station anomalies, transcribe your speech, or speak responses aloud with TTS. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelMode, setModelMode] = useState<'fast' | 'general' | 'complex'>('general');
  const [enableThinking, setEnableThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStatus, setAudioStatus] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Send Prompt
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() && !imagePreview) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedImageUrl: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      if (imagePreview) {
        // Environmental Image Analysis with gemini-4-argon
        const base64Data = imagePreview.split(',')[1] || imagePreview;
        const res = await analyzeEnvironmentalImage(base64Data, 'image/jpeg', textToSend);
        setImagePreview(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: res.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: 'gemini-4-argon',
          },
        ]);
      } else {
        // Standard or High-Thinking grounded chat
        const historyPayload = messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

        const res = await sendChatMessage({
          message: textToSend,
          history: historyPayload,
          modelPreference: modelMode,
          city,
          enableThinking: modelMode === 'complex' || enableThinking,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: res.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: res.modelUsed || 'gemini-3.8-flash',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **System Communication Error**: ${err.message}. Showing local observation context: In ${city}, the current AQI is ${latestObservation?.aqi || 168} (${latestObservation?.aqiCategory || 'Moderate'}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'grounded-local-fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Text to Speech using gemini-3.8-flash-tts
  const handlePlayTTS = async (msgId: string, text: string) => {
    try {
      setPlayingAudioId(msgId);
      setAudioStatus('Synthesizing speech via gemini-3.8-flash-tts...');
      const cleanText = text.replace(/[*#_`]/g, '');
      const res = await synthesizeTTS(cleanText);

      if (res.audioBase64) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        audioPlayerRef.current.src = `data:audio/wav;base64,${res.audioBase64}`;
        audioPlayerRef.current.onended = () => {
          setPlayingAudioId(null);
          setAudioStatus(null);
        };
        audioPlayerRef.current.play();
        setAudioStatus('Playing audio...');
      }
    } catch (err: any) {
      console.error(err);
      setAudioStatus('TTS synthesis failed.');
      setTimeout(() => setAudioStatus(null), 3000);
      setPlayingAudioId(null);
    }
  };

  // Microphone Audio Recording for gemini-3.5-transcribe
  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setAudioStatus('Transcribing via gemini-3.5-transcribe...');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            try {
              const res = await transcribeAudio(base64Data, 'audio/webm');
              if (res.text) {
                setInputPrompt((prev) => (prev ? `${prev} ${res.text}` : res.text));
              }
              setAudioStatus('Transcription complete.');
              setTimeout(() => setAudioStatus(null), 2500);
            } catch (err: any) {
              setAudioStatus(`Transcription failed: ${err.message}`);
              setTimeout(() => setAudioStatus(null), 3000);
            }
          };
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAudioStatus('Listening to microphone...');
      } catch (err) {
        alert('Microphone access denied or unavailable in this environment.');
      }
    }
  };

  // Image File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] min-h-[580px] rounded-2xl border overflow-hidden shadow-2xl ${
      isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-[#0B1220] border-slate-800/80'
    }`}>
      {/* Top Assistant Header & Model Bar */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111C2E] border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3">
          <AIChatLogo size="md" isPulsing={true} theme={theme} />
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 font-extrabold">
                AirPredict MP AI Assistant
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-nums border ${
                isLight ? 'text-teal-800 bg-teal-50 border-teal-300' : 'text-teal-400 bg-teal-950/60 border border-teal-800/50'
              }`}>
                Grounded ({city})
              </span>
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>VAYU-AI Neural Engine • Real-time CPCB telemetry + Gemini intelligence</p>
          </div>
        </div>

        {/* Model Mode Selector (Zero-Pill Controls) */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl text-xs border ${
          isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => {
              setModelMode('fast');
              setEnableThinking(false);
            }}
            title="Fast low-latency inference (gemini-3.1-flash-lite)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelMode === 'fast'
                ? isLight
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                  : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Fast Lite</span>
          </button>

          <button
            onClick={() => {
              setModelMode('general');
              setEnableThinking(false);
            }}
            title="General reasoning & multimodal (gemini-3.8-flash)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelMode === 'general'
                ? isLight
                  ? 'bg-cyan-100 text-cyan-900 font-bold border border-cyan-300'
                  : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>General Flash</span>
          </button>

          <button
            onClick={() => {
              setModelMode('complex');
              setEnableThinking(true);
            }}
            title="Deep scientific thinking (gemini-4-argon with thinkingLevel: HIGH)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              modelMode === 'complex'
                ? isLight
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3 h-3 text-purple-500" />
            <span>Thinking Argon</span>
          </button>

          <button
            onClick={clearChat}
            title="Clear conversation"
            className={`p-1 ml-1 rounded cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompts Strip */}
      <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-[11px] ${
        isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0E1624] border-slate-800/60'
      }`}>
        <span className={`shrink-0 font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Try asking:</span>
        {[
          `Current AQI in ${city}`,
          'Compare Bhopal vs Indore vs Singrauli',
          'Rural air quality in Sanchi & Pachmarhi',
          'Why is Mandideep & Singrauli flagged as hotspots?',
          'Health advisory for sensitive groups in MP',
        ].map((promptText) => (
          <button
            key={promptText}
            onClick={() => handleSendMessage(promptText)}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:text-cyan-800 hover:border-cyan-400 shadow-xs'
                : 'bg-[#111C2E] border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Scroll Container */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${
        isLight ? 'bg-slate-50/40' : 'bg-[#0B1220]'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser
                    ? isLight
                      ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {isUser ? (
                  <span className="text-xs font-bold font-mono">U</span>
                ) : (
                  <AIChatLogo size="xs" theme={theme} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] md:max-w-2xl rounded-2xl p-4 text-xs leading-relaxed border ${
                  isUser
                    ? isLight
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-950 shadow-sm'
                      : 'bg-cyan-600/15 border-cyan-500/30 text-white'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    : 'bg-[#111C2E] border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                {msg.attachedImageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 max-w-xs">
                    <img src={msg.attachedImageUrl} alt="Uploaded environmental sample" className="w-full h-auto" />
                  </div>
                )}

                <div className="whitespace-pre-line space-y-2">{msg.text}</div>

                {/* Footer Controls for Message */}
                <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                  isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800/60 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2 font-mono-nums">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className={`font-mono ${isLight ? 'text-teal-700' : 'text-teal-400/80'}`}>[{msg.modelUsed}]</span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handlePlayTTS(msg.id, msg.text)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        playingAudioId === msg.id
                          ? 'text-cyan-500 font-bold'
                          : isLight
                          ? 'text-slate-500 hover:text-cyan-700'
                          : 'text-slate-400 hover:text-cyan-400'
                      }`}
                      title="Read aloud with Gemini 3.8 Flash TTS"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{playingAudioId === msg.id ? 'Playing...' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <AIChatLogo size="xs" isPulsing={true} theme={theme} />
            <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-600 shadow-sm' : 'bg-[#111C2E] border-slate-800 text-slate-400'
            }`}>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
              <span>Grounded environmental reasoning in progress...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Audio Status Banner if active */}
      {audioStatus && (
        <div className={`px-4 py-1.5 border-t text-[11px] flex items-center justify-between font-mono-nums ${
          isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-900' : 'bg-cyan-950/60 border-cyan-800/40 text-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>{audioStatus}</span>
          </div>
        </div>
      )}

      {/* Image Preview Banner if uploaded */}
      {imagePreview && (
        <div className={`p-3 border-t flex items-center justify-between text-xs ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0F172A] border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded object-cover border border-slate-400" />
            <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Environmental photo ready for Gemini 4 Argon analysis</span>
          </div>
          <button
            onClick={() => setImagePreview(null)}
            className={`p-1 text-sm ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Composer Dock */}
      <div className={`p-3.5 border-t ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#111C2E] border-slate-800/80'
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload environmental photo for inspection"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'text-slate-400 hover:text-white bg-slate-900 border-slate-700'
            }`}
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Microphone transcribe button using gemini-3.5-transcribe */}
          <button
            type="button"
            onClick={handleToggleRecording}
            title={isRecording ? 'Stop recording' : 'Speak via microphone (gemini-3.5-transcribe)'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isRecording
                ? 'bg-red-500/20 text-red-500 border-red-500/50'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Prompt Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask about ${city} air quality, forecast uncertainty, or station telemetry...`}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none border ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500'
                : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400'
            }`}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || (!inputPrompt.trim() && !imagePreview)}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
