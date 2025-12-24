
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { AppScreen, Language, Message, Subject, CurrentAffair } from './types';
import { SUBJECTS, EXAMS } from './constants';
import { geminiService } from './services/geminiService';

// Fix: Consolidated declaration to prevent modifier mismatch errors
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Global component to handle missing API keys
const KeyMissingOverlay: React.FC<{ onRetry: () => void; lang: Language }> = ({ onRetry, lang }) => {
  const handleConnect = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        onRetry();
      } else {
        alert("AI Studio environment not detected. Please check your setup.");
      }
    } catch (e) {
      console.error("Failed to open key selection", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 text-center animate-in zoom-in duration-300 my-10">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-rose-100">
        <i className="fa-solid fa-plug-circle-exclamation"></i>
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-800">
          {lang === Language.HINDI ? 'AI कनेक्ट करें' : 'Connect AI Guru'}
        </h3>
        <p className="text-gray-500 text-xs mt-2 px-4 leading-relaxed font-medium">
          {lang === Language.HINDI 
            ? 'पढ़ाई शुरू करने के लिए आपको अपनी API Key कनेक्ट करनी होगी। यह सुरक्षित और मुफ्त है।' 
            : 'To start studying, you need to connect your API Key via the secure dialog.'}
        </p>
      </div>
      <button 
        onClick={handleConnect}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition flex items-center justify-center gap-3"
      >
        <i className="fa-solid fa-key"></i>
        {lang === Language.HINDI ? 'अभी कनेक्ट करें' : 'Connect Now'}
      </button>
      <p className="text-[10px] text-gray-400">
        Required for Veo & Gemini 3 Models. 
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1">Learn More</a>
      </p>
    </div>
  );
};

const HomeScreen: React.FC<{ setScreen: (s: AppScreen) => void; onSubjectSelect: (sub: Subject) => void; lang: Language }> = ({ setScreen, onSubjectSelect, lang }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <span className="bg-blue-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Search Earth AI</span>
        <h2 className="text-2xl font-black mb-1 leading-tight">
          {lang === Language.HINDI ? 'सफलता का नया रास्ता' : 'New Path to Success'}
        </h2>
        <p className="text-blue-100 text-xs opacity-80 mb-4">
          {lang === Language.HINDI ? 'AI के साथ स्मार्ट तैयारी करें' : 'Smart preparation with AI assistance'}
        </p>
        <button 
          onClick={() => setScreen(AppScreen.PLANNER)}
          className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-calendar-days"></i>
          {lang === Language.HINDI ? 'स्टडी प्लान' : 'Study Plan'}
        </button>
      </div>
      <i className="fa-solid fa-user-graduate absolute -right-6 -bottom-6 text-9xl text-white opacity-10 rotate-12"></i>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl">
          <i className="fa-solid fa-camera"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'फोटो हल' : 'Scan & Solve'}</p>
          <p className="text-[10px] text-gray-400">Scan any question</p>
        </div>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
          <i className="fa-solid fa-robot"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'AI टीचर' : 'Ask AI Teacher'}</p>
          <p className="text-[10px] text-gray-400">Ask any doubt</p>
        </div>
      </div>
    </div>

    <div 
      onClick={() => setScreen(AppScreen.CURRENT_AFFAIRS)}
      className="bg-orange-50 border border-orange-100 p-4 rounded-2xl cursor-pointer hover:bg-orange-100 transition flex items-center justify-between active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-sm">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div>
          <h4 className="font-bold text-orange-900 text-sm">
            {lang === Language.HINDI ? 'करंट अफेयर्स' : 'Current Affairs'}
          </h4>
          <p className="text-[10px] text-orange-700 font-medium leading-none mt-1">
            {lang === Language.HINDI ? 'आज के मुख्य समाचार' : 'Today\'s important updates'}
          </p>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right text-orange-400"></i>
    </div>

    <div>
      <h3 className="font-bold text-lg text-gray-800 mb-4 px-1">{lang === Language.HINDI ? 'लोकप्रिय विषय' : 'Subjects'}</h3>
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(sub => (
          <div 
            key={sub.id} 
            onClick={() => onSubjectSelect(sub)}
            className="bg-white p-3 rounded-2xl shadow-xs border border-gray-50 flex flex-col items-center gap-2 hover:border-blue-200 transition cursor-pointer active:scale-95"
          >
            <div className={`w-12 h-12 ${sub.color} text-white rounded-xl flex items-center justify-center text-xl shadow-inner`}>
              <i className={`fa-solid ${sub.icon}`}></i>
            </div>
            <span className="text-[11px] font-bold text-gray-600 text-center leading-tight">{lang === Language.HINDI ? sub.name.hi : sub.name.en}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CurrentAffairsScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.getDailyCurrentAffairs(lang);
      setData(res.news);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : (e.message || "Failed to fetch."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [lang]);

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={fetchData} />;

  return (
    <div className="space-y-4">
      <div className="bg-orange-500 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">{lang === Language.HINDI ? 'ताज़ा खबरें' : 'Headlines'}</h2>
          <p className="text-white/80 text-[10px] font-bold uppercase mt-1">{new Date().toLocaleDateString()}</p>
        </div>
        <i className="fa-solid fa-newspaper text-4xl opacity-40"></i>
      </div>
      {loading ? <div className="p-10 text-center text-gray-400 animate-pulse">Loading updates...</div> : (
        <div className="space-y-4 pb-20">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-2 inline-block">{item.category}</span>
              <h3 className="font-bold text-gray-800 text-base mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PhotoSearchScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        solve(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const solve = async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.solvePhotoQuestion(base64, lang);
      setResult(res);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : (e.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={() => setImage(null)} />;

  return (
    <div className="space-y-4">
      {!image ? (
        <label className="flex flex-col items-center justify-center p-12 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[2.5rem] cursor-pointer hover:bg-rose-100 transition">
          <i className="fa-solid fa-camera-retro text-4xl text-rose-500 mb-4"></i>
          <span className="font-black text-rose-800">{lang === Language.HINDI ? 'फोटो क्लिक करें' : 'Click Photo'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      ) : (
        <div className="space-y-4 animate-in fade-in">
          <img src={image} className="w-full h-48 object-cover rounded-3xl border shadow-lg" />
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h4 className="font-bold text-blue-600 mb-3 border-b pb-2">AI Solution</h4>
            {loading ? <div className="h-20 flex items-center justify-center animate-pulse">Analyzing...</div> : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
            )}
          </div>
          <button onClick={() => setImage(null)} className="w-full py-3 bg-gray-100 rounded-2xl font-bold text-gray-500">Retry</button>
        </div>
      )}
    </div>
  );
};

const AITeacherScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: lang === Language.HINDI ? 'नमस्ते! मैं सर्च अर्थ AI गुरु हूँ।' : 'Hello! I am Search Earth AI Teacher.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await geminiService.chatWithTeacher(input, msgs, lang);
      setMsgs(prev => [...prev, { role: 'assistant', content: res }]);
    } catch (e: any) {
      if (e.message === "API_KEY_MISSING") setError("KEY_MISSING");
      else setMsgs(prev => [...prev, { role: 'assistant', content: "Error communicating with AI." }]);
    } finally {
      setLoading(false);
    }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={() => setError(null)} />;

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="pt-4 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 p-4 bg-white border rounded-2xl outline-none" onKeyPress={e => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend} disabled={loading} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-paper-plane"></i></button>
      </div>
    </div>
  );
};

const StudyPlannerScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [exam, setExam] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!exam) return;
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.generateStudyPlan(exam, 7, lang);
      setPlan(res);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={handleGenerate} />;

  return (
    <div className="space-y-4">
      {!plan ? (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl"><i className="fa-solid fa-calendar"></i></div>
          <h3 className="text-xl font-black">AI Study Planner</h3>
          <select value={exam} onChange={e => setExam(e.target.value)} className="w-full p-4 border rounded-2xl outline-none bg-gray-50 font-bold">
            <option value="">-- Choose Exam --</option>
            {EXAMS.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={loading || !exam} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">
            {loading ? 'Creating...' : 'Generate 7-Day Plan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-blue-600 text-white p-5 rounded-2xl flex justify-between items-center">
            <span className="font-black">{plan.exam}</span>
            <button onClick={() => setPlan(null)}><i className="fa-solid fa-rotate-left"></i></button>
          </div>
          {plan.schedule?.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border p-4">
              <h4 className="font-black text-blue-600 text-xs mb-3 uppercase tracking-widest">{day.day}</h4>
              {day.slots?.map((s: any, j: number) => (
                <div key={j} className="flex gap-4 border-t py-2 first:border-0">
                  <span className="text-[10px] font-black text-gray-400 w-20">{s.time}</span>
                  <span className="text-xs text-gray-700 font-medium">{s.activity}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuizScreen: React.FC<{ lang: Language; initialTopic?: string }> = ({ lang, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.generateQuiz(topic, 10, lang);
      setQuiz(res);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={start} />;

  return (
    <div className="space-y-4">
      {quiz.length === 0 ? (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl"><i className="fa-solid fa-bolt"></i></div>
          <h3 className="text-xl font-black">AI Quiz Generator</h3>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter topic (e.g. Geography)" className="w-full p-4 border rounded-2xl outline-none font-bold" />
          <button onClick={start} disabled={loading || !topic} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">
            {loading ? 'Generating...' : 'Start Quiz'}
          </button>
        </div>
      ) : showResult ? (
        <div className="bg-white p-10 rounded-[3rem] text-center space-y-4 animate-in zoom-in">
          <div className="text-5xl">🏆</div>
          <h2 className="text-3xl font-black">Score: {score}/{quiz.length}</h2>
          <button onClick={() => {setQuiz([]); setScore(0); setShowResult(false); setCurrentIndex(0);}} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black">Try Again</button>
        </div>
      ) : (
        <div className="bg-white p-7 rounded-[2.5rem] border shadow-xl animate-in fade-in">
          <div className="flex justify-between items-center mb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Question {currentIndex + 1} / {quiz.length}</span>
            <span className="text-blue-600">Score: {score}</span>
          </div>
          <h3 className="text-lg font-black mb-8 leading-relaxed">{quiz[currentIndex].question}</h3>
          <div className="space-y-3">
            {quiz[currentIndex].options?.map((opt: string, i: number) => (
              <button 
                key={i} 
                onClick={() => {
                  if (i === quiz[currentIndex].correctAnswer) setScore(s => s + 1);
                  if (currentIndex < quiz.length - 1) setCurrentIndex(currentIndex + 1);
                  else setShowResult(true);
                }}
                className="w-full text-left p-4 rounded-2xl border font-bold hover:bg-blue-50 hover:border-blue-200 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SubjectDetailsScreen: React.FC<{ subject: Subject; lang: Language; setScreen: (s: AppScreen) => void; setTopic: (t: string) => void }> = ({ subject, lang, setScreen, setTopic }) => (
  <div className="space-y-4">
    <div className={`${subject.color} p-6 rounded-3xl text-white shadow-lg flex items-center gap-4`}>
      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl"><i className={`fa-solid ${subject.icon}`}></i></div>
      <h2 className="text-2xl font-black">{lang === Language.HINDI ? subject.name.hi : subject.name.en}</h2>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <button 
        onClick={() => { setTopic(lang === Language.HINDI ? subject.name.hi : subject.name.en); setScreen(AppScreen.QUIZ); }}
        className="bg-white p-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-95 transition"
      >
        <i className="fa-solid fa-list-check text-blue-600"></i>
        {lang === Language.HINDI ? 'क्विज़' : 'Take Quiz'}
      </button>
      <button 
        onClick={() => setScreen(AppScreen.AI_TEACHER)}
        className="bg-white p-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-95 transition"
      >
        <i className="fa-solid fa-comments text-emerald-600"></i>
        {lang === Language.HINDI ? 'सवाल पूछें' : 'Ask Doubts'}
      </button>
    </div>
    <div className="bg-white p-6 rounded-3xl border shadow-sm">
      <h3 className="font-bold mb-4">Subject Overview</h3>
      <p className="text-sm text-gray-600 leading-relaxed">Start your preparation for {subject.name.en} with Search Earth AI. Get tailored notes and expert guidance 24/7.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOME);
  const [lang, setLang] = useState<Language>(Language.HINDI);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizTopic, setQuizTopic] = useState('');

  const renderScreen = () => {
    switch(activeScreen) {
      case AppScreen.HOME: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={(s) => {setSelectedSubject(s); setActiveScreen(AppScreen.SUBJECTS);}} lang={lang} />;
      case AppScreen.CURRENT_AFFAIRS: return <CurrentAffairsScreen lang={lang} />;
      case AppScreen.AI_TEACHER: return <AITeacherScreen lang={lang} />;
      case AppScreen.PHOTO_SEARCH: return <PhotoSearchScreen lang={lang} />;
      case AppScreen.PLANNER: return <StudyPlannerScreen lang={lang} />;
      case AppScreen.QUIZ: return <QuizScreen lang={lang} initialTopic={quizTopic} />;
      case AppScreen.SUBJECTS: return selectedSubject ? <SubjectDetailsScreen subject={selectedSubject} lang={lang} setScreen={setActiveScreen} setTopic={setQuizTopic} /> : null;
      case AppScreen.PROFILE: return (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl text-center">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh`} className="w-24 h-24 mx-auto mb-4 border-4 border-blue-100 rounded-full" />
             <h3 className="text-2xl font-black">User Profile</h3>
             <button onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)} className="mt-6 w-full p-4 bg-blue-50 rounded-2xl flex justify-between items-center font-bold text-blue-700">
               <span>Language</span>
               <span>{lang === Language.HINDI ? 'Hindi' : 'English'}</span>
             </button>
             <button onClick={async () => {
               if (window.aistudio) await window.aistudio.openSelectKey();
             }} className="mt-4 w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center font-bold text-gray-600">
               <span>Update API Key</span>
               <i className="fa-solid fa-key"></i>
             </button>
          </div>
        </div>
      );
      default: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={() => {}} lang={lang} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setScreen={setActiveScreen} title="SEARCH EARTH">
      <div className="animate-in fade-in duration-500 h-full">
        {renderScreen()}
      </div>
    </Layout>
  );
};

export default App;
