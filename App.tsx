
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AppScreen, Language, Message, Subject, CurrentAffair } from './types';
import { SUBJECTS, EXAMS } from './constants';
import { geminiService } from './services/geminiService';

// --- SHARED COMPONENTS ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-500 font-medium animate-pulse">AI is thinking...</p>
  </div>
);

const KeyMissingOverlay: React.FC<{ onRetry: () => void; lang: Language }> = ({ onRetry, lang }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] border shadow-xl text-center my-10 animate-in zoom-in">
    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mb-4">
      <i className="fa-solid fa-plug-circle-exclamation"></i>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">
      {lang === Language.HINDI ? 'API Key सेट नहीं है' : 'API Key Not Set'}
    </h3>
    <p className="text-gray-500 text-xs mb-6 px-4">
      Vercel Environment Variables में <code>API_KEY</code> जोड़ें और Redeploy करें।
    </p>
    <button onClick={onRetry} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition">
      Retry Connection
    </button>
  </div>
);

// --- SCREENS ---

const HomeScreen: React.FC<{ setScreen: (s: AppScreen) => void; onSubjectSelect: (sub: Subject) => void; lang: Language }> = ({ setScreen, onSubjectSelect, lang }) => (
  <div className="space-y-6">
    {/* Hero Card */}
    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block">Study Buddy AI</span>
        <h2 className="text-3xl font-black mb-2 leading-tight">
          {lang === Language.HINDI ? 'सफलता की शुरुआत यहाँ से!' : 'Your Success Starts Here!'}
        </h2>
        <p className="text-blue-100 text-xs opacity-90 mb-6">
          {lang === Language.HINDI ? 'AI के साथ स्मार्ट तैयारी करें' : 'Prepare smarter with AI personal tutor'}
        </p>
        <button 
          onClick={() => setScreen(AppScreen.PLANNER)}
          className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-calendar-check"></i>
          {lang === Language.HINDI ? 'स्टडी प्लानर' : 'Study Planner'}
        </button>
      </div>
      <i className="fa-solid fa-user-graduate absolute -right-6 -bottom-6 text-[10rem] text-white opacity-10 rotate-12"></i>
    </div>

    {/* Quick Tools */}
    <div className="grid grid-cols-2 gap-4">
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-camera"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'फोटो से सवाल' : 'Photo Solve'}</span>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-robot"></i></div>
        <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'AI गुरु' : 'AI Teacher'}</span>
      </div>
    </div>

    {/* News Banner */}
    <div 
      onClick={() => setScreen(AppScreen.CURRENT_AFFAIRS)}
      className="bg-orange-500 p-5 rounded-3xl text-white flex items-center justify-between cursor-pointer shadow-lg active:scale-[0.98] transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i className="fa-solid fa-bolt"></i></div>
        <div>
          <h4 className="font-bold text-sm">{lang === Language.HINDI ? 'करंट अफेयर्स' : 'Current Affairs'}</h4>
          <p className="text-[10px] opacity-80">Daily exam-focused updates</p>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right opacity-60"></i>
    </div>

    {/* Subjects */}
    <div>
      <h3 className="font-bold text-gray-800 mb-4 px-2">{lang === Language.HINDI ? 'लोकप्रिय विषय' : 'Top Subjects'}</h3>
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(sub => (
          <div 
            key={sub.id} 
            onClick={() => onSubjectSelect(sub)}
            className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center gap-2 hover:border-blue-200 transition cursor-pointer active:scale-95"
          >
            <div className={`w-12 h-12 ${sub.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-md`}><i className={`fa-solid ${sub.icon}`}></i></div>
            <span className="text-[10px] font-black text-gray-600 text-center leading-tight">{lang === Language.HINDI ? sub.name.hi : sub.name.en}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PhotoSearchScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLoading(true); setError(null);
    try {
      const res = await geminiService.solvePhotoQuestion(base64, lang);
      setSolution(res);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : "Failed to analyze. Try again.");
    } finally { setLoading(false); }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={() => setImage(null)} />;

  return (
    <div className="space-y-6 animate-in fade-in">
      {!image ? (
        <label className="flex flex-col items-center justify-center p-16 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[3rem] cursor-pointer hover:bg-rose-100 transition shadow-inner">
          <i className="fa-solid fa-camera-retro text-5xl text-rose-500 mb-4"></i>
          <span className="font-black text-rose-800 text-lg">{lang === Language.HINDI ? 'सवाल का फोटो लें' : 'Snap Question'}</span>
          <p className="text-[10px] text-rose-600 mt-2 font-medium">Clear photo = Better solution</p>
          <input type="file" className="hidden" accept="image/*" onChange={handleCapture} />
        </label>
      ) : (
        <div className="space-y-4">
          <img src={image} className="w-full h-56 object-cover rounded-3xl border-4 border-white shadow-xl" />
          {loading ? <LoadingSpinner /> : (
            <div className="bg-white p-6 rounded-3xl border shadow-sm animate-in slide-in-from-bottom-4">
              <h4 className="font-black text-blue-600 mb-4 border-b pb-2 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb"></i> AI Solution
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{solution}</div>
              <button onClick={() => {setImage(null); setSolution(null);}} className="w-full mt-6 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 active:scale-95 transition">Scan Another</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StudyPlannerScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [exam, setExam] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!exam) return;
    setLoading(true); setError(null);
    try {
      const res = await geminiService.generateStudyPlan(exam, 7, lang);
      setPlan(res);
    } catch (e: any) {
      setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : "Error");
    } finally { setLoading(false); }
  };

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={generate} />;

  return (
    <div className="space-y-6">
      {!plan ? (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner"><i className="fa-solid fa-calendar-day"></i></div>
          <div>
            <h3 className="text-2xl font-black">AI Study Planner</h3>
            <p className="text-gray-500 text-xs mt-1">Get a personalized 7-day schedule</p>
          </div>
          <select 
            value={exam} 
            onChange={e => setExam(e.target.value)}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none bg-gray-50 font-bold focus:border-blue-500 transition"
          >
            <option value="">-- Select Exam --</option>
            {EXAMS.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>
          <button 
            onClick={generate} 
            disabled={loading || !exam}
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl disabled:opacity-50 active:scale-95 transition"
          >
            {loading ? 'Generating Strategy...' : 'Create My Plan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          <div className="bg-blue-600 text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
            <div>
              <h4 className="font-black text-lg">{plan.exam}</h4>
              <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest">7 Days Mastery Plan</p>
            </div>
            <button onClick={() => setPlan(null)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i className="fa-solid fa-rotate-left"></i></button>
          </div>
          {plan.schedule?.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-3xl border-2 border-gray-50 p-6 shadow-sm animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
              <h5 className="font-black text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-[10px] rounded-full flex items-center justify-center">0{i+1}</span>
                {day.day}
              </h5>
              <div className="space-y-3">
                {day.slots?.map((slot: any, j: number) => (
                  <div key={j} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-white">
                    <span className="text-[10px] font-black text-gray-400 w-16 uppercase">{slot.time}</span>
                    <span className="text-xs text-gray-700 font-semibold">{slot.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CurrentAffairsScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await geminiService.getDailyCurrentAffairs(lang);
        setData(res);
      } catch (e: any) {
        setError(e.message === "API_KEY_MISSING" ? "KEY_MISSING" : "Failed");
      } finally { setLoading(false); }
    };
    fetch();
  }, [lang]);

  if (error === "KEY_MISSING") return <KeyMissingOverlay lang={lang} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-4">
      <div className="bg-orange-500 p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-black">{lang === Language.HINDI ? 'ताज़ा करंट अफेयर्स' : 'Today\'s Affairs'}</h2>
        <p className="text-white/70 text-[10px] font-bold mt-1 uppercase tracking-widest">{new Date().toDateString()}</p>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4 pb-10">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full mb-3 inline-block uppercase">{item.category}</span>
              <h3 className="font-black text-gray-800 text-lg mb-2 leading-tight">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP WRAPPER ---

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOME);
  const [lang, setLang] = useState<Language>(Language.HINDI);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const renderScreen = () => {
    switch(activeScreen) {
      case AppScreen.HOME: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={(s) => { setSelectedSubject(s); setActiveScreen(AppScreen.SUBJECTS); }} lang={lang} />;
      case AppScreen.PHOTO_SEARCH: return <PhotoSearchScreen lang={lang} />;
      case AppScreen.PLANNER: return <StudyPlannerScreen lang={lang} />;
      case AppScreen.CURRENT_AFFAIRS: return <CurrentAffairsScreen lang={lang} />;
      case AppScreen.AI_TEACHER: 
        return (
          <div className="h-[75vh]">
            <TeacherChat lang={lang} />
          </div>
        );
      case AppScreen.QUIZ:
        return <QuizInterface lang={lang} topic={selectedSubject ? (lang === Language.HINDI ? selectedSubject.name.hi : selectedSubject.name.en) : 'General Knowledge'} />;
      case AppScreen.SUBJECTS: return selectedSubject ? (
        <div className="space-y-4 animate-in fade-in">
          <div className={`${selectedSubject.color} p-8 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6`}>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner"><i className={`fa-solid ${selectedSubject.icon}`}></i></div>
            <h2 className="text-3xl font-black">{lang === Language.HINDI ? selectedSubject.name.hi : selectedSubject.name.en}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <button onClick={() => setActiveScreen(AppScreen.QUIZ)} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between font-black active:scale-[0.98] transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><i className="fa-solid fa-list-check"></i></div>
                <span>{lang === Language.HINDI ? 'विषय क्विज़ शुरू करें' : 'Start Topic Quiz'}</span>
              </div>
              <i className="fa-solid fa-play text-blue-300"></i>
            </button>
            <button onClick={() => setActiveScreen(AppScreen.AI_TEACHER)} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between font-black active:scale-[0.98] transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><i className="fa-solid fa-comments"></i></div>
                <span>{lang === Language.HINDI ? 'AI गुरु से सवाल पूछें' : 'Ask Earth Guru'}</span>
              </div>
              <i className="fa-solid fa-chevron-right text-emerald-300"></i>
            </button>
          </div>
        </div>
      ) : null;
      case AppScreen.PROFILE: return (
        <div className="bg-white p-10 rounded-[3rem] border shadow-2xl text-center space-y-6 animate-in zoom-in">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-5xl font-black mx-auto shadow-xl">S</div>
          <div>
            <h3 className="text-2xl font-black">Search Earth Learner</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter mt-1">Free Tier Explorer</p>
          </div>
          <button 
            onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)}
            className="w-full p-5 bg-blue-50 text-blue-700 rounded-2xl flex justify-between items-center font-black active:scale-95 transition"
          >
            <span>App Language</span>
            <span className="bg-white px-4 py-1 rounded-xl shadow-sm">{lang === Language.HINDI ? 'Hindi' : 'English'}</span>
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setScreen={setActiveScreen} title="SEARCH EARTH">
      {renderScreen()}
    </Layout>
  );
};

const TeacherChat: React.FC<{ lang: Language }> = ({ lang }) => {
  const [msgs, setMsgs] = useState<Message[]>([{ role: 'assistant', content: lang === Language.HINDI ? 'नमस्ते! मैं सर्च अर्थ AI गुरु हूँ। आज आप क्या पढ़ना चाहते हैं?' : 'Hello! I am Earth Guru. What topic can I explain today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMsgs(prev => [...prev, userMsg]); setInput(''); setLoading(true);
    try {
      const res = await geminiService.chatWithTeacher(input, msgs, lang);
      setMsgs(prev => [...prev, { role: 'assistant', content: res }]);
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'assistant', content: "Sorry, I am having trouble connecting. Please check your API key." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-[10px] italic font-bold ml-2">Guru is typing...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-gray-50 border-t flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition font-medium"
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

const QuizInterface: React.FC<{ lang: Language; topic: string }> = ({ lang, topic }) => {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await geminiService.generateQuiz(topic, 5, lang);
        setQuiz(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [topic, lang]);

  if (loading) return <LoadingSpinner />;
  if (quiz.length === 0) return <div className="p-10 text-center font-bold text-gray-400">Could not generate quiz. Try again.</div>;

  const handleAnswer = (idx: number) => {
    if (idx === quiz[currentIdx].correctAnswer) setScore(s => s + 1);
    if (currentIdx < quiz.length - 1) setCurrentIdx(currentIdx + 1);
    else setFinished(true);
  };

  if (finished) return (
    <div className="bg-white p-10 rounded-[3rem] text-center space-y-6 animate-in zoom-in border shadow-2xl">
      <div className="text-7xl">🏆</div>
      <h2 className="text-3xl font-black">Score: {score}/{quiz.length}</h2>
      <p className="text-gray-500 font-bold">Excellent effort! Keep practicing with AI Guru.</p>
      <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg">Try Another Topic</button>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">Question {currentIdx + 1}/{quiz.length}</span>
        <span className="text-[10px] font-black text-gray-400">Topic: {topic}</span>
      </div>
      <h3 className="text-xl font-black text-gray-800 mb-10 leading-relaxed">{quiz[currentIdx].question}</h3>
      <div className="grid grid-cols-1 gap-4">
        {quiz[currentIdx].options.map((opt: string, i: number) => (
          <button 
            key={i} 
            onClick={() => handleAnswer(i)}
            className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 font-bold hover:bg-blue-50 hover:border-blue-400 transition active:scale-[0.98]"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
import { useRef } from 'react';
