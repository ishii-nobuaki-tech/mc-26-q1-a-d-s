import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Users, Calendar, RefreshCw, ChevronDown, ChevronUp, HelpCircle, BarChart2, PieChart, AlertCircle } from 'lucide-react';

// --- Types ---

interface DetailItem {
  label: string | null;
  formula: string;
  calculation: string;
  result: string;
  unit: string;
}

interface ResultsState {
  primaryMetric: number;
  primaryLabel: string;
  sacOrArpu: number;
  sacLabel: string | null;
  profit: number;
  roi: number;
  isProfit: boolean;
  details: DetailItem[];
  isValid: boolean;
  error?: string;
}

interface CategoryDef {
  id: string;
  name: string;
  number: string;
}

type CharacterVariant = 'normal' | 'fun' | 'sad';

// --- Constants ---

const CATEGORIES: Record<string, CategoryDef> = {
  ACQUISITION: { id: 'acquisition', name: '① 獲得', number: '①' },
  RETURN: { id: 'return', name: '② 呼び戻す', number: '②' },
  CHURN: { id: 'churn', name: '③ 解約抑止・継続促進', number: '③' },
  UPSELL: { id: 'upsell', name: '④ アップセル', number: '④' },
  CROSSSELL: { id: 'crosssell', name: '④ クロスセル', number: '④' },
};

const LTV_ACQUISITION = {
  OVERALL: 14832,
  PRO_BASEBALL: 17716,
  F1: 14539,
  HALLYU: 10843,
  BASIC: 32081,
  OTHERS: 10293
};

const LTV_RETURN = {
  OVERALL: 5879,
  PRO_BASEBALL: 8273,
  F1: 5855,
  HALLYU: 3876,
  BASIC: 24336,
  OTHERS: 4599
};

const UPSELL_DURATIONS = {
  PRO_BASEBALL: 7.3,
  F1: 7.3,
  HALLYU: 7.2,
  BASIC: 17.1,
  OTHERS: 6.6
};

const CROSSSELL_DURATIONS = {
  PRO_BASEBALL: 11.0,
  F1: 12.3,
  HALLYU: 9.9,
  BASIC: 30.7,
  OTHERS: 12.4
};

const UPSELL_DURATION_OVERALL = 7.1;
const CROSSSELL_DURATION_OVERALL = 12.8;

// --- Sub Components ---

const SukappyIcon: React.FC<{ className?: string; variant?: CharacterVariant }> = ({ className = "", variant = 'normal' }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sukappyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M100 50 L100 20" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" />
    <circle cx="100" cy="20" r="8" fill="#FFA500" />
    <ellipse cx="100" cy="120" rx="60" ry="50" fill="url(#sukappyGrad)" />
    <g fill="white">
      <ellipse cx="80" cy="110" rx="15" ry="18" />
      <ellipse cx="120" cy="110" rx="15" ry="18" />
    </g>
    <g fill="black">
      <circle cx="80" cy="110" r="5" />
      <circle cx="120" cy="110" r="5" />
    </g>
    {variant === 'fun' ? (
      <path d="M90 135 Q100 145 110 135" stroke="#d97706" strokeWidth="3" fill="none" />
    ) : variant === 'sad' ? (
      <>
        <path d="M90 140 Q100 130 110 140" stroke="#d97706" strokeWidth="3" fill="none" />
        <path d="M70 115 Q65 125 70 135" stroke="#3eb6e6" strokeWidth="2" fill="#a5f3fc" />
        <path d="M130 115 Q135 125 130 135" stroke="#3eb6e6" strokeWidth="2" fill="#a5f3fc" />
      </>
    ) : (
      <path d="M90 135 Q100 140 110 135" stroke="#d97706" strokeWidth="3" fill="none" />
    )}
    {variant === 'fun' ? (
      <>
        <path d="M45 120 Q30 110 40 90" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M155 120 Q170 110 160 90" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
      </>
    ) : variant === 'sad' ? (
      <>
        <path d="M45 110 Q30 130 40 140" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M155 110 Q170 130 160 140" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <path d="M45 120 Q30 110 40 90" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M155 115 Q165 125 160 135" stroke="#FFA500" strokeWidth="8" strokeLinecap="round" fill="none" />
      </>
    )}
  </svg>
);

const SukappyImage: React.FC<{ variant: CharacterVariant }> = ({ variant }) => {
  const [imgError, setImgError] = useState(false);
  const happyImage = `${import.meta.env.BASE_URL}skappy_fun.png`;
  const sadImage = `${import.meta.env.BASE_URL}skappy_sad.png`;
  const normalImage = `${import.meta.env.BASE_URL}skappy_normal.png`;

  useEffect(() => { setImgError(false); }, [variant]);

  let currentImage = normalImage;
  let altText = "スカッピー";

  switch (variant) {
    case 'fun': currentImage = happyImage; altText = "大喜びのスカッピー"; break;
    case 'sad': currentImage = sadImage; altText = "悲しむスカッピー"; break;
    case 'normal': default: currentImage = normalImage; altText = "通常のスカッピー"; break;
  }

  if (imgError) {
    return (
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        <SukappyIcon className="w-full h-full animate-bounce-slow drop-shadow-xl" variant={variant} />
      </div>
    );
  }

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 transition-transform duration-500 hover:scale-110">
      <img
        src={currentImage}
        alt={altText}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain drop-shadow-xl animate-bounce-slow"
      />
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  suffix?: string;
  placeholder?: string;
  step?: string;
  error?: boolean;
  compact?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, icon: Icon, suffix, placeholder, step, error, compact = false, className = "" }) => {
  const getDisplayValue = (val: string | number) => {
    if (val === '' || val === null || val === undefined) return '';
    const strVal = val.toString();
    
    // Split into integer and decimal parts to preserve trailing zeros and dots during typing
    if (strVal.includes('.')) {
      const parts = strVal.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formattedInteger = integerPart === '' ? '' : 
        (isNaN(Number(integerPart)) ? integerPart : new Intl.NumberFormat('ja-JP').format(Number(integerPart)));
      return `${formattedInteger}.${decimalPart}`;
    }
    
    const num = parseFloat(strVal);
    if (isNaN(num)) return strVal;
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/,/g, '');
    // Allow empty string, numeric characters, and a single decimal point
    if (rawValue === '' || /^-?\d*\.?\d*$/.test(rawValue)) {
      onChange(rawValue);
    }
  };

  const marginClass = className.includes('mb-') ? '' : (compact ? 'mb-0' : 'mb-5');

  return (
    <div className={`${marginClass} ${className} group`}>
      <label className={`block ${compact ? 'text-xs' : 'text-xs uppercase tracking-wider'} font-bold text-gray-500 ${compact ? 'mb-1.5' : 'mb-2'} flex items-center gap-1.5 transition-colors group-focus-within:text-[#29a1c0]`}>
        {Icon && <Icon size={compact ? 14 : 16} className={error ? "text-red-500" : "text-gray-400 group-focus-within:text-[#29a1c0] transition-colors"} />}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={getDisplayValue(value)}
          onChange={handleChange}
          className={`w-full ${compact ? 'p-2 pl-3 text-sm' : 'p-3.5 pl-4 pr-12 text-lg'} border-0 rounded-2xl transition-all font-semibold shadow-sm placeholder-gray-300
            ${error 
              ? "bg-red-50 text-red-700 ring-2 ring-red-100 focus:ring-red-300" 
              : "bg-gray-50 text-gray-800 hover:bg-white focus:bg-white focus:ring-4 focus:ring-[#29a1c0]/20 ring-1 ring-gray-100"
            } focus:outline-none`}
          placeholder={placeholder}
        />
        {suffix && (
          <span className={`absolute ${compact ? 'right-3' : 'right-4'} top-1/2 -translate-y-1/2 font-bold ${compact ? 'text-xs' : 'text-sm'} ${error ? "text-red-400" : "text-gray-400"}`}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string | number; unit: string; highlight?: boolean; subtitle?: string; disabled?: boolean }> = ({ label, value, unit, highlight = false, subtitle, disabled = false }) => (
  <div className={`relative overflow-hidden p-5 md:p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[120px] ${
    disabled 
      ? 'bg-gray-50 border border-gray-100 text-gray-300'
      : highlight
        ? 'bg-gradient-to-br from-[#29a1c0] to-[#3eb6e6] text-white shadow-xl shadow-cyan-200/50 scale-[1.02]'
        : 'bg-white border border-gray-100 text-gray-800 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1'
  }`}>
    <div className="relative z-10">
      <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 truncate opacity-90 ${disabled ? 'text-gray-300' : highlight ? 'text-cyan-50' : 'text-gray-400'}`}>
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-2xl md:text-3xl lg:text-4xl font-black tracking-tight ${disabled ? 'text-gray-300' : highlight ? 'text-white' : 'text-slate-800'}`}>
          {disabled ? '---' : value}
        </span>
        <span className={`text-sm font-bold ${disabled ? 'text-gray-300' : highlight ? 'text-cyan-100' : 'text-gray-400'}`}>
          {disabled ? '' : unit}
        </span>
      </div>
      {subtitle && <div className={`text-xs mt-2 ${disabled ? 'text-gray-300' : highlight ? 'text-cyan-100' : 'text-gray-400'}`}>{subtitle}</div>}
    </div>
    {/* Decorative background element */}
    <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl ${highlight ? 'bg-white/20' : 'bg-gray-100'}`}></div>
  </div>
);

const DetailRow: React.FC<DetailItem> = ({ label, formula, calculation, result, unit }) => (
  <div className="py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
    <div className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#29a1c0]"></div>
      {label}
    </div>
    <div className="text-xs text-slate-400 font-mono mb-2 pl-3.5">{formula}</div>
    <div className="flex flex-wrap items-center gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 ml-3.5">
      <span className="font-mono text-slate-600 break-all">{calculation}</span>
      <span className="text-slate-300">=</span>
      <span className="font-bold text-[#29a1c0] whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{result}<span className="text-xs ml-0.5 font-normal">{unit}</span></span>
    </div>
  </div>
);

export default function EffectCalculator() {
  const [category, setCategory] = useState(CATEGORIES.ACQUISITION.id);
  const [activeTab, setActiveTab] = useState<'single' | 'regular'>('single');
  const [showDetails, setShowDetails] = useState(false);
  const [isOverallMode, setIsOverallMode] = useState(false);
 
  // Inputs (Standard)
  const [targetCount, setTargetCount] = useState('');
  const [cvr, setCvr] = useState('');
  const [cost, setCost] = useState('');
  const [duration, setDuration] = useState('');
 
  // Ratios (Acquisition/Return/Upsell/Crosssell Specific)
  const [ratioProBaseball, setRatioProBaseball] = useState('100');
  const [ratioF1, setRatioF1] = useState('0');
  const [ratioHallyu, setRatioHallyu] = useState('0');
  const [ratioBasic, setRatioBasic] = useState('0');
  const [ratioOthers, setRatioOthers] = useState('0');

  // Inputs (Upsell/Crosssell)
  const [priceAfter, setPriceAfter] = useState('');

  const [results, setResults] = useState<ResultsState>({
    primaryMetric: 0,
    primaryLabel: '',
    sacOrArpu: 0,
    sacLabel: '',
    profit: 0,
    roi: 0,
    isProfit: true,
    details: [],
    isValid: true
  });

  const currentLtvSet = category === CATEGORIES.ACQUISITION.id ? LTV_ACQUISITION : LTV_RETURN;

  // Reset overall mode when category changes
  useEffect(() => {
    setIsOverallMode(false);
  }, [category]);

  useEffect(() => {
    const numCost = parseFloat(cost) || 0;
    const numDuration = parseFloat(duration) || 1;
    const isRegular = activeTab === 'regular';
    const effectiveDuration = isRegular ? numDuration : 1;
   
    let primaryMetric = 0;
    let primaryLabel = '';
    let sacOrArpu = 0;
    let sacLabel: string | null = '';
    let profit = 0;
    let roi = 0;
    let details: DetailItem[] = [];
    let isValid = true;
    let error = "";
   
    const f = (v: number) => new Intl.NumberFormat('ja-JP').format(v || 0);
    const fc = (v: number) => new Intl.NumberFormat('ja-JP').format(Math.round(v || 0));

    // --- HELPER FOR RATIO VALIDATION ---
    const checkRatio = () => {
      // Overall mode for Acquisition/Return/Upsell/Crosssell skips ratio check
      if (isOverallMode && (
          category === CATEGORIES.ACQUISITION.id || 
          category === CATEGORIES.RETURN.id || 
          category === CATEGORIES.UPSELL.id ||
          category === CATEGORIES.CROSSSELL.id
        )) {
        return { valid: true, msg: '', rPB: 0, rF1: 0, rHL: 0, rBS: 0, rOT: 0 };
      }
      const rPB = parseFloat(ratioProBaseball) || 0;
      const rF1 = parseFloat(ratioF1) || 0;
      const rHL = parseFloat(ratioHallyu) || 0;
      const rBS = parseFloat(ratioBasic) || 0;
      const rOT = parseFloat(ratioOthers) || 0;
      const totalRatio = rPB + rF1 + rHL + rBS + rOT;
      if (Math.round(totalRatio) !== 100) {
        return { valid: false, msg: `比率の合計が${totalRatio}%です。試算には100%にする必要があります。`, rPB, rF1, rHL, rBS, rOT };
      }
      return { valid: true, msg: '', rPB, rF1, rHL, rBS, rOT };
    };

    if (category === CATEGORIES.ACQUISITION.id || category === CATEGORIES.RETURN.id) {
      const isReturn = category === CATEGORIES.RETURN.id;
      const ltvSet = isReturn ? LTV_RETURN : LTV_ACQUISITION;
      primaryLabel = isReturn ? '想定再加入者数' : '想定新規加入者数';
      sacLabel = '想定SAC';
     
      const numTarget = parseFloat(targetCount) || 0;
      const numCvr = parseFloat(cvr) || 0;
      const totalSubs = Math.floor(numTarget * (numCvr / 100));
      primaryMetric = totalSubs;

      const { valid, msg, rPB, rF1, rHL, rBS, rOT } = checkRatio();
      if (!valid) { isValid = false; error = msg; }

      if (isValid) {
        let grossProfit = 0;

        if (isOverallMode) {
          grossProfit = totalSubs * ltvSet.OVERALL;
          
          details.push({
            label: primaryLabel,
            formula: '施策の対象顧客数 × 想定CVR',
            calculation: `${f(numTarget)}人 × ${f(numCvr)}%`,
            result: f(primaryMetric),
            unit: '人'
          });
          details.push({
            label: '総粗利',
            formula: `想定加入者数 × ${isReturn ? '全体想定LTV（粗利）' : '全体想定LTV（粗利）'}`,
            calculation: `${f(totalSubs)}人 × ${f(ltvSet.OVERALL)}円`,
            result: f(grossProfit),
            unit: '円'
          });
        } else {
          const nPB = Math.round(totalSubs * (rPB / 100));
          const nF1 = Math.round(totalSubs * (rF1 / 100));
          const nHL = Math.round(totalSubs * (rHL / 100));
          const nBS = Math.round(totalSubs * (rBS / 100));
          const nOT = Math.round(totalSubs * (rOT / 100));

          grossProfit = 
            (nPB * ltvSet.PRO_BASEBALL) +
            (nF1 * ltvSet.F1) +
            (nHL * ltvSet.HALLYU) +
            (nBS * ltvSet.BASIC) +
            (nOT * ltvSet.OTHERS);

          details.push({
            label: primaryLabel,
            formula: '施策の対象顧客数 × 想定CVR',
            calculation: `${f(numTarget)}人 × ${f(numCvr)}%`,
            result: f(primaryMetric),
            unit: '人'
          });
          details.push({
            label: isReturn ? '各ジャンルの再加入者数' : '各ジャンルの新規加入者数',
            formula: isReturn ? '想定再加入者数（総数） × 加入者構成比率' : '想定新規加入者数（総数） × 加入者構成比率',
            calculation: `プロ野球:${f(nPB)}人, F1:${f(nF1)}人, 韓流:${f(nHL)}人, 基本プラン:${f(nBS)}人, その他:${f(nOT)}人`,
            result: f(primaryMetric),
            unit: '人'
          });
          details.push({
            label: '総粗利',
            formula: isReturn ? '∑(各ジャンルの再加入者数 × 各ジャンルの想定LTV（粗利）)' : '∑(各ジャンルの新規加入者数 × 各ジャンルの想定LTV（粗利）)',
            calculation: `(${f(nPB)}×${f(ltvSet.PRO_BASEBALL)}) + (${f(nF1)}×${f(ltvSet.F1)}) + (${f(nHL)}×${f(ltvSet.HALLYU)}) + (${f(nBS)}×${f(ltvSet.BASIC)}) + (${f(nOT)}×${f(ltvSet.OTHERS)})`,
            result: f(grossProfit),
            unit: '円'
          });
        }

        profit = (grossProfit * effectiveDuration) - numCost;
        sacOrArpu = (primaryMetric > 0) ? (numCost / primaryMetric / effectiveDuration) : 0;

        details.push({
          label: '想定利益',
          formula: isRegular ? '総粗利 × 期間 － 施策コスト' : '総粗利 － 施策コスト',
          calculation: isRegular 
            ? `${f(grossProfit)}円 × ${f(effectiveDuration)}ヶ月 － ${f(numCost)}円`
            : `${f(grossProfit)}円 － ${f(numCost)}円`,
          result: fc(profit),
          unit: '円'
        });
      }

    } else if (category === CATEGORIES.CHURN.id) {
      const ARPU = 2273;
      const MARGIN_RATE = 0.3;
      primaryLabel = '想定解約抑止顧客数';
      sacLabel = null;
      const numTarget = parseFloat(targetCount) || 0;
      const numCvr = parseFloat(cvr) || 0;
      primaryMetric = Math.floor(numTarget * (numCvr / 100));
      profit = (primaryMetric * ARPU * MARGIN_RATE * effectiveDuration) - numCost;
      sacOrArpu = 0;

      details.push({
        label: primaryLabel, formula: '施策の対象顧客数 × 解約率改善幅',
        calculation: `${f(numTarget)}人 × ${f(numCvr)}%`,
        result: f(primaryMetric), unit: '人'
      });
      details.push({
        label: '想定利益', 
        formula: isRegular 
          ? '想定解約抑止顧客数 × 想定ARPU × 粗利率（0.3） × 期間 － 施策コスト' 
          : '想定解約抑止顧客数 × 想定ARPU × 粗利率（0.3） － 施策コスト',
        calculation: isRegular
          ? `${f(primaryMetric)}人 × ${f(ARPU)}円 × 0.3 × ${f(effectiveDuration)}ヶ月 － ${f(numCost)}円`
          : `${f(primaryMetric)}人 × ${f(ARPU)}円 × 0.3 － ${f(numCost)}円`,
        result: fc(profit), unit: '円'
      });

    } else if (category === CATEGORIES.UPSELL.id || category === CATEGORIES.CROSSSELL.id) {
      const isUpsell = category === CATEGORIES.UPSELL.id;
      const term = isUpsell ? 'アップセル' : 'クロスセル';
      const MARGIN_RATE = 0.3;
      
      primaryLabel = `${term}の想定顧客数`;
      sacLabel = 'ARPUの想定増加額';
      
      const numTarget = parseFloat(targetCount) || 0;
      const numCvr = parseFloat(cvr) || 0;
      // Calculate successful conversions based on target and CVR
      primaryMetric = Math.floor(numTarget * (numCvr / 100));

      const hasPriceAfter = priceAfter !== '' && !isNaN(parseFloat(priceAfter));
      const pAfter = hasPriceAfter ? parseFloat(priceAfter) : 0;
      const pBefore = 1200;
      
      // LOGIC DIFFERENCE: Cross-sell uses the full price as increase, Upsell uses the difference
      if (isUpsell) {
        sacOrArpu = hasPriceAfter ? (pAfter - pBefore) : 0;
      } else {
        sacOrArpu = hasPriceAfter ? pAfter : 0;
      }

      const { valid, msg, rPB, rF1, rHL, rBS, rOT } = checkRatio();
      if (!valid) { isValid = false; error = msg; }

      if (isValid) {
        let totalUserMonths = 0;
        let nPB = 0, nF1 = 0, nHL = 0, nBS = 0, nOT = 0;

        // NEW LOGIC: Upsell and Crosssell Overall Mode
        if (isOverallMode) {
          const durationVal = isUpsell ? UPSELL_DURATION_OVERALL : CROSSSELL_DURATION_OVERALL;
          const durationName = isUpsell ? 'アップセル後の推定継続期間' : 'クロスセル後の推定継続期間';
          totalUserMonths = primaryMetric * durationVal;
          details.push({
             label: '総継続月数', formula: `${term}の想定顧客数 × 全体の${durationName}`,
             calculation: `${f(primaryMetric)}人 × ${durationVal}ヶ月`,
             result: f(totalUserMonths), unit: 'ヶ月'
           });
        } else {
          // Break down the primary metric (successful upsells/cross-sells)
          nPB = Math.round(primaryMetric * (rPB / 100));
          nF1 = Math.round(primaryMetric * (rF1 / 100));
          nHL = Math.round(primaryMetric * (rHL / 100));
          nBS = Math.round(primaryMetric * (rBS / 100));
          nOT = Math.round(primaryMetric * (rOT / 100));

          // Calculate total user-months of benefit
          const durations = isUpsell ? UPSELL_DURATIONS : CROSSSELL_DURATIONS;
          totalUserMonths = 
            (nPB * durations.PRO_BASEBALL) +
            (nF1 * durations.F1) +
            (nHL * durations.HALLYU) +
            (nBS * durations.BASIC) +
            (nOT * durations.OTHERS);

          details.push({
            label: `各ジャンルの${term}顧客数`, formula: `${term}の想定顧客数 × ${term}顧客構成比率`,
            calculation: `プロ野球:${f(nPB)}, F1:${f(nF1)}, 韓流:${f(nHL)}, 基本プラン:${f(nBS)}, その他:${f(nOT)}`,
            result: f(primaryMetric), unit: '人'
          });
          const durationLabel = isUpsell ? 'アップセル後の推定継続期間' : 'クロスセル後の推定継続期間';
          details.push({
            label: '総継続月数', formula: `∑(各ジャンルの${term}顧客数 × 各ジャンルの${durationLabel})`,
            calculation: `(${f(nPB)}×${durations.PRO_BASEBALL})+(${f(nF1)}×${durations.F1})+(${f(nHL)}×${durations.HALLYU})+(${f(nBS)}×${durations.BASIC})+(${f(nOT)}×${durations.OTHERS})`,
            result: f(totalUserMonths), unit: 'ヶ月'
          });
        }

        // Revenue component: Total User Months * ARPU Increase * Margin
        const totalRevenue = totalUserMonths * sacOrArpu * MARGIN_RATE;

        // Apply regular duration multiplier if necessary
        profit = (totalRevenue * effectiveDuration) - numCost;

        details.unshift({
          label: primaryLabel, formula: '施策の対象顧客数 × 想定CVR',
          calculation: `${f(numTarget)}人 × ${f(numCvr)}%`,
          result: f(primaryMetric), unit: '人'
        });
        
        // LOGIC DIFFERENCE: Details for ARPU calculation
        if (isUpsell) {
          details.splice(1, 0, {
            label: sacLabel, formula: `${term}後の平均商品単価 - ${term}前の平均商品単価(¥1,200)`,
            calculation: hasPriceAfter ? `${f(pAfter)}円 － 1,200円` : '(未入力) － 1,200円',
            result: fc(sacOrArpu), unit: '円'
          });
        } else {
           details.splice(1, 0, {
            label: sacLabel, formula: 'クロスセル対象商品の価格',
            calculation: hasPriceAfter ? `${f(pAfter)}円` : '(未入力)',
            result: fc(sacOrArpu), unit: '円'
          });
        }
        
        details.push({
          label: '想定利益', formula: isRegular ? '総継続月数 × ARPUの想定増加額 × 0.3 × 期間 － 施策コスト' : '総継続月数 × ARPUの想定増加額 × 0.3 － 施策コスト',
          calculation: isRegular
            ? `(${f(totalUserMonths)} × ${f(sacOrArpu)} × 0.3) × ${f(effectiveDuration)} － ${f(numCost)}`
            : `(${f(totalUserMonths)} × ${f(sacOrArpu)} × 0.3) － ${f(numCost)}`,
          result: fc(profit), unit: '円'
        });
      }
    }

    if (isValid) {
      roi = numCost > 0 ? (profit / numCost) * 100 : 0;
      details.push({
        label: '想定ROI', formula: '想定利益 ÷ 施策コスト × 100',
        calculation: `${fc(profit)}円 ÷ ${f(numCost)}円 × 100`,
        result: fc(roi), unit: '%'
      });
    }

    setResults({ primaryMetric, primaryLabel, sacOrArpu, sacLabel, profit, roi, isProfit: profit >= 0, details, isValid, error });
  }, [category, activeTab, targetCount, cvr, cost, duration, priceAfter, ratioProBaseball, ratioF1, ratioHallyu, ratioBasic, ratioOthers, isOverallMode]);

  const formatCurrency = (num: number) => new Intl.NumberFormat('ja-JP').format(Math.round(num));
  const formatNumber = (num: number) => new Intl.NumberFormat('ja-JP').format(num);

  const isAcqRatioMode = category === CATEGORIES.ACQUISITION.id || category === CATEGORIES.RETURN.id;
  const isUpsellRatioMode = category === CATEGORIES.UPSELL.id || category === CATEGORIES.CROSSSELL.id;
  
  const currentRatioTotal = (parseFloat(ratioProBaseball) || 0) + (parseFloat(ratioF1) || 0) + (parseFloat(ratioHallyu) || 0) + (parseFloat(ratioBasic) || 0) + (parseFloat(ratioOthers) || 0);
  const isRatioInvalid = (isAcqRatioMode || (isUpsellRatioMode && !isOverallMode)) && !isOverallMode && currentRatioTotal !== 100;
  
  const ltvSuffix = category === CATEGORIES.RETURN.id ? '（再加入）' : '（新規加入）';

  let characterVariant: CharacterVariant = 'normal';
  if (isRatioInvalid) {
    characterVariant = 'sad';
  } else if (results.profit === 0 && !cost) {
    characterVariant = 'normal';
  } else {
    characterVariant = results.profit >= 0 ? 'fun' : 'sad';
  }

  // Helper to render Ratio Inputs
  const RatioInputs = () => (
    <div className="mt-6 mb-6 p-4 bg-white/50 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-gray-600 flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart size={14} className="text-[#29a1c0]" />
          {isUpsellRatioMode ? `${category === CATEGORIES.UPSELL.id ? "アップセル" : "クロスセル"}構成比` : "加入者構成比"}
        </h3>
        {(isAcqRatioMode || isUpsellRatioMode) && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400">全体</span>
            <button
              onClick={() => setIsOverallMode(!isOverallMode)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${isOverallMode ? 'bg-[#29a1c0]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isOverallMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        )}
        {!isOverallMode && (
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm ring-1 ring-inset ${currentRatioTotal === 100 ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-rose-100'}`}>
            計: {currentRatioTotal}%
          </div>
        )}
      </div>

      {!isOverallMode ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 animate-fadeIn">
          <InputField label="プロ野球きっかけ顧客" value={ratioProBaseball} onChange={setRatioProBaseball} suffix="%" placeholder="100" error={isRatioInvalid} compact={true} />
          <InputField label="F1きっかけ顧客" value={ratioF1} onChange={setRatioF1} suffix="%" placeholder="0" error={isRatioInvalid} compact={true} />
          <InputField label="韓流きっかけ顧客" value={ratioHallyu} onChange={setRatioHallyu} suffix="%" placeholder="0" error={isRatioInvalid} compact={true} />
          <InputField label="基本プラン顧客" value={ratioBasic} onChange={setRatioBasic} suffix="%" placeholder="0" error={isRatioInvalid} compact={true} />
          <InputField label="その他顧客" value={ratioOthers} onChange={setRatioOthers} suffix="%" placeholder="0" error={isRatioInvalid} compact={true} />
        </div>
      ) : (
        <div className="py-4 text-center animate-fadeIn">
          {isAcqRatioMode ? (
            <p className="text-sm font-bold text-[#29a1c0] bg-cyan-50/50 py-3 rounded-xl border border-cyan-100/50">全体の想定LTV（¥{formatNumber(currentLtvSet.OVERALL)}）を使用して試算します</p>
          ) : (
             <p className="text-sm font-bold text-[#29a1c0] bg-cyan-50/50 py-3 rounded-xl border border-cyan-100/50">全体の{category === CATEGORIES.UPSELL.id ? 'アップセル後の推定継続期間' : 'クロスセル後の推定継続期間'}（{category === CATEGORIES.UPSELL.id ? UPSELL_DURATION_OVERALL : CROSSSELL_DURATION_OVERALL}ヶ月）を使用して試算します</p>
          )}
        </div>
      )}

      {isRatioInvalid && (
        <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1 animate-pulse">
          <AlertCircle size={12} /> 合計を100%にする必要があります
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F2F2F2] p-4 md:p-8 font-sans flex justify-center items-start selection:bg-cyan-100 selection:text-cyan-900">
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="max-w-6xl w-full bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        {/* Left Side: Controls */}
        <div className="w-full lg:w-4/12 p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-100/50 bg-white/50 relative z-20 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#29a1c0] to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-200">
                <Calculator size={18} strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">施策の期待効果試算</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase pl-1">MARKETING CALCULATOR</p>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">施策タイプを選択</label>
            <div className="relative group">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 pl-5 pr-12 appearance-none bg-white border-0 ring-1 ring-gray-100 rounded-2xl font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#29a1c0]/50 hover:shadow-md cursor-pointer"
              >
                {Object.values(CATEGORIES).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]"><ChevronDown size={20} /></div>
            </div>
          </div>

          <div className="bg-gray-100/80 p-1.5 rounded-2xl mb-8 flex shadow-inner">
            <button onClick={() => setActiveTab('single')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'single' ? 'bg-white text-[#29a1c0] shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}><TrendingUp size={16} />単発</button>
            <button onClick={() => setActiveTab('regular')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'regular' ? 'bg-white text-[#29a1c0] shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}><RefreshCw size={16} />定常</button>
          </div>

          <div className="space-y-1 pl-1 pt-1 pb-1">
            {/* Common Inputs */}
            {(category === CATEGORIES.UPSELL.id || category === CATEGORIES.CROSSSELL.id) && (
              <>
                <InputField 
                  label={category === CATEGORIES.UPSELL.id ? 'アップセル後の平均商品単価' : 'クロスセル対象商品の価格'} 
                  icon={DollarSign} 
                  value={priceAfter} 
                  onChange={setPriceAfter} 
                  suffix="円" 
                  placeholder={category === CATEGORIES.UPSELL.id ? "1,500" : "1,902"} 
                  className={category === CATEGORIES.CROSSSELL.id ? "mb-2" : ""}
                />
                {category === CATEGORIES.CROSSSELL.id && (
                  <p className="text-[10px] text-gray-400 mb-5 pl-1 leading-tight">
                    ※ターゲット商品が決まっていない場合は、過去実績のクロスセル商品の平均価格「¥1,902」を使用
                  </p>
                )}
              </>
            )}
            
            <InputField label="施策の対象顧客数" icon={Users} value={targetCount} onChange={setTargetCount} suffix="人" placeholder="10,000" />
            <InputField label={category === CATEGORIES.CHURN.id ? "解約率改善幅" : "想定CVR"} icon={BarChart2} value={cvr} onChange={setCvr} suffix="%" placeholder="1.5" />

            {/* Ratios (Shown BEFORE Cost) */}
            {(isAcqRatioMode || isUpsellRatioMode) && <RatioInputs />}

            <InputField label="施策コスト" icon={DollarSign} value={cost} onChange={setCost} suffix="円" placeholder="500,000" />

            {activeTab === 'regular' && <InputField label="施策実施期間" icon={Calendar} value={duration} onChange={setDuration} suffix="ヶ月" placeholder="12" />}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-2 text-[10px] text-slate-500 bg-white/60 p-4 rounded-2xl border border-gray-50/50 shadow-sm backdrop-blur-md">
              <div className="font-black text-[#29a1c0] mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#29a1c0]"></div>
                {isAcqRatioMode ? "想定LTV (粗利) ※固定値" : 
                 category === CATEGORIES.CHURN.id ? "想定ARPU ※固定値" :
                 (category === CATEGORIES.UPSELL.id || category === CATEGORIES.CROSSSELL.id) ? "固定値" : 
                 "想定LTV (粗利)"}
              </div>
              {isAcqRatioMode ? (
                <div className="grid grid-cols-1 gap-y-1">
                  <span>顧客全体{ltvSuffix}：¥{formatNumber(currentLtvSet.OVERALL)}</span>
                  <span>プロ野球きっかけ顧客{ltvSuffix}: ¥{formatNumber(currentLtvSet.PRO_BASEBALL)}</span>
                  <span>F1きっかけ顧客{ltvSuffix}: ¥{formatNumber(currentLtvSet.F1)}</span>
                  <span>韓流きっかけ顧客{ltvSuffix}: ¥{formatNumber(currentLtvSet.HALLYU)}</span>
                  <span>基本プラン顧客{ltvSuffix}: ¥{formatNumber(currentLtvSet.BASIC)}</span>
                  <span>その他顧客{ltvSuffix}: ¥{formatNumber(currentLtvSet.OTHERS)}</span>
                </div>
              ) : (
                <>
                  {category === CATEGORIES.CHURN.id && <div>想定ARPU: ¥2,273</div>}
                  {(category === CATEGORIES.UPSELL.id || category === CATEGORIES.CROSSSELL.id) && (
                    <div className="grid grid-cols-1 gap-y-1">
                      <div className="font-bold text-slate-600">・{category === CATEGORIES.UPSELL.id ? 'アップセル後の推定継続期間' : 'クロスセル後の推定継続期間'}</div>
                      
                      {category === CATEGORIES.UPSELL.id && (
                        <span className={isOverallMode ? "font-bold text-slate-700" : ""}>顧客全体: {UPSELL_DURATION_OVERALL}ヶ月</span>
                      )}
                      {category === CATEGORIES.CROSSSELL.id && (
                        <span className={isOverallMode ? "font-bold text-slate-700" : ""}>顧客全体: {CROSSSELL_DURATION_OVERALL}ヶ月</span>
                      )}

                      <span>プロ野球きっかけ顧客: {category === CATEGORIES.UPSELL.id ? UPSELL_DURATIONS.PRO_BASEBALL : CROSSSELL_DURATIONS.PRO_BASEBALL}ヶ月</span>
                      <span>F1きっかけ顧客: {category === CATEGORIES.UPSELL.id ? UPSELL_DURATIONS.F1 : CROSSSELL_DURATIONS.F1}ヶ月</span>
                      <span>韓流きっかけ顧客: {category === CATEGORIES.UPSELL.id ? UPSELL_DURATIONS.HALLYU : CROSSSELL_DURATIONS.HALLYU}ヶ月</span>
                      <span>基本プラン顧客: {category === CATEGORIES.UPSELL.id ? UPSELL_DURATIONS.BASIC : CROSSSELL_DURATIONS.BASIC}ヶ月</span>
                      <span>その他顧客: {category === CATEGORIES.UPSELL.id ? UPSELL_DURATIONS.OTHERS : CROSSSELL_DURATIONS.OTHERS}ヶ月</span>
                      
                      {category === CATEGORIES.UPSELL.id && (
                        <>
                          <div className="font-bold text-slate-600 mt-2">・アップセル前の平均商品単価</div>
                          <span>¥1,200</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="w-full lg:w-8/12 bg-slate-50/50 flex flex-col relative p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8 z-10">
            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-3">
              試算結果
            </h2>
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              disabled={!results.isValid}
              className={`text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-2 border ${!results.isValid ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-[#29a1c0] border-gray-100 hover:shadow-md hover:bg-cyan-50'}`}
            >
              <HelpCircle size={14} />{showDetails ? "内訳を隠す" : "内訳を見る"}{showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 z-10 mb-8">
            <ResultCard label={results.primaryLabel} value={formatNumber(results.primaryMetric)} unit="人" disabled={!results.isValid} />
            {results.sacLabel && <ResultCard label={results.sacLabel} value={`¥${formatCurrency(results.sacOrArpu)}`} unit="" disabled={!results.isValid} /> }
            <ResultCard label="想定利益" value={`¥${formatCurrency(results.profit)}`} unit="" disabled={!results.isValid} />
            <ResultCard label="想定ROI" value={formatCurrency(results.roi)} unit="%" disabled={!results.isValid} />
          </div>

          {results.isValid ? (
            <div className={`transition-all duration-500 overflow-hidden ${showDetails ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-3 flex items-center gap-2">
                  <Calculator size={12} />
                  Calculation Details
                </h3>
                <div className="space-y-1">
                  {results.details.map((d, i) => <DetailRow key={i} {...d} />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-8 animate-fadeIn flex items-center gap-4 text-rose-800">
              <div className="p-3 bg-white rounded-full shadow-sm text-rose-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-0.5">試算が停止しています</h4>
                <p className="text-sm opacity-80">{results.error}</p>
              </div>
            </div>
          )}

          <div className="mt-auto z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 transform transition-transform hover:scale-105 duration-300">
              <SukappyImage variant={characterVariant} />
            </div>
            <div className="bg-white p-6 md:p-8 rounded-t-3xl rounded-br-3xl rounded-bl-sm shadow-xl shadow-gray-200/50 border border-gray-100 relative flex-1 min-h-[120px] flex flex-col justify-center">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide opacity-50">
                Advice
              </h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed font-bold">
                {isRatioInvalid ? "比率の合計が100%になるように調整してみよう！" :
                 results.profit === 0 && !cost ? "数値を入力して、試算を始めてみよう！" : 
                 results.profit > 0 ? `すごいね！${formatCurrency(results.profit)}円の黒字が見込めそうだよ！` : 
                 `${formatCurrency(Math.abs(results.profit))}円の赤字になりそうだよ。施策のコストや内容を見直してみよう！`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}