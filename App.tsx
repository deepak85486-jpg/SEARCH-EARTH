
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { AppScreen, Language, Message, Subject, CurrentAffair } from './types';
import { SUBJECTS, EXAMS } from './constants';
import { geminiService } from './services/geminiService';

// --- SHARED COMPONENTS ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-500 font-medium animate-pulse">AI is processing...</p>
  </div>
);

const ConnectionStatus: React.FC<{ lang: Language }> = ({ lang }) => {
  const hasKey = geminiService.hasKey();
  
  const handleConnect = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      window.location.reload(); // Reload to pick up the new key
    }
  };

  if (hasKey) return null;

  return (
    <div className="mx-4 mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
      <div className="flex items-center justify-center gap-2 text-rose-600 font-bold mb-2">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <span>{lang === Language.HINDI ? 'AI कनेक्ट नहीं है' : 'AI Disconnected'}</span>
      </div>
      <p className="text-[10px] text-rose-500 mb-3 leading-tight">
        {lang === Language.HINDI 
          ? 'Vercel पर API Key सीधे एक्सेस नहीं हो पा रही। कृपया "Connect AI" बटन दबाकर अपनी Key चुनें।' 
          : 'API Key is missing or blocked on Vercel. Please use the button below to link your key.'}
      </p>
      <button 
        onClick={handleConnect}
        className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition"
      >
        Connect AI Key
      </button>
    </div>
  );
};

// --- SCREENS ---

const HomeScreen: React.FC<{ setScreen: (s: AppScreen) => void; onSubjectSelect: (sub: Subject) => void; lang: Language }> = ({ setScreen, onSubjectSelect, lang }) => (
  <div className="space-y-6">
    <ConnectionStatus lang={lang} />
    
    <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-black mb-2">
          {lang === Language.HINDI ? 'नमस्ते विद्यार्थी!' : 'Hi Learner!'}
        </h2>
        <p className="text-blue-100 text-xs opacity-90 mb-6">
          {lang === Language.HINDI ? 'आज आप क्या सीखना चाहेंगे?' : 'What do you want to learn today?'}
        </p>
        <button 
          onClick={() => setScreen(AppScreen.PLANNER)}
          className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-bolt"></i>
          {lang === Language.HINDI ? 'स्टडी प्लानर' : 'Study Planner'}
        </button>
      </div>
      <i className="fa-solid fa-graduation-cap absolute -right-6 -bottom-6 text-[10rem] text-white opacity-10 rotate-12"></i>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-camera"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'फोटो हल' : 'Photo Solve'}</span>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col items-center gap-3 cursor-pointer active:scale-95 transition">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-brain"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'AI गुरु' : 'AI Teacher'}</span>
      </div>
    </div>

    <div>
      <h3 className="font-bold text-gray-800 mb-4 px-2">{lang === Language.HINDI ? 'लोकप्रिय विषय' : 'Browse Subjects'}</h3>
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(sub => (
          <div 
            key={sub.id} 
            onClick={() => onSubjectSelect(sub)}
            className="bg-white p-4 rounded-3xl border shadow-xs flex flex-col items-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <div className={`w-12 h-12 ${sub.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-md`}><i className={`fa-solid ${sub.icon}`}></i></div>
            <span className="text-[10px] font-bold text-gray-600">{lang === Language.HINDI ? sub.name.hi : sub.name.en}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AITeacherChat: React.FC<{ lang: Language }> = ({ lang }) => {
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: lang === Language.HINDI ? 'नमस्ते! मैं सर्च अर्थ AI गुरु हूँ। आज क्या पढ़ना चाहते हैं?' : 'Hello! I am your AI Teacher. How can I help you today?' }]);
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
      setMsgs(p => [...p, { role: 'assistant', content: "Error: " + (e.message === "API_KEY_MISSING" ? "Please connect your API Key in Home screen." : "Something went wrong.") }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-lg' : 'bg-white border rounded-tl-none shadow-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-500"
          onKeyPress={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={loading} className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

const QuizInterface: React.FC<{ lang: Language; topic: string }> = ({ lang, topic }) => {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    geminiService.generateQuiz(topic, 5, lang)
      .then(res => setQuiz(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topic]);

  if (loading) return <LoadingSpinner />;
  if (quiz.length === 0) return <div className="p-10 text-center font-bold text-gray-400">Quiz failed to load. Check API key.</div>;

  const handleAnswer = (idx: number) => {
    if (idx === quiz[current].correctAnswer) setScore(s => s + 1);
    if (current < quiz.length - 1) setCurrent(current + 1);
    else setDone(true);
  };

  if (done) return (
    <div className="bg-white p-10 rounded-[3rem] text-center space-y-6 border shadow-xl">
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-black">Score: {score}/{quiz.length}</h2>
      <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Back to Home</button>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl">
      <div className="flex justify-between mb-8 text-[10px] font-bold text-gray-400">
        <span>Question {current + 1}/{quiz.length}</span>
        <span>Score: {score}</span>
      </div>
      <h3 className="text-lg font-black mb-8 leading-relaxed">{quiz[current].question}</h3>
      <div className="space-y-3">
        {quiz[current].options.map((opt: string, i: number) => (
          <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-5 rounded-2xl border-2 border-gray-50 hover:border-blue-400 hover:bg-blue-50 transition active:scale-[0.98] font-medium">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOME);
  const [lang, setLang] = useState<Language>(Language.HINDI);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const renderScreen = () => {
    switch(activeScreen) {
      case AppScreen.HOME: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={(s) => { setSelectedSubject(s); setActiveScreen(AppScreen.SUBJECTS); }} lang={lang} />;
      case AppScreen.AI_TEACHER: return <div className="h-[75vh]"><AITeacherChat lang={lang} /></div>;
      case AppScreen.QUIZ: return <QuizInterface lang={lang} topic={selectedSubject ? (lang === Language.HINDI ? selectedSubject.name.hi : selectedSubject.name.en) : 'GK'} />;
      case AppScreen.SUBJECTS: return selectedSubject ? (
        <div className="space-y-4">
          <div className={`${selectedSubject.color} p-8 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6`}>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner"><i className={`fa-solid ${selectedSubject.icon}`}></i></div>
            <h2 className="text-3xl font-black">{lang === Language.HINDI ? selectedSubject.name.hi : selectedSubject.name.en}</h2>
          </div>
          <button onClick={() => setActiveScreen(AppScreen.QUIZ)} className="w-full p-6 bg-white border rounded-[2rem] font-bold shadow-sm flex items-center justify-between active:scale-95 transition">
            <span>{lang === Language.HINDI ? 'विषय क्विज़' : 'Subject Quiz'}</span>
            <i className="fa-solid fa-circle-play text-blue-500 text-2xl"></i>
          </button>
          <button onClick={() => setActiveScreen(AppScreen.AI_TEACHER)} className="w-full p-6 bg-white border rounded-[2rem] font-bold shadow-sm flex items-center justify-between active:scale-95 transition">
            <span>{lang === Language.HINDI ? 'AI गुरु से पूछें' : 'Ask AI Guru'}</span>
            <i className="fa-solid fa-comment-dots text-emerald-500 text-2xl"></i>
          </button>
        </div>
      ) : null;
      case AppScreen.PROFILE: return (
        <div className="bg-white p-10 rounded-[3rem] border shadow-2xl text-center space-y-6">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto shadow-xl">S</div>
          <h3 className="text-2xl font-black">SEARCH EARTH Student</h3>
          <button onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)} className="w-full p-5 bg-blue-50 rounded-2xl flex justify-between items-center font-bold">
            <span>Language</span>
            <span className="bg-white px-4 py-1 rounded-xl shadow-sm text-blue-600">{lang === Language.HINDI ? 'Hindi' : 'English'}</span>
          </button>
        </div>
      );
      default: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={() => {}} lang={lang} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setScreen={setActiveScreen} title="SEARCH EARTH">
      {renderScreen()}
    </Layout>
  );
};

export default App;
