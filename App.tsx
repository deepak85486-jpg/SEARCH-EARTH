
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { AppScreen, Language, Message, Subject } from './types';
import { SUBJECTS, EXAMS } from './constants';
import { geminiService } from './services/geminiService';

// --- HELPERS ---

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- COMPONENTS ---

const AIKeySelection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const handleOpenKey = async () => {
    try {
      if ((window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
        onComplete();
      } else {
        alert("Please ensure you are in the AI Studio environment.");
      }
    } catch (e) {
      console.error(e);
      onComplete(); // Proceed anyway as per instructions
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-10 text-center space-y-8 animate-in zoom-in">
      <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl">
        <i className="fa-solid fa-earth-asia"></i>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">SEARCH EARTH</h1>
        <p className="text-gray-500 font-medium">Connect your AI Studio Key to begin learning.</p>
      </div>
      <button 
        onClick={handleOpenKey}
        className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition active:scale-95"
      >
        <i className="fa-solid fa-key mr-2"></i> Connect AI Now
      </button>
      <a 
        href="https://ai.google.dev/gemini-api/docs/billing" 
        target="_blank" 
        className="text-[10px] text-gray-400 underline"
      >
        Note: Use a paid GCP project key for best performance.
      </a>
    </div>
  );
};

// --- SCREENS ---

const HomeScreen: React.FC<{ setScreen: (s: AppScreen) => void; onSub: (s: Subject) => void; lang: Language }> = ({ setScreen, onSub, lang }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
    <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-black mb-1">{lang === Language.HINDI ? 'नमस्ते!' : 'Welcome!'}</h2>
        <p className="text-blue-100 text-xs font-medium opacity-80 mb-6">{lang === Language.HINDI ? 'आज नया क्या सीखेंगे?' : 'What will we learn today?'}</p>
        <button onClick={() => setScreen(AppScreen.PLANNER)} className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition flex items-center gap-2">
          <i className="fa-solid fa-calendar-check"></i> {lang === Language.HINDI ? 'स्टडी प्लान' : 'Study Plan'}
        </button>
      </div>
      <i className="fa-solid fa-graduation-cap absolute -right-6 -bottom-6 text-[10rem] text-white opacity-10 rotate-12"></i>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-camera"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'फोटो हल' : 'Photo Solve'}</span>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-brain"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'AI गुरु' : 'AI Guru'}</span>
      </div>
    </div>

    <div onClick={() => setScreen(AppScreen.CURRENT_AFFAIRS)} className="bg-indigo-600 p-5 rounded-[2rem] text-white flex items-center justify-between cursor-pointer active:scale-[0.98] transition shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i className="fa-solid fa-newspaper"></i></div>
        <div>
          <h4 className="font-bold text-sm">{lang === Language.HINDI ? 'करंट अफेयर्स' : 'Daily News'}</h4>
          <p className="text-[10px] opacity-70">Latest updates powered by AI</p>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right opacity-40"></i>
    </div>

    <div>
      <h3 className="font-bold text-gray-800 mb-4 px-2">{lang === Language.HINDI ? 'विषय चुनें' : 'Subjects'}</h3>
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(sub => (
          <div key={sub.id} onClick={() => onSub(sub)} className="bg-white p-4 rounded-[1.5rem] border border-gray-50 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition cursor-pointer">
            <div className={`w-12 h-12 ${sub.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-md`}><i className={`fa-solid ${sub.icon}`}></i></div>
            <span className="text-[10px] font-bold text-gray-600 text-center">{lang === Language.HINDI ? sub.name.hi : sub.name.en}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PhotoSolveScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setImage(reader.result as string);
        setLoading(true);
        try {
          const base64 = await blobToBase64(file);
          const res = await geminiService.solvePhotoQuestion(base64, lang);
          setSolution(res);
        } catch (err) {
          console.error(err);
          setSolution("Could not analyze image. Ensure API Key is connected.");
        } finally { setLoading(false); }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {!image ? (
        <label className="flex flex-col items-center justify-center p-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] cursor-pointer hover:bg-gray-100 transition">
          <i className="fa-solid fa-camera-retro text-6xl text-gray-300 mb-4"></i>
          <span className="font-black text-gray-500 uppercase tracking-widest text-xs">Snap Question</span>
          <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
        </label>
      ) : (
        <div className="space-y-4">
          <img src={image} className="w-full h-48 object-cover rounded-3xl border shadow-lg" />
          {loading ? (
            <div className="text-center p-10"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600"></i></div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border shadow-sm animate-in slide-in-from-bottom-4">
              <h4 className="font-black text-blue-600 mb-4 flex items-center gap-2"><i className="fa-solid fa-brain"></i> Solution</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{solution}</p>
              <button onClick={() => {setImage(null); setSolution(null);}} className="w-full mt-6 py-4 bg-gray-100 rounded-2xl font-bold text-gray-400">Scan Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuizScreen: React.FC<{ topic: string; lang: Language }> = ({ topic, lang }) => {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    geminiService.generateQuiz(topic, 5, lang)
      .then(res => setQuiz(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topic]);

  if (loading) return <div className="p-20 text-center"><i className="fa-solid fa-spinner fa-spin text-5xl text-blue-600"></i></div>;
  if (quiz.length === 0) return <div className="p-10 text-center font-bold text-gray-400">Failed to load quiz. Check API key.</div>;

  const handleAnswer = (ansIdx: number) => {
    if (ansIdx === quiz[idx].correctAnswer) setScore(s => s + 1);
    if (idx < quiz.length - 1) setIdx(idx + 1);
    else setEnded(true);
  };

  if (ended) return (
    <div className="bg-white p-10 rounded-[3rem] text-center space-y-6 border shadow-2xl animate-in zoom-in">
      <div className="text-7xl">🏆</div>
      <h2 className="text-3xl font-black">Score: {score}/{quiz.length}</h2>
      <button onClick={() => window.location.reload()} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black">Play Again</button>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl">
      <div className="flex justify-between items-center mb-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <span>Question {idx+1}/{quiz.length}</span>
        <span className="text-blue-600">Score: {score}</span>
      </div>
      <h3 className="text-xl font-black text-gray-800 mb-8 leading-relaxed">{quiz[idx].question}</h3>
      <div className="space-y-3">
        {quiz[idx].options.map((opt: string, i: number) => (
          <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition active:scale-[0.98] font-bold">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOME);
  const [lang, setLang] = useState<Language>(Language.HINDI);
  const [selectedSub, setSelectedSub] = useState<Subject | null>(null);

  useEffect(() => {
    // Platform function to check if user has selected key
    (window as any).aistudio?.hasSelectedApiKey().then((val: boolean) => {
      setHasKey(val);
    }).catch(() => setHasKey(false));
  }, []);

  if (hasKey === null) return null;
  if (!hasKey) return <AIKeySelection onComplete={() => setHasKey(true)} />;

  const renderScreen = () => {
    switch(activeScreen) {
      case AppScreen.HOME: return <HomeScreen setScreen={setActiveScreen} onSub={(s) => { setSelectedSub(s); setActiveScreen(AppScreen.SUBJECTS); }} lang={lang} />;
      case AppScreen.PHOTO_SEARCH: return <PhotoSolveScreen lang={lang} />;
      case AppScreen.PLANNER: return (
        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl">
            <h2 className="text-2xl font-black">AI Study Planner</h2>
            <p className="text-xs opacity-70 mt-1">Select your exam to generate 7-day schedule.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {EXAMS.map(ex => (
              <button 
                key={ex.id} 
                onClick={async () => {
                  const plan = await geminiService.generateStudyPlan(ex.name, 7, lang);
                  alert(`Plan Generated for ${plan.exam}! Check your profile for details.`);
                }} 
                className="w-full p-6 bg-white border rounded-[2rem] font-black text-left flex justify-between items-center"
              >
                {ex.name} <i className="fa-solid fa-chevron-right text-gray-300"></i>
              </button>
            ))}
          </div>
        </div>
      );
      case AppScreen.AI_TEACHER: return (
        <div className="h-[75vh] flex flex-col bg-white rounded-[2.5rem] border shadow-xl overflow-hidden">
          <TeacherChatInterface lang={lang} />
        </div>
      );
      case AppScreen.QUIZ: return <QuizScreen topic={selectedSub ? (lang === Language.HINDI ? selectedSub.name.hi : selectedSub.name.en) : 'GK'} lang={lang} />;
      case AppScreen.SUBJECTS: return selectedSub ? (
        <div className="space-y-4">
          <div className={`${selectedSub.color} p-10 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6`}>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner"><i className={`fa-solid ${selectedSub.icon}`}></i></div>
            <h2 className="text-3xl font-black">{lang === Language.HINDI ? selectedSub.name.hi : selectedSub.name.en}</h2>
          </div>
          <button onClick={() => setActiveScreen(AppScreen.QUIZ)} className="w-full p-6 bg-white border rounded-[2rem] font-black flex items-center justify-between shadow-sm active:scale-95 transition">
            <span>Subject Quiz</span> <i className="fa-solid fa-circle-play text-blue-500 text-2xl"></i>
          </button>
          <button onClick={() => setActiveScreen(AppScreen.AI_TEACHER)} className="w-full p-6 bg-white border rounded-[2rem] font-black flex items-center justify-between shadow-sm active:scale-95 transition">
            <span>Ask Earth Guru</span> <i className="fa-solid fa-comment-dots text-emerald-500 text-2xl"></i>
          </button>
        </div>
      ) : null;
      case AppScreen.CURRENT_AFFAIRS: return <CurrentAffairsList lang={lang} />;
      case AppScreen.PROFILE: return (
        <div className="bg-white p-10 rounded-[3rem] border shadow-2xl text-center space-y-6">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto shadow-xl">S</div>
          <h3 className="text-2xl font-black">SEARCH EARTH Student</h3>
          <button onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)} className="w-full p-5 bg-blue-50 rounded-2xl flex justify-between items-center font-bold">
            <span>Language</span>
            <span className="bg-white px-4 py-1 rounded-xl shadow-sm text-blue-600 font-black">{lang === Language.HINDI ? 'HINDI' : 'ENGLISH'}</span>
          </button>
          <button 
            onClick={async () => { if((window as any).aistudio) await (window as any).aistudio.openSelectKey(); window.location.reload(); }}
            className="w-full p-4 text-xs font-bold text-gray-400 border-2 border-dashed rounded-xl mt-10"
          >
            Change API Key Connection
          </button>
        </div>
      );
      default: return <HomeScreen setScreen={setActiveScreen} onSub={() => {}} lang={lang} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setScreen={setActiveScreen} title="SEARCH EARTH">
      {renderScreen()}
    </Layout>
  );
};

const TeacherChatInterface: React.FC<{ lang: Language }> = ({ lang }) => {
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: lang === Language.HINDI ? 'नमस्ते! मैं सर्च अर्थ AI गुरु हूँ। आप क्या पढ़ना चाहते हैं?' : 'Hello! I am Earth Guru. What would you like to learn today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMsgs(p => [...p, userMsg]); setInput(''); setLoading(true);
    try {
      const res = await geminiService.chatWithTeacher(input, msgs, lang);
      setMsgs(p => [...p, { role: 'assistant', content: res }]);
    } catch (e: any) {
      setMsgs(p => [...p, { role: 'assistant', content: "Guru is offline. Check your API key selection." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-lg' : 'bg-gray-100 text-gray-800 rounded-tl-none border shadow-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type a topic..."
          className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
          onKeyPress={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={loading} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

const CurrentAffairsList: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    geminiService.getDailyCurrentAffairs(lang)
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center"><i className="fa-solid fa-magnifying-glass fa-spin text-5xl text-blue-600"></i><p className="mt-4 text-xs font-bold text-gray-400">Searching the web...</p></div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl">
        <h2 className="text-2xl font-black">Daily Affairs</h2>
        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{new Date().toDateString()}</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data?.text}</div>
        {data?.sources?.length > 0 && (
          <div className="pt-4 border-t">
            <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Sources</h5>
            {data.sources.map((s: any, i: number) => (
              <a key={i} href={s.uri} target="_blank" className="block text-xs text-blue-600 underline truncate mb-1">{s.title || s.uri}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
