import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  History,
  Home,
  ArrowLeft,
  Loader2,
  Database,
  ListFilter
} from 'lucide-react';
import { quizService, type Question } from './services/quizService';

// 初始模擬題目（完整題庫種子資料）
const INITIAL_SEED_DATA: Question[] = [
  {
    id: 1,
    question: "在機器學習中，下列哪一種方法主要用於降低資料維度並保留主要特徵？",
    options: ["(A) RNN", "(B) PCA", "(C) LSTM", "(D) CNN"],
    answer: 1,
    explanation: "主成分分析 (Principal Component Analysis, PCA) 是一種常用的線性降維技術。"
  },
  {
    id: 2,
    question: "關於 AI 應用規劃，為了確保模型決策的透明度，我們應避免將模型設計為？",
    options: ["(A) 可解釋的", "(B) 具備偏見監測的", "(C) 黑盒 (Black Box)", "(D) 符合法規的"],
    answer: 2,
    explanation: "黑盒化模型難以解釋其決策邏輯，在 iPAS AI 倫理與規劃中是應儘量避免或設法克服的挑戰。"
  },
  {
    id: 3,
    question: "在處理不平衡資料集 (Imbalanced Dataset) 時，下列哪一個指標比準確度 (Accuracy) 更能反映效能？",
    options: ["(A) F1-Score", "(B) Loss", "(C) Batch Size", "(D) Learning Rate"],
    answer: 0,
    explanation: "F1-Score 綜合考慮了召回率與精確率，是評估類別不平衡問題的重要指標。"
  },
  {
    id: 4,
    question: "下列何種技術允許在不直接交換原始數據的情況下進行分散式模型訓練？",
    options: ["(A) 轉移學習 (Transfer Learning)", "(B) 聯邦學習 (Federated Learning)", "(C) 強化學習 (Reinforcement Learning)", "(D) 對抗生成網絡 (GAN)"],
    answer: 1,
    explanation: "聯邦學習透過在本地裝置訓練並交換模型層參數，實現保護隱私的分散式協作。"
  },
  {
    id: 5,
    question: "卷積神經網路 (CNN) 常見於下列哪項 AI 應用領域？",
    options: ["(A) 自然語言處理 (NLP)", "(B) 電腦視覺 (Computer Vision)", "(C) 語音合成", "(D) 推薦系統"],
    answer: 1,
    explanation: "CNN 因其能夠有效提取影像空間特徵，被廣泛應用於電腦視覺與影像識別。"
  },
  {
    id: 6,
    question: "下列何者屬於「非監督式學習」演算法？",
    options: ["(A) SVM", "(B) Random Forest", "(C) K-Means", "(D) Logistic Regression"],
    answer: 2,
    explanation: "K-Means 是一種通過尋找資料點間相似性進行自動分群的非監督式演算法。"
  },
  {
    id: 7,
    question: "在 AI 專案規劃中，何者為驗證模型是否達成商業目標的最關鍵基準？",
    options: ["(A) 模型損失函數值", "(B) 關鍵績效指標 (KPI)", "(C) 程式碼行數", "(D) 硬體採購預算"],
    answer: 1,
    explanation: "商業專案應以指標 (KPI) 如轉換率、成本降低、效率提升來衡量成功，而非僅看純技術參數。"
  },
  {
    id: 8,
    question: "關於過擬合 (Overfitting) 的解決方案，下列何者「錯誤」？",
    options: ["(A) 增加訓練資料", "(B) 使用 Dropout", "(C) 增加模型複雜度", "(D) L2 正規化"],
    answer: 2,
    explanation: "增加模型複雜度通常會加劇過擬合，應透過簡化模型或增加約束來解決。"
  },
  {
    id: 9,
    question: "NLP 領域中，Transformer 模型的核心機制是？",
    options: ["(A) 卷積運算", "(B) 池化運算", "(C) 注意力機制 (Attention)", "(D) 門控單元"],
    answer: 2,
    explanation: "Attention 讓模型能同時處理序列中各位置之間的關係，是 Transformer 革命性的關鍵。"
  },
  {
    id: 10,
    question: "AI 系統中「偏見 (Bias)」可能產生的原因不包括？",
    options: ["(A) 訓練數據不平衡", "(B) 標籤過程的主觀性", "(C) 使用了 GPU 加速", "(D) 特徵選取的侷限性"],
    answer: 2,
    explanation: "GPU 只是運算硬體，不會直接導致模型邏輯上的偏見。"
  },
  {
    id: 11,
    question: "在影像分類任務中，CNN 的「池化層 (Pooling Layer)」主要功用為？",
    options: ["(A) 增加特徵數量", "(B) 減少計算量與維度", "(C) 執行激活函數", "(D) 處理全連接層"],
    answer: 1,
    explanation: "池化層用於降低空間解析度，保留特徵特性的同時減少參數量。"
  },
  {
    id: 12,
    question: "關於強化學習 (Reinforcement Learning)，模型學習的依據主要是？",
    options: ["(A) 帶標籤的答案", "(B) 資料分佈規律", "(C) 環境提供的獎勵", "(D) 數學公式"],
    answer: 2,
    explanation: "強化學習透過 Agent 與環境互動，根據累積獎勵 (Reward) 來優化策略。"
  },
  {
    id: 13,
    question: "下列何種技術主要用於保護隱私，使其無法反向推導回原始數據？",
    options: ["(A) 資料增強", "(B) 差分隱私 (DP)", "(C) 反向傳播", "(D) 遷移學習"],
    answer: 1,
    explanation: "Differential Privacy 通過向資料添加雜訊，在不影響統計效用的前提下保障個人隱私。"
  },
  {
    id: 14,
    question: "在機器學習工作流中，EDA 指的是？",
    options: ["(A) 專家開發分析", "(B) 探索性資料分析", "(C) 電子資料彙整", "(D) 演算法優化評估"],
    answer: 1,
    explanation: "Exploratory Data Analysis (EDA) 是建模前了解數據特性、分佈與異常點的檢索過程。"
  },
  {
    id: 15,
    question: "關於 AI 應用的數據安全，GDPR 規範主要起源於哪個區域？",
    options: ["(A) 美國", "(B) 日本", "(C) 歐洲", "(D) 台灣"],
    answer: 2,
    explanation: "一般資料保護規範 (GDPR) 是歐盟制定的個人隱私保護法例。"
  },
  {
    id: 16,
    question: "下列何者最適合用於處理時間序列資料 (Time Series)？",
    options: ["(A) CNN", "(B) RNN", "(C) K-Means", "(D) Decision Tree"],
    answer: 1,
    explanation: "RNN 具有過往資訊的記憶機制，非常適合處理依賴順序的序列資料。"
  },
  {
    id: 17,
    question: "模型驗證時，將資料集切分為三部分，其目的主要是？",
    options: ["(A) 減少資料量", "(B) 平衡類別比例", "(C) 評估泛化能力", "(D) 提高運算效率"],
    answer: 2,
    explanation: "切分測試集是為了在未見過的資料上驗證模型的實際表現 (泛化性)。"
  },
  {
    id: 18,
    question: "請問「損失函數 (Loss Function)」在訓練過程中的主要作用是？",
    options: ["(A) 計算正確率", "(B) 衡量預測差距", "(C) 加快載入資料", "(D) 決定硬體配置"],
    answer: 1,
    explanation: "Loss 用來衡量模型預測與目標之間的差異，是優化器的引導基礎。"
  },
  {
    id: 19,
    question: "智慧製造應用 AI 進行「預測性維護」的主要價值在於？",
    options: ["(A) 增加機台成本", "(B) 減少非預期停機", "(C) 提高工廠亮度", "(D) 替換人工操作"],
    answer: 1,
    explanation: "透過監測設備狀態預測故障，大幅降低突發故障導致的停線損失。"
  },
  {
    id: 20,
    question: "下列何者不屬於生成式 AI (Generative AI) 的典型應用？",
    options: ["(A) 圖像生成", "(B) 文字摘要", "(C) 分類垃圾信件", "(D) 程式碼完成"],
    answer: 2,
    explanation: "垃圾郵件分類屬於典型判別式 (Discriminative) 任務，而非生成新內容。"
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'quiz' | 'result' | 'wrong_list' | 'full_bank'>('home');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // 1. 初始化資料
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        console.log("Starting initial data load...");
        const questions = await quizService.getAllQuestions();
        console.log("Loaded questions count:", questions.length);
        setAllQuestions(questions);
        
        const saved = localStorage.getItem('iPAS_WrongQuestions');
        if (saved) {
          setWrongQuestions(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load initial questions:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const saveWrongQuestions = (newWrongIds: number[]) => {
    localStorage.setItem('iPAS_WrongQuestions', JSON.stringify(newWrongIds));
  };

  const handleSeedData = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      console.log("Seeding data...");
      await quizService.seedQuestions(INITIAL_SEED_DATA);
      console.log("Seeding complete, refetching...");
      const questions = await quizService.getAllQuestions();
      setAllQuestions(questions);
      alert("題庫同步與初始化成功！目前共 " + questions.length + " 題。");
    } catch (e) {
      console.error("Seeding failed:", e);
      alert("同步題庫失敗，請檢查資料庫權限或網絡連結");
    } finally {
      setSeeding(false);
    }
  };

  const startQuiz = async () => {
    if (quizLoading) return;
    
    // 如果 local 狀態沒題目，試著再去抓一次
    let targetQuestions = allQuestions;
    if (targetQuestions.length === 0) {
      setQuizLoading(true);
      try {
        const fresh = await quizService.getAllQuestions();
        setAllQuestions(fresh);
        targetQuestions = fresh;
      } catch (e) {
        console.error("Delayed load failed:", e);
      } finally {
        setQuizLoading(false);
      }
    }

    if (targetQuestions.length === 0) {
      alert("資料庫中尚無題庫內容，請點擊下方的【同步完整題庫內容】按鈕。");
      return;
    }

    setQuizLoading(true);
    try {
      console.log("Starting random quiz selection...");
      // 直接從當前已載入的 allQuestions 中隨機選，減少一次 Firestore 請求
      const selected = [...targetQuestions].sort(() => 0.5 - Math.random()).slice(0, 20);
      
      setCurrentQuiz(selected);
      setCurrentIndex(0);
      setUserAnswers(new Array(selected.length).fill(null));
      setScore(0);
      setView('quiz');
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("Quiz start failed:", e);
      alert("獲取測驗失敗：" + (e instanceof Error ? e.message : "未知錯誤"));
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let currentScore = 0;
    const newWrongIds = [...wrongQuestions];

    currentQuiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        currentScore += 1;
      } else {
        if (!newWrongIds.includes(q.id)) {
          newWrongIds.push(q.id);
        }
      }
    });

    setScore(currentScore);
    setWrongQuestions(newWrongIds);
    saveWrongQuestions(newWrongIds);
    setView('result');
  };

  const filteredWrongQuestions = useMemo(() => {
    return allQuestions.filter(q => wrongQuestions.includes(q.id));
  }, [allQuestions, wrongQuestions]);

  const clearHistory = () => {
    setWrongQuestions([]);
    localStorage.removeItem('iPAS_WrongQuestions');
  };

  if (loading && view === 'home') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">載入題庫中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center">
      <header className="w-full bg-white shadow-sm border-b border-slate-100 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">iPAS AI 應用規劃師</h1>
        </div>
        {view !== 'home' && (
          <button 
            onClick={() => setView('home')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Home className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </header>

      <main className="w-full max-w-md p-6 flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
                <h2 className="text-2xl font-bold mb-2 tracking-tight">準備好挑戰了嗎？</h2>
                <p className="text-blue-100 opacity-90 text-sm mb-6 leading-relaxed">定期練習是通過 iPAS AI 應用規劃師證照的最佳途徑。</p>
                <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-green-300" />
                  目前題庫：{allQuestions.length} 題
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={startQuiz}
                  disabled={quizLoading}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group text-left relative overflow-hidden"
                >
                  {quizLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg mb-1">隨機測驗</h3>
                      <p className="text-slate-500 text-sm">隨機抽取題目進行實力測試</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <RotateCcw className="text-blue-600 w-6 h-6" />
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setView('full_bank')}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group text-left"
                  >
                    <div className="flex flex-col gap-3">
                       <div className="bg-indigo-50 p-2.5 rounded-xl w-fit group-hover:bg-indigo-100 transition-colors">
                        <ListFilter className="text-indigo-600 w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">完整題庫</h3>
                    </div>
                  </button>

                  <button 
                    onClick={() => setView('wrong_list')}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 transition-all group text-left relative"
                  >
                    <div className="flex flex-col gap-3">
                       <div className="bg-red-50 p-2.5 rounded-xl w-fit group-hover:bg-red-100 transition-colors">
                        <History className="text-red-600 w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">錯題複習</h3>
                      {wrongQuestions.length > 0 && (
                        <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {wrongQuestions.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {allQuestions.length < 10 && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mt-4 backdrop-blur-sm">
                  <p className="text-blue-800 text-sm mb-4 font-bold flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    更新擴充題庫
                  </p>
                  <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                    偵測到目前題目量較少。系統已準備好 20 題專業模擬試題，點擊下方按鈕同步至資料庫。
                  </p>
                  <button
                    onClick={handleSeedData}
                    disabled={seeding}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    同步完整題庫內容
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em]">Question {currentIndex + 1} / {currentQuiz.length}</span>
                  <div className="h-1.5 w-48 bg-slate-200 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / currentQuiz.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold leading-relaxed mb-8">
                  {currentQuiz[currentIndex]?.question}
                </h3>
                
                <div className="space-y-3">
                  {currentQuiz[currentIndex]?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex justify-between items-center ${
                        userAnswers[currentIndex] === idx 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="font-medium text-sm">{option}</span>
                      {userAnswers[currentIndex] === idx && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={userAnswers[currentIndex] === null}
                onClick={nextQuestion}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-xl ${
                  userAnswers[currentIndex] === null
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentIndex === currentQuiz.length - 1 ? '提交成果' : '下一題'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl mb-2 relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
                <Trophy className="text-white w-16 h-16 relative z-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">測驗完成！</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your Performance Summary</p>
              </div>
              
              <div className="text-7xl font-black text-blue-600 mb-4 tracking-tighter">
                {Math.round((score / (currentQuiz.length || 1)) * 100)}
                <span className="text-2xl text-slate-300 ml-1">Pts</span>
              </div>

              <div className="w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 text-left">
                <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-slate-400">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  細節解析
                </h4>
                <div className="space-y-6 max-h-[35vh] overflow-y-auto pr-3 custom-scrollbar">
                  {currentQuiz.map((q, idx) => (
                    <div key={q.id} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3 mb-4">
                        {userAnswers[idx] === q.answer 
                          ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" /> 
                          : <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        }
                        <p className="text-sm font-bold leading-relaxed">{q.question}</p>
                      </div>
                      <div className="ml-8 space-y-2">
                        <div className="text-xs bg-slate-50 text-slate-500 p-3 rounded-xl border border-slate-100">
                          <span className="font-black text-blue-600 mr-2 uppercase">Correct:</span>
                          {q.options[q.answer]}
                        </div>
                        <div className="text-xs bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 leading-relaxed">
                          <span className="font-black mr-2 opacity-50 uppercase">Analysis:</span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setView('home')}
                  className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  返回主頁
                </button>
                <button 
                  onClick={startQuiz}
                  className="py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  重新挑戰
                </button>
              </div>
            </motion.div>
          )}

          {(view === 'wrong_list' || view === 'full_bank') && (
            <motion.div 
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-2xl sticky top-0 z-20">
                <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors p-2 font-bold text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                {view === 'wrong_list' && wrongQuestions.length > 0 && (
                  <button onClick={clearHistory} className="text-red-500 text-xs font-black uppercase tracking-wider p-2">Clear Records</button>
                )}
              </div>

              <div className="px-2">
                <h2 className="text-2xl font-black tracking-tight mb-1">
                  {view === 'wrong_list' ? '錯題複習' : '完整題庫'}
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {view === 'wrong_list' ? `${wrongQuestions.length} Items Found` : `${allQuestions.length} Questions Loaded`}
                </p>
              </div>

              {(view === 'wrong_list' ? filteredWrongQuestions : allQuestions).length === 0 ? (
                <div className="bg-white p-16 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <BookOpen className="text-slate-200 w-10 h-10" />
                  </div>
                  <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">Nothing here yet</p>
                </div>
              ) : (
                <div className="space-y-4 pb-12">
                  {(view === 'wrong_list' ? filteredWrongQuestions : allQuestions).map((q) => (
                    <motion.div 
                      key={q.id}
                      layout
                      className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                      <h4 className="font-bold mb-6 leading-relaxed text-slate-800">{q.question}</h4>
                      <div className="space-y-2 mb-6">
                        {q.options.map((opt, idx) => (
                          <div 
                            key={idx}
                            className={`p-4 rounded-xl text-sm border transition-colors ${idx === q.answer ? 'bg-green-50 text-green-700 border-green-100 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                          >
                            <span className="flex items-center gap-2">
                              {idx === q.answer && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Explanation</span>
                        </div>
                        <p className="text-sm text-blue-800/80 leading-relaxed italic">{q.explanation}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-12 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Designed for iPAS Excellence · 2026</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
