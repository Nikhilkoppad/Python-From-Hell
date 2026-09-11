import type { RoastIntensity, LearningLanguage } from '../types';

export type RoastLanguage = 'HINDI' | 'ENGLISH' | 'MIXED';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RoastHistoryEntry {
  id: string;
  timestamp: number;
  lastRoastTime: number;
  roastText: string;
  errorType: string;
  severity: Severity;
}

export interface RoastEngineConfig {
  maxHistorySize: number;
  cooldownPeriod: number;
  severityLevels: Severity[];
}

export interface RoastStats {
  totalRoasts: number;
  roastsBySeverity: Record<string, number>;
  lastRoastTime: number;
  repeatProtection: Set<string>;
}

const HISTORY_KEY = 'python-from-hell-roast-history';
const LANGUAGE_KEY = 'python-from-hell-roast-language';

const HINDI_ROASTS = [
  'BC, yeh code hai ya keyboard pe baith ke bandar ne type kiya hai?',
  'MC, Python ne traceback diya hai, resignation letter nahi. Dhyan se padh.',
  'BSDK, variable ko naam diya aur phir khud hi bhool gaya ki rakha kahan hai.',
  'Gandu logic detected. Computer bechne se pehle ek baar indentation dekh le.',
  'Gand mara syntax ne teri. Ab traceback padh aur drama band kar.',
  'Teri coding dekh ke debugger bhi bol raha hai: bhai mujhe kyun ghaseet raha hai?',
  'BC, expected output saamne pada hai aur tera code usse personal dushmani kar raha hai.',
  'MC, itni bakchodi ek hi function mein kaise bhar di?',
  'BSDK, tu code fix nahi kar raha; tu naye bugs ko naukri de raha hai.',
  'Gand ke kede jaisa loop chalta ja raha hai aur exit condition ko bhool gaya.',
  'Beti chode, error message padh le. Python ne khud bata diya kya galat hai.',
  'Loudi-level logic hai yeh. Ek line change karne se pehle soch bhi liya kar.',
  'BC, yeh solution nahi, bug ka family reunion hai.',
  'MC, output ko dekh. Tera code kuch aur bol raha hai, expected kuch aur.',
  'BSDK, copy-paste se programmer nahi banta; traceback samajhna padta hai.',
  'Gandu, semicolon dhoondhne se Python nahi sudhrega. Actual error dekh.',
  'Teri condition itni chutiya hai ki `if` bhi soch raha hoga main kyun exist karta hoon.',
  'BC, ek aur hint maanga toh training wheels bhi tujhe gaali denge.',
  'MC, same bug teesri baar? Wah bhai, consistency toh hai.',
  'Code ki aisi taisi kar di. Ab usko systematically repair kar.',
  'BSDK, runtime ko blame karna band kar. Is baar culprit tu hai.',
  'Gand ke kede, exception ko suppress karne se problem solve nahi hoti.',
  'BC, Python tere khilaaf nahi hai. Bas tera logic questionable hai.',
  'MC, function bana diya, ab use karna bhi seekh le.',
  'BSDK, expected answer ko print karna solution nahi, chalaki hai. Logic dikha.',
  'Gandu, variable scope ka naam suna hai ya bas random naam chipka raha hai?',
  'BC, indentation ne tujhe personally kya kar diya jo itna torture kar raha hai?',
  'MC, traceback ko scroll karke neeche dekh. Wahin asli tamasha hai.',
  'BSDK, yeh bug nahi tha; tune usko invite kiya tha.',
  'Gand mara is typo ne. Ek character ne poora program jala diya.',
  'BC, tera code itna confused hai ki CPU bhi career change soch raha hai.',
  'MC, test fail hua hai. Ego nahi. Fix kar.',
  'BSDK, `None` ko value samajhne ki aadat chhod de.',
  'Gandu, list aur string ko shaadi kara ke kya expect kar raha tha?',
  'BC, loop ko rokne ka plan bhi tha ya bas infinite commitment tha?',
  'MC, edge case tera dushman nahi; tera syllabus hai.',
  'BSDK, function return kar raha hai ya bas hawa mein motivation de raha hai?',
  'Gand ke kede, same mistake ko repeat karna mastery nahi hoti.',
  'BC, code ko ghur mat. Reason kar.',
];

const ENGLISH_ROASTS = [
  'What the fuck is this code? Even the traceback looks disappointed.',
  'You did not debug that. You negotiated with the bug and lost.',
  'This variable has more identity crises than your entire codebase.',
  'Your loop has achieved something impressive: absolutely fucking nowhere.',
  'That condition is so stupid even `if` wants legal representation.',
  'The expected output is right there. Your code chose violence instead.',
  'You have not solved the problem; you have created a sequel.',
  'That is not a solution. That is a printed confession.',
  'The interpreter is not being dramatic. Your code is genuinely fucked.',
  'Congratulations, you found a new way to misuse a perfectly innocent function.',
  'Read the traceback, you magnificent disaster.',
  'Your indentation just committed a crime against Python.',
  'You are speedrunning every beginner mistake in one submission.',
  'That bug did not sneak in. You fucking invited it.',
  'Your code has the structural integrity of wet cardboard.',
  'Stop throwing random fixes at it. Use your fucking brain.',
  'Same error again? That is not persistence. That is stubbornness with syntax.',
  'The debugger has entered the chat and immediately regretted it.',
  'Your function returns nothing because apparently it has given up on you.',
  'You hard-coded the answer and thought nobody would notice. Nice try, asshole.',
  'This is not spaghetti code. This is an entire fucking buffet.',
  'You broke a working starter file. Outstanding fucking achievement.',
  'The bug is obvious. Your refusal to look at it is the advanced challenge.',
  'Your variable scope is a fucking crime scene.',
  'Python is dynamically typed, not magically psychic.',
  'That exception literally told you what went wrong. Read the fucking message.',
  'You cannot brute-force your way out of a logic problem, you magnificent bastard.',
  'One more random edit and this code needs witness protection.',
  'Your output is wrong with impressive confidence.',
  'This code needs less guessing and more fucking reasoning.',
  'You are not fighting the interpreter. You are fighting your own assumptions.',
  'The function is fine. Your input is fucked.',
  'You turned a two-line problem into a fucking archaeological dig.',
  'That edge case just walked in and slapped your entire solution.',
  'You asked for a hint after three failures. The hint is: fucking think.',
  'Your code passed? Holy shit, document the miracle.',
  'Against all odds, you finally wrote something that works. Do not get cocky.',
  'That was clean. I hate to admit it, but you actually fucking cooked.',
];

const MIXED_ROASTS = [
  'BC, what the fuck is this code? Python ne bhi haath khade kar diye.',
  'MC, this loop is gand ke kede level ka endless nonsense.',
  'BSDK, you hard-coded the answer. Kya chutiya shortcut hai, bhai.',
  'Gandu, traceback English mein chillaa raha hai aur tu ignore kar raha hai.',
  'BC, expected output saamne hai and your code said “fuck that”.',
  'MC, this function is so fucked even the debugger needs chai.',
  'Gand mara is bug ne — and yes, you created it.',
  'BSDK, stop bakchodi and read the fucking error message.',
  'Beti chode, same mistake again? That is some world-class consistency.',
  'Loudi, Python ko blame mat kar. Logic tera hi fucked hai.',
  'Gand ke kede jaisa loop hai: ghoom raha hai, kahin nahi ja raha.',
  'BC, this is not debugging. Yeh toh code ke saath WWE chal raha hai.',
  'MC, one more random fix and poora program chud jayega.',
  'BSDK, output wrong hai. Confidence sahi hai, bas code fucking wrong hai.',
  'Gandu, `None` ko value samajh ke kya chutiyaapa kar raha hai?',
  'BC, your indentation is fucked harder than your explanation.',
  'MC, hint maangne se pehle dimaag ko fucking ON kar.',
  'BSDK, bug ne tujhe nahi dhunda. Tune usko code mein ghar diya.',
  'What the fuck, bhai? Yeh solution nahi, bakchodi ka production build hai.',
  'BC, somehow you made a tiny bug into a full fucking feature.',
  'MC, traceback padh le warna Python teri izzat ka postmortem likhega.',
  'BSDK, same error three times? Bhai, commitment samajh gaya.',
  'Gandu, expected answer print kar diya aur socha system chutiya hai?',
  'BC, this code needs logic, not another fucking guess.',
  'MC, edge case aaya aur tera solution seedha gand ke bal gir gaya.',
  'BSDK, finally passed. Holy shit, tu zinda hai.',
  'BC, that was actually clean. Aaj Python ne tujhe maaf kar diya.',
  'MC, you fucking cooked that one. Screenshot le le, rare event hai.',
];

const MEMES = [
  '🚨 Stack Overflow tab kholne se pehle apna traceback padh, BC.',
  '💀 “It works on my machine” — famous last words of a BSDK.',
  '🤡 Bro changed one line and somehow invented three bugs.',
  '📉 Stonks: confidence +100, correctness -100.',
  '🗿 Programmer mindset: “bas ek chhota sa fix” — 47 minutes later.',
  '🔥 Git commit message: `fix final final FINAL actual real bug`.',
  '☠️ The bug was in your assumptions. Classic.',
  '💀 Skill issue detected. Converting embarrassment into XP.',
  '🤡 Ctrl+C Ctrl+V is not a debugging methodology, MC.',
  '📛 “Works perfectly” immediately followed by traceback. Cinema.',
  '🧠 Brain.exe has stopped responding. Please read the error message.',
  '🚮 This submission belongs in the recycle bin, not production.',
  '⚰️ Here lies a perfectly good variable, murdered by scope.',
  '🧯 Code on fire. Developer says: “one more print statement.”',
];

const SUPPORTIVE = [
  'The code is wrong, not you. Now find the exact mismatch and fix it.',
  'Slow down. Read the traceback from top to bottom and isolate one cause.',
  'Good attempt. Now prove the behavior instead of guessing.',
  'The failure is evidence. Use it.',
];

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(-80) : [];
  } catch {
    return [];
  }
}

function remember(text: string): void {
  try {
    const next = [...readHistory(), text.toLowerCase()].slice(-80);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Persistence is optional; roasting must never break the learning flow.
  }
}

function getRoastLanguage(): RoastLanguage {
  try {
    const value = localStorage.getItem(LANGUAGE_KEY);
    if (value === 'ENGLISH' || value === 'MIXED' || value === 'HINDI') return value;
  } catch {
    // Fall through to the learner's normal language.
  }
  return 'HINDI';
}

function pickFresh(pool: string[]): string {
  const history = new Set(readHistory());
  const fresh = pool.filter(item => !history.has(item.toLowerCase()));
  const candidates = fresh.length > 0 ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? SUPPORTIVE[0];
}

function severityFor(intensity: RoastIntensity): Severity {
  const value = String(intensity).toUpperCase();
  if (value === 'SUPPORTIVE' || value === 'ACADEMIC') return 'LOW';
  if (value === 'SAVAGE' || value === 'DESI_SENIOR') return 'MEDIUM';
  return 'HIGH';
}

function profanityPool(language: RoastLanguage): string[] {
  if (language === 'ENGLISH') return ENGLISH_ROASTS;
  if (language === 'MIXED') return MIXED_ROASTS;
  return HINDI_ROASTS;
}

export class RoastEngine {
  private config: RoastEngineConfig = {
    maxHistorySize: 80,
    cooldownPeriod: 800,
    severityLevels: ['LOW', 'MEDIUM', 'HIGH'],
  };

  private history: RoastHistoryEntry[] = [];
  private roastStats: RoastStats = {
    totalRoasts: 0,
    roastsBySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    lastRoastTime: 0,
    repeatProtection: new Set(),
  };

  addRoast(errorType: string, roastText: string, severity: Severity = 'MEDIUM'): string {
    const now = Date.now();
    const text = roastText || pickFresh(profanityPool(getRoastLanguage()));
    const entry: RoastHistoryEntry = {
      id: `roast-${now}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now,
      lastRoastTime: now,
      roastText: text,
      errorType,
      severity,
    };
    if (this.history.length >= this.config.maxHistorySize) this.history.shift();
    this.history.push(entry);
    this.roastStats.totalRoasts += 1;
    this.roastStats.roastsBySeverity[severity] = (this.roastStats.roastsBySeverity[severity] || 0) + 1;
    this.roastStats.lastRoastTime = now;
    this.roastStats.repeatProtection.add(text.toLowerCase());
    remember(text);
    return text;
  }

  getRoast(errorType: string, severity?: Severity): string {
    return this.addRoast(errorType, '', severity ?? 'MEDIUM');
  }

  determineSeverity(): Severity {
    const failures = this.history.filter(h => h.errorType.includes('ERROR') || h.errorType.includes('MISMATCH')).length;
    return failures >= 5 ? 'HIGH' : failures >= 2 ? 'MEDIUM' : 'LOW';
  }

  getRoastStats(): RoastStats { return this.roastStats; }
  getRoastHistory(): RoastHistoryEntry[] { return [...this.history]; }

  static generateRoast(
    errorType: string,
    runtimeError: string,
    attemptInfo: { attemptCount: number; hintsUsed: number },
    intensity: RoastIntensity,
    language: LearningLanguage
  ): { roast: string; fix?: string } {
    const severity = severityFor(intensity);
    const roastLanguage = getRoastLanguage();
    const basePool = profanityPool(roastLanguage);
    const memePool = MEMES;

    if (severity === 'LOW') {
      const text = pickFresh(SUPPORTIVE);
      remember(text);
      return { roast: text, fix: language === 'HINDI' ? 'BC, traceback ko dhyan se padh aur ek cause isolate kar.' : 'Read the traceback carefully and isolate one cause.' };
    }

    // Every high-intensity failure gets profanity, with contextual meme injection.
    let text = pickFresh(basePool);
    if (attemptInfo.attemptCount >= 3 || attemptInfo.hintsUsed >= 2) {
      text = `${text} ${pickFresh(memePool)}`;
    } else if (Math.random() < 0.35) {
      text = `${text} ${pickFresh(memePool)}`;
    }

    const normalizedError = String(errorType).toUpperCase();
    if (normalizedError === 'OUTPUT_ONLY_CHEAT') {
      text = roastLanguage === 'ENGLISH'
        ? `${text} You printed the answer instead of solving it. Fucking nice try.`
        : roastLanguage === 'MIXED'
          ? `${text} Answer print karke bach jayega kya, BC? Fucking nice try.`
          : `${text} Expected output print karke bachne ki koshish? BC, itna chutiya shortcut nahi chalega.`;
    } else if (normalizedError === 'REQUIRED_CONCEPT_MISSING') {
      text = roastLanguage === 'ENGLISH'
        ? `${text} The required concept is missing. Implement the damn thing.`
        : roastLanguage === 'MIXED'
          ? `${text} Required concept hi missing hai, MC. Actual logic likh.`
          : `${text} Required concept hi nahi hai, BSDK. Logic dikha.`;
    } else if (normalizedError === 'TIMEOUT') {
      text = roastLanguage === 'ENGLISH'
        ? `${text} Your code timed out. Congratulations, you made waiting a feature.`
        : roastLanguage === 'MIXED'
          ? `${text} Code timeout ho gaya, BC. Waiting ko feature bana diya kya?`
          : `${text} Code timeout ho gaya, MC. Infinite bakchodi band kar.`;
    } else if (runtimeError) {
      text = `${text} ${runtimeError.split('\n').slice(-1)[0] ?? ''}`.trim();
    }

    remember(text);
    const fix = language === 'HINDI'
      ? 'BC, pehle exact error samajh. Phir ek targeted fix kar — random changes mat maar.'
      : 'Read the exact failure, identify the cause, then make one targeted fix.';
    return { roast: text, fix };
  }
}
