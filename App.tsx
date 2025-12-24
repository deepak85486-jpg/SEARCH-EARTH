
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
          {lang === Language.HINDI ? 'सर्च अर्थ: आपकी सफलता का साथी' : 'Search Earth: Your Success Partner'}
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
      <div onClick={() => setScreen(AppScreen.PHOTO_SEARCH)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition group">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl group-active:scale-90 transition">
          <i className="fa-solid fa-camera-retro"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'फोटो हल' : 'Scan & Solve'}</p>
          <p className="text-[10px] text-gray-400">Instant AI solutions</p>
        </div>
      </div>
      <div onClick={() => setScreen(AppScreen.AI_TEACHER)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition group">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-active:scale-90 transition">
          <i className="fa-solid fa-brain"></i>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-800">{lang === Language.HINDI ? 'AI टीचर' : 'Ask AI Guru'}</p>
          <p className="text-[10px] text-gray-400">24/7 Expert Help</p>
        </div>
      </div>
    </div>

    {/* Current Affairs Highlight */}
    <div 
      onClick={() => setScreen(AppScreen.CURRENT_AFFAIRS)}
      className="bg-orange-50 border border-orange-100 p-4 rounded-2xl cursor-pointer hover:bg-orange-100 transition flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-sm">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div>
          <h4 className="font-bold text-orange-900 text-sm">
            {lang === Language.HINDI ? 'डेली करंट अफेयर्स' : 'Daily Current Affairs'}
          </h4>
          <p className="text-[10px] text-orange-700 font-medium">
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
            className="bg-white p-3 rounded-2xl shadow-xs border border-gray-50 flex flex-col items-center gap-2 hover:border-blue-200 transition cursor-pointer active:bg-blue-50"
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
  const [loading, setLoading] = useState(true);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKeyAndFetch = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        fetchData();
      }
    };
    checkKeyAndFetch();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await geminiService.getDailyCurrentAffairs(lang);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
    fetchData();
  };

  if (hasKey === false) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
          <i className="fa-solid fa-key"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{lang === Language.HINDI ? 'API की आवश्यक है' : 'API Key Required'}</h3>
        <p className="text-gray-500 text-sm">
          {lang === Language.HINDI 
            ? 'ताज़ा करंट अफेयर्स के लिए "Search" टूल का उपयोग होता है, जिसके लिए एक Paid API की की आवश्यकता है।' 
            : 'Latest Current Affairs uses real-time search which requires a Paid API Key selection.'}
        </p>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-600 text-xs underline font-medium">Billing Documentation</a>
        <button 
          onClick={openKeySelector}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg w-full"
        >
          {lang === Language.HINDI ? 'API की चुनें' : 'Select API Key'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-orange-500 p-6 rounded-3xl text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">{lang === Language.HINDI ? 'ताज़ा खबरें' : 'Today\'s Headlines'}</h2>
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
          <i className="fa-solid fa-newspaper"></i>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl border animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-5 bg-gray-100 rounded"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
           <i className="fa-solid fa-face-frown text-4xl mb-2"></i>
           <p>{lang === Language.HINDI ? 'कोई डेटा नहीं मिला।' : 'No data found.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition">
              <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                {item.category}
              </span>
              <h3 className="font-bold text-gray-800 text-base leading-tight mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.summary}</p>
            </div>
          ))}
          <button 
            onClick={fetchData}
            className="w-full py-4 text-orange-600 font-bold text-sm bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            {lang === Language.HINDI ? 'रिफ्रेश करें' : 'Refresh News'}
          </button>
        </div>
      )}
    </div>
  );
};

// --- SUBJECT DETAILS SCREEN ---
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
      <div className={`${subject.color} p-6 rounded-3xl text-white shadow-lg flex items-center gap-4`}>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">
          <i className={`fa-solid ${subject.icon}`}></i>
        </div>
        <div>
          <h2 className="text-2xl font-black">{lang === Language.HINDI ? subject.name.hi : subject.name.en}</h2>
          <p className="text-white/80 text-xs">{lang === Language.HINDI ? 'संपूर्ण तैयारी' : 'Complete Preparation'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => { setTopic(lang === Language.HINDI ? subject.name.hi : subject.name.en); setScreen(AppScreen.QUIZ); }}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95 transition"
        >
          <i className="fa-solid fa-list-check text-blue-600"></i>
          {lang === Language.HINDI ? 'क्विज़ लें' : 'Take Quiz'}
        </button>
        <button 
          onClick={() => setScreen(AppScreen.AI_TEACHER)}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95 transition"
        >
          <i className="fa-solid fa-comments text-emerald-600"></i>
          {lang === Language.HINDI ? 'डाउट पूछें' : 'Ask Doubts'}
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-book-open text-blue-500"></i>
          {lang === Language.HINDI ? 'विषय का अवलोकन' : 'Subject Overview'}
        </h3>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

// --- AI TEACHER SCREEN ---
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
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
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
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'
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
      <div className="sticky bottom-0 bg-gray-50 pt-2">
        <div className="bg-white p-2 rounded-2xl border flex gap-2 shadow-md focus-within:border-blue-500 transition-colors">
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
            className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-90"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STUDY PLANNER SCREEN ---
const StudyPlannerScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [exam, setExam] = useState('');
  const [days, setDays] = useState('7');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!exam) return;
    setLoading(true);
    try {
      const data = await geminiService.generateStudyPlan(exam, parseInt(days), lang);
      setPlan(data);
    } catch (e) {
      alert("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!plan ? (
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            <i className="fa-solid fa-calendar-alt"></i>
          </div>
          <h3 className="text-xl font-bold text-center">{lang === Language.HINDI ? 'स्मार्ट स्टडी प्लान' : 'Smart Study Plan'}</h3>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600">{lang === Language.HINDI ? 'परीक्षा चुनें' : 'Select Exam'}</label>
            <select 
              value={exam} 
              onChange={e => setExam(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none"
            >
              <option value="">-- {lang === Language.HINDI ? 'चुनें' : 'Select'} --</option>
              {EXAMS.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600">{lang === Language.HINDI ? 'दिनों की संख्या' : 'Number of Days'}</label>
            <input 
              type="number" 
              value={days} 
              onChange={e => setDays(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none"
            />
          </div>
          <button 
            onClick={generatePlan}
            disabled={loading || !exam}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
            {lang === Language.HINDI ? 'प्लान बनाएं' : 'Create My Plan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md flex justify-between items-center sticky top-0 z-10">
            <div>
              <h3 className="font-bold">{plan.exam}</h3>
              <p className="text-xs opacity-80">{plan.duration}</p>
            </div>
            <button onClick={() => setPlan(null)} className="text-white/80 bg-white/20 p-2 rounded-full"><i className="fa-solid fa-rotate-left"></i></button>
          </div>
          {plan.schedule.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                 <h4 className="font-black text-gray-700 text-sm uppercase tracking-widest">{day.day}</h4>
                 <i className="fa-solid fa-calendar-day text-blue-500"></i>
              </div>
              <div className="p-0">
                {day.slots.map((slot: any, j: number) => (
                  <div key={j} className="flex border-b last:border-b-0 group">
                    <div className="w-32 bg-blue-50/50 p-4 flex flex-col items-center justify-center border-r text-[10px] font-black text-blue-700 text-center uppercase tracking-tight">
                       {slot.time}
                    </div>
                    <div className="flex-1 p-4 text-sm text-gray-700 font-medium group-hover:bg-blue-50/20 transition-colors">
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

// --- PHOTO SEARCH SCREEN ---
const PhotoSearchScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await geminiService.solvePhotoQuestion(base64, lang);
      setResult(res || 'Unable to identify the question.');
    } catch (e) {
      setResult('Error processing image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {!image ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200 text-center">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl mb-4 shadow-xl">
            <i className="fa-solid fa-camera"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">{lang === Language.HINDI ? 'सवाल की फोटो लें' : 'Snap your Question'}</h3>
          <p className="text-blue-600 text-sm mb-6">{lang === Language.HINDI ? 'गणित, विज्ञान या किसी भी विषय के सवालों का तुरंत हल पाएं' : 'Get instant solutions for Math, Science & more'}</p>
          <label className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg cursor-pointer hover:bg-blue-700 transition active:scale-95">
            {lang === Language.HINDI ? 'फोटो अपलोड करें' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="relative rounded-2xl overflow-hidden border shadow-sm shrink-0">
            <img src={image} className="w-full h-48 object-cover" />
            <button onClick={() => {setImage(null); setResult(null);}} className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border shadow-sm">
            <h4 className="font-bold text-blue-800 mb-2 border-b pb-2 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              {lang === Language.HINDI ? 'AI द्वारा हल' : 'AI Solution'}
            </h4>
            {loading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- QUIZ SCREEN ---
const QuizScreen: React.FC<{ lang: Language; initialTopic?: string }> = ({ lang, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
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
    setQuiz([]);
    setShowResult(false);
    setCurrentIndex(0);
    setScore(0);
    try {
      const data = await geminiService.generateQuiz(topic, 20, lang);
      setQuiz(data);
    } catch (e) {
      alert("Error generating quiz");
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

  return (
    <div className="h-full flex flex-col gap-4">
      {quiz.length === 0 ? (
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{lang === Language.HINDI ? 'नया क्विज़ (20 सवाल)' : 'New Quiz (20 Questions)'}</h3>
          <p className="text-gray-500 text-sm">{lang === Language.HINDI ? 'प्रत्येक सवाल के लिए 20 सेकंड मिलेंगे।' : 'You will get 20 seconds for each question.'}</p>
          <input 
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 transition"
            placeholder={lang === Language.HINDI ? 'विषय लिखें (उदा: भारत का भूगोल)...' : 'Type topic...'}
          />
          <button 
            onClick={startQuiz}
            disabled={loading || !topic}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            {lang === Language.HINDI ? 'क्विज़ शुरू करें' : 'Start Quiz'}
          </button>
        </div>
      ) : showResult ? (
        <div className="bg-white p-8 rounded-3xl border shadow-lg text-center space-y-4 animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-blue-50">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{lang === Language.HINDI ? 'परिणाम' : 'Result'}</h2>
          <p className="text-4xl font-black text-blue-600">{score} / {quiz.length}</p>
          <p className="text-gray-500 font-medium">{score > 15 ? 'Excellent!' : 'Good Effort! Keep practicing.'}</p>
          <button onClick={() => setQuiz([])} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold active:scale-95 transition">
            {lang === Language.HINDI ? 'वापस जाएं' : 'Go Back'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {quiz.length}</span>
               <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden mt-1">
                 <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}></div>
               </div>
            </div>
            <div className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center font-bold text-sm transition-colors ${timeLeft < 5 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-blue-600 text-blue-600'}`}>
               <span className="text-[10px] leading-none uppercase">Sec</span>
               <span className="text-lg leading-none">{timeLeft}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">{quiz[currentIndex].question}</h3>
            <div className="space-y-3">
              {quiz[currentIndex].options.map((opt: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => handleNextQuestion(i === quiz[currentIndex].correctAnswer)}
                  className="w-full text-left p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-500 hover:bg-blue-50 transition font-medium text-gray-700 text-sm active:scale-95"
                >
                  <span className="inline-block w-6 h-6 bg-white border rounded-full text-center text-xs font-bold leading-5 mr-3 text-blue-600">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
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
          <div className="space-y-4">
             <div className="bg-white p-8 rounded-3xl border shadow-sm text-center">
               <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 p-1 shadow-lg">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" className="w-full h-full rounded-full bg-white" />
               </div>
               <h3 className="text-xl font-bold">Rajesh Kumar</h3>
               <p className="text-gray-400 text-xs">UPSC Aspirant | Bihar</p>
             </div>
             <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               <button onClick={() => setLang(l => l === Language.HINDI ? Language.ENGLISH : Language.HINDI)} className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition border-b">
                 <div className="flex items-center gap-3">
                   <i className="fa-solid fa-language text-blue-600 w-5"></i>
                   <span className="font-semibold text-sm">{lang === Language.HINDI ? 'भाषा (Hindi)' : 'Language (English)'}</span>
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
