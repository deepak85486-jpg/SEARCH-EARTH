
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { AppScreen, Language, Message, Subject, CurrentAffair } from './types';
import { SUBJECTS, EXAMS } from './constants';
import { geminiService } from './services/geminiService';

const HomeScreen: React.FC<{ setScreen: (s: AppScreen) => void; onSubjectSelect: (sub: Subject) => void; lang: Language }> = ({ setScreen, onSubjectSelect, lang }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <span className="bg-blue-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Pro Version</span>
        <h2 className="text-2xl font-black mb-1 leading-tight">
          {lang === Language.HINDI ? 'सर्च अर्थ: सफलता का साथी' : 'Search Earth: Success Partner'}
        </h2>
        <p className="text-blue-100 text-xs opacity-80 mb-4">
          {lang === Language.HINDI ? 'AI के साथ स्मार्ट तरीके से पढ़ें' : 'Study smarter with AI assistance'}
        </p>
        <button 
          onClick={() => setScreen(AppScreen.PLANNER)}
          className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition flex items-center gap-2"
        >
          <i className="fa-solid fa-calendar-check"></i>
          {lang === Language.HINDI ? 'स्टडी प्लान बनाएं' : 'Create Study Plan'}
        </button>
      </div>
      <i className="fa-solid fa-globe-asia absolute -right-6 -bottom-6 text-9xl text-white opacity-10 rotate-12"></i>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl">
          <i className="fa-solid fa-camera-retro"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'फोटो हल' : 'Scan & Solve'}</p>
          <p className="text-[10px] text-gray-400">Instant AI solutions</p>
        </div>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition active:scale-95">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
          <i className="fa-solid fa-brain"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'AI टीचर' : 'Ask AI Guru'}</p>
          <p className="text-[10px] text-gray-400">24/7 Expert Help</p>
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
            {lang === Language.HINDI ? 'डेली करंट अफेयर्स' : 'Daily Current Affairs'}
          </h4>
          <p className="text-[10px] text-orange-700 font-medium leading-none mt-1">
            {lang === Language.HINDI ? 'आज की ताज़ा खबरें और महत्वपूर्ण तथ्य' : 'Latest updates for competitive exams'}
          </p>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right text-orange-400"></i>
    </div>

    <div>
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-lg text-gray-800">{lang === Language.HINDI ? 'लोकप्रिय विषय' : 'Popular Subjects'}</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map(sub => (
          <div 
            key={sub.id} 
            onClick={() => onSubjectSelect(sub)}
            className="bg-white p-3 rounded-2xl shadow-xs border border-gray-50 flex flex-col items-center gap-2 hover:border-blue-200 transition cursor-pointer active:bg-blue-50 active:scale-95"
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
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [lang]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.getDailyCurrentAffairs(lang);
      setData(res.news);
      setSources(res.sources);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to fetch current affairs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-500 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black leading-none">{lang === Language.HINDI ? 'आज की ताज़ा खबरें' : 'Today\'s Headlines'}</h2>
          <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl relative z-10 backdrop-blur-sm">
          <i className="fa-solid fa-newspaper"></i>
        </div>
        <i className="fa-solid fa-earth-asia absolute -right-4 -bottom-4 text-7xl opacity-10"></i>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 animate-pulse space-y-3">
              <div className="h-4 bg-gray-50 rounded w-1/4"></div>
              <div className="h-6 bg-gray-50 rounded"></div>
              <div className="h-3 bg-gray-50 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-center space-y-4">
          <i className="fa-solid fa-circle-exclamation text-rose-500 text-3xl"></i>
          <p className="text-rose-700 font-medium text-sm">{lang === Language.HINDI ? "डेटा लोड करने में समस्या आई।" : "Error loading data."}</p>
          <p className="text-rose-400 text-[10px] italic break-words">{error}</p>
          <button onClick={fetchData} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg">Retry</button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all hover:shadow-md">
              <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                {item.category || 'News'}
              </span>
              <h3 className="font-bold text-gray-800 text-base leading-tight mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.summary}</p>
            </div>
          ))}

          {sources.length > 0 && (
            <div className="bg-gray-100 p-5 rounded-2xl space-y-2 mt-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-3">Sources & References</h4>
              {sources.map((src, i) => (
                <a 
                  key={i} 
                  href={src.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-blue-600 text-xs font-bold hover:underline truncate"
                >
                  <i className="fa-solid fa-link mr-2"></i>
                  {src.title || src.uri}
                </a>
              ))}
            </div>
          )}

          <button 
            onClick={fetchData}
            className="w-full py-4 text-orange-600 font-bold text-sm bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 active:bg-orange-100 transition shadow-inner mt-4"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            {lang === Language.HINDI ? 'रिफ्रेश करें' : 'Refresh News'}
          </button>
        </div>
      )}
    </div>
  );
};

const SubjectDetailsScreen: React.FC<{ subject: Subject; lang: Language; setScreen: (s: AppScreen) => void; setTopic: (t: string) => void }> = ({ subject, lang, setScreen, setTopic }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const subName = lang === Language.HINDI ? subject.name.hi : subject.name.en;
        const prompt = `Provide a comprehensive exam-oriented overview for the subject: "${subName}". Include important topics, recent trends in competitive exams, and key facts to remember. Use markdown.`;
        const res = await geminiService.chatWithTeacher(prompt, [], lang);
        setContent(res || 'No content found.');
      } catch (e) {
        setContent('Error loading subject details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [subject, lang]);

  return (
    <div className="space-y-4">
      <div className={`${subject.color} p-6 rounded-3xl text-white shadow-lg flex items-center gap-4 relative overflow-hidden`}>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg relative z-10">
          <i className={`fa-solid ${subject.icon}`}></i>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black">{lang === Language.HINDI ? subject.name.hi : subject.name.en}</h2>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{lang === Language.HINDI ? 'संपूर्ण तैयारी' : 'Complete Preparation'}</p>
        </div>
        <i className={`fa-solid ${subject.icon} absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12`}></i>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => { setTopic(lang === Language.HINDI ? subject.name.hi : subject.name.en); setScreen(AppScreen.QUIZ); }}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-95 transition"
        >
          <i className="fa-solid fa-list-check text-blue-600"></i>
          {lang === Language.HINDI ? 'क्विज़ लें' : 'Take Quiz'}
        </button>
        <button 
          onClick={() => setScreen(AppScreen.AI_TEACHER)}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 font-black text-xs shadow-sm active:scale-95 transition"
        >
          <i className="fa-solid fa-comments text-emerald-600"></i>
          {lang === Language.HINDI ? 'डाउट पूछें' : 'Ask Doubts'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
          <i className="fa-solid fa-book-open text-blue-500"></i>
          {lang === Language.HINDI ? 'विषय का अवलोकन' : 'Subject Overview'}
        </h3>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-50 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-50 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-50 rounded animate-pulse w-5/6"></div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

const AITeacherScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === Language.HINDI ? 'नमस्ते! मैं सर्च अर्थ AI गुरु हूँ। आज आप क्या सीखना चाहते हैं?' : 'Namaste! I am Search Earth AI Guru. What would you like to learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.chatWithTeacher(input, messages, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'No response.' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message || "Connection error."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none border-gray-100'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 bg-gray-50 pt-2 z-10">
        <div className="bg-white p-2 rounded-2xl border flex gap-2 shadow-xl focus-within:border-blue-500 transition-colors">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={lang === Language.HINDI ? 'अपना सवाल यहाँ पूछें...' : 'Ask your question here...'}
            className="flex-1 px-3 py-2 outline-none text-sm bg-transparent"
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-blue-200"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudyPlannerScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [exam, setExam] = useState('');
  const [days, setDays] = useState('7');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    if (!exam) return;
    setLoading(true);
    setError(null);
    try {
      const data = await geminiService.generateStudyPlan(exam, parseInt(days), lang);
      setPlan(data);
    } catch (e: any) {
      setError(e.message || "Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!plan ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            <i className="fa-solid fa-calendar-alt"></i>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-800">{lang === Language.HINDI ? 'स्मार्ट स्टडी प्लान' : 'Smart Study Plan'}</h3>
            <p className="text-gray-400 text-xs mt-1">{lang === Language.HINDI ? 'AI द्वारा तैयार किया गया शेड्यूल' : 'AI-generated personalized schedule'}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{lang === Language.HINDI ? 'परीक्षा चुनें' : 'Select Exam'}</label>
              <select 
                value={exam} 
                onChange={e => setExam(e.target.value)}
                className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 bg-gray-50 text-sm font-bold transition"
              >
                <option value="">-- {lang === Language.HINDI ? 'चुनें' : 'Select'} --</option>
                {EXAMS.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{lang === Language.HINDI ? 'दिनों की संख्या' : 'Number of Days'}</label>
              <input 
                type="number" 
                value={days} 
                onChange={e => setDays(e.target.value)}
                className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 bg-gray-50 text-sm font-bold transition"
              />
            </div>
          </div>
          {error && <p className="text-rose-500 text-[10px] text-center italic">{error}</p>}
          <button 
            onClick={generatePlan}
            disabled={loading || !exam}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {lang === Language.HINDI ? 'प्लान बनाएं' : 'Create My Plan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-xl flex justify-between items-center sticky top-0 z-20">
            <div>
              <h3 className="font-black text-lg leading-tight">{plan.exam}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">{plan.duration}</p>
            </div>
            <button onClick={() => setPlan(null)} className="text-blue-600 bg-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition">
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
          {plan.schedule?.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                 <h4 className="font-black text-gray-700 text-[10px] uppercase tracking-[0.2em]">{day.day}</h4>
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="p-0">
                {day.slots?.map((slot: any, j: number) => (
                  <div key={j} className="flex border-b last:border-b-0 group hover:bg-gray-50 transition-colors">
                    <div className="w-28 bg-blue-50/30 p-4 flex flex-col items-center justify-center border-r border-gray-100 text-[9px] font-black text-blue-800 text-center uppercase tracking-tight">
                       {slot.time}
                    </div>
                    <div className="flex-1 p-4 text-xs text-gray-700 font-bold leading-relaxed">
                       {slot.activity}
                    </div>
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

const PhotoSearchScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        solveQuestion(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const solveQuestion = async (base64: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await geminiService.solvePhotoQuestion(base64, lang);
      setResult(res || 'Unable to identify the question.');
    } catch (e: any) {
      setError(e.message || 'Error processing image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {!image ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-200 text-center space-y-6">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-blue-300 relative">
            <i className="fa-solid fa-camera"></i>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white animate-bounce">AI</div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-blue-900 mb-2">{lang === Language.HINDI ? 'सवाल की फोटो लें' : 'Snap your Question'}</h3>
            <p className="text-blue-700 text-xs font-medium px-4 opacity-70 leading-relaxed">{lang === Language.HINDI ? 'गणित, विज्ञान या किसी भी विषय के सवालों का तुरंत हल पाएं' : 'Get instant solutions for Math, Science & more subjects'}</p>
          </div>
          <label className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl cursor-pointer hover:bg-blue-700 transition active:scale-95 flex items-center gap-3">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            {lang === Language.HINDI ? 'फोटो अपलोड करें' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 animate-in fade-in duration-300">
          <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-lg shrink-0 h-56">
            <img src={image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <button onClick={() => {setImage(null); setResult(null); setError(null);}} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-xl flex items-center justify-center border border-white/30 active:scale-90 transition">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative">
            <h4 className="font-black text-blue-800 text-xs uppercase tracking-[0.2em] mb-4 border-b pb-3 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              {lang === Language.HINDI ? 'AI द्वारा हल' : 'AI Solution'}
            </h4>
            {loading ? (
              <div className="space-y-4 py-4">
                <div className="h-4 bg-gray-50 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-50 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-50 rounded animate-pulse w-5/6"></div>
              </div>
            ) : error ? (
              <p className="text-rose-500 text-xs italic">{error}</p>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium prose prose-sm max-w-none prose-strong:text-blue-800">
                {result}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const QuizScreen: React.FC<{ lang: Language; initialTopic?: string }> = ({ lang, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (quiz.length > 0 && !showResult) {
      setTimeLeft(20);
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion(false);
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, quiz, showResult]);

  const startQuiz = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    setQuiz([]);
    setShowResult(false);
    setCurrentIndex(0);
    setScore(0);
    try {
      const data = await geminiService.generateQuiz(topic, 20, lang, difficulty);
      setQuiz(data);
    } catch (e: any) {
      setError(e.message || "Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);
    
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const difficultyLevels: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="h-full flex flex-col gap-4">
      {quiz.length === 0 ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-inner border border-blue-50">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800">{lang === Language.HINDI ? 'नया क्विज़ (20 सवाल)' : 'New Quiz (20 Questions)'}</h3>
            <p className="text-gray-400 text-xs mt-2 px-8 font-medium">{lang === Language.HINDI ? 'प्रत्येक सवाल के लिए 20 सेकंड मिलेंगे।' : 'Each question has a 20-second timer.'}</p>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === Language.HINDI ? 'कठिनाई का स्तर' : 'Difficulty Level'}</label>
              <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                {difficultyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      difficulty === level 
                        ? 'bg-white text-blue-600 shadow-sm scale-100' 
                        : 'text-gray-400 scale-95 hover:text-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{lang === Language.HINDI ? 'विषय' : 'Topic'}</label>
              <input 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-4 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 bg-gray-50 text-sm font-bold transition shadow-inner"
                placeholder={lang === Language.HINDI ? 'विषय लिखें...' : 'Type topic...'}
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-[10px] italic">{error}</p>}
          <button 
            onClick={startQuiz}
            disabled={loading || !topic}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-play"></i>}
            {lang === Language.HINDI ? 'क्विज़ शुरू करें' : 'Start Quiz'}
          </button>
        </div>
      ) : showResult ? (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-28 h-28 bg-gradient-to-tr from-yellow-400 to-orange-500 text-white rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-xl rotate-6">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-800">{lang === Language.HINDI ? 'आपका परिणाम' : 'Final Result'}</h2>
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-5xl font-black text-blue-600">{score} <span className="text-gray-300 text-2xl font-bold">/ {quiz.length}</span></p>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{difficulty} Level</span>
            </div>
          </div>
          <button onClick={() => setQuiz([])} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg">
            {lang === Language.HINDI ? 'दोबारा कोशिश करें' : 'Try Again'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Question {currentIndex + 1} of {quiz.length} ({difficulty})</span>
               <div className="h-2 w-40 bg-gray-100 rounded-full overflow-hidden mt-1.5 shadow-inner">
                 <div className="h-full bg-blue-600 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}></div>
               </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center font-black text-sm transition-all shadow-sm ${timeLeft < 5 ? 'border-rose-500 text-rose-500 bg-rose-50 animate-pulse' : 'border-blue-600 text-blue-600 bg-blue-50'}`}>
               <span className="text-[9px] leading-none uppercase tracking-tighter">Sec</span>
               <span className="text-xl leading-none">{timeLeft}</span>
            </div>
          </div>
          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden flex-1 flex flex-col">
            <h3 className="text-lg font-black text-gray-800 mb-8 leading-relaxed z-10">{quiz[currentIndex].question}</h3>
            <div className="space-y-3 z-10">
              {quiz[currentIndex].options?.map((opt: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => handleNextQuestion(i === quiz[currentIndex].correctAnswer)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-gray-700 text-sm flex items-center gap-3"
                >
                  <span className="w-8 h-8 bg-white border border-gray-100 rounded-xl text-center text-xs font-black leading-8 text-blue-600">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.HOME);
  const [lang, setLang] = useState<Language>(Language.HINDI);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizTopic, setQuizTopic] = useState('');

  const handleSubjectSelect = (sub: Subject) => {
    setSelectedSubject(sub);
    setActiveScreen(AppScreen.SUBJECTS);
  };

  const getTitle = () => {
    switch(activeScreen) {
      case AppScreen.AI_TEACHER: return lang === Language.HINDI ? 'AI गुरु' : 'AI Teacher';
      case AppScreen.PHOTO_SEARCH: return lang === Language.HINDI ? 'फोटो सर्च' : 'Photo Search';
      case AppScreen.QUIZ: return lang === Language.HINDI ? 'क्विज़' : 'Quiz';
      case AppScreen.PLANNER: return lang === Language.HINDI ? 'स्टडी प्लान' : 'Study Plan';
      case AppScreen.CURRENT_AFFAIRS: return lang === Language.HINDI ? 'करंट अफेयर्स' : 'Current Affairs';
      case AppScreen.SUBJECTS: return selectedSubject ? (lang === Language.HINDI ? selectedSubject.name.hi : selectedSubject.name.en) : 'Subject';
      case AppScreen.PROFILE: return lang === Language.HINDI ? 'प्रोफाइल' : 'Profile';
      default: return 'SEARCH EARTH';
    }
  };

  const renderScreen = () => {
    switch(activeScreen) {
      case AppScreen.HOME: 
        return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={handleSubjectSelect} lang={lang} />;
      case AppScreen.AI_TEACHER: 
        return <AITeacherScreen lang={lang} />;
      case AppScreen.PLANNER: 
        return <StudyPlannerScreen lang={lang} />;
      case AppScreen.PHOTO_SEARCH: 
        return <PhotoSearchScreen lang={lang} />;
      case AppScreen.QUIZ: 
        return <QuizScreen lang={lang} initialTopic={quizTopic} />;
      case AppScreen.CURRENT_AFFAIRS:
        return <CurrentAffairsScreen lang={lang} />;
      case AppScreen.SUBJECTS:
        return selectedSubject ? (
          <SubjectDetailsScreen 
            subject={selectedSubject} 
            lang={lang} 
            setScreen={setActiveScreen} 
            setTopic={setQuizTopic} 
          />
        ) : <HomeScreen setScreen={setActiveScreen} onSubjectSelect={handleSubjectSelect} lang={lang} />;
      case AppScreen.PROFILE: 
        return (
          <div className="space-y-6">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
               <div className="relative z-10">
                 <div className="w-28 h-28 bg-white rounded-[2.5rem] mx-auto mb-4 p-1.5 shadow-2xl">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh`} className="w-full h-full rounded-[2.2rem] bg-gray-50" />
                 </div>
                 <h3 className="text-2xl font-black text-gray-800">Rajesh Kumar</h3>
                 <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">UPSC Aspirant | Bihar</p>
               </div>
             </div>
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
               <button onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)} className="w-full p-5 flex justify-between items-center hover:bg-gray-50 transition border-b border-gray-100">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-language"></i>
                   </div>
                   <span className="font-bold text-sm text-gray-700">{lang === Language.HINDI ? 'भाषा (Hindi)' : 'Language (English)'}</span>
                 </div>
                 <i className="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
               </button>
             </div>
          </div>
        );
      default: return <HomeScreen setScreen={setActiveScreen} onSubjectSelect={handleSubjectSelect} lang={lang} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setScreen={setActiveScreen} title={getTitle()}>
      {renderScreen()}
    </Layout>
  );
};

export default App;
