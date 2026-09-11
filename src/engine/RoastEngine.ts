import type { RoastIntensity, LearningLanguage } from '../types';

export interface RoastContext {
  attemptCount: number;
  hintsUsed: number;
}

export interface RoastResult {
  roast: string;
  fix?: string;
}

type RoastBucket = 'HINDI' | 'ENGLISH' | 'MIXED';

/**
 * Fictional game-character roast generator.
 *
 * Language comes from the explicit roastLanguage argument when supplied, then
 * from persisted learner progress. The recent-roast buffer prevents the same
 * line from immediately repeating while keeping selection deterministic enough
 * for the same session and challenge context.
 */
const HINDI_ROASTS = [
  'BC, ye code dekh ke interpreter bhi soch raha hai ki resignation daal doon.',
  'MC, syntax ko aise mat peeto. Python ko samajhna hai, torture nahi karna.',
  'BSDK, variable ko value deni thi, emotional damage nahi.',
  'Gandu code ne phir se traceback kama liya. Wah, consistency toh hai.',
  'Chutiya-level bug hai: error saamne khada hai aur tu usko hello bolke nikal raha hai.',
  'Madarchod bug nahi hai, teri indentation hai. Usko line mein khada kar.',
  'Behenchod, colon lagana tha. Python ne democracy suspend kar di.',
  'Bhosdike, expected output ko dekh le. Computer tere mann ki baat nahi padhta.',
  'Chutiye, loop chal raha hai, bas tera dimaag uske andar atak gaya hai.',
  'Gand mara debugging ne, lekin ab traceback padh aur kaam kar.',
  'Laude, variable ka naam aur variable ki value do alag cheezein hain.',
  'Laude ke code, tu chal nahi raha; tu bas errors ko cardio kara raha hai.',
  'Lund logic detected. Condition ko dobara dekh, hero.',
  'Gand ke kede, ek bracket miss karke poora program barbaad kar diya.',
  'Beti chode syntax, quote band kar warna Python tujhe band kar dega.',
  'Kya bakchodi hai ye? Expected output saamne hai, phir bhi tu alag universe mein hai.',
  'Bakchod code: comments Nobel Prize level, implementation roadside puncture.',
  'Harami bug phir aa gaya. Is baar isko properly maar.',
  'Haramkhor traceback tera naam pukaar raha hai. Sun le.',
  'Kamine, same mistake baar-baar? Memory bhi hai ya sirf RAM hai?',
  'Kutta code likh diya. Ab leash pakad aur line-by-line debug kar.',
  'Ullu ke pathe, error message padh. Woh decoration nahi hai.',
  'Gadha bhi is traceback ko padh ke hint de dega.',
  'Bewakoof code nahi hota, bewakoofi se code hota hai. Difference samajh.',
  'Fattu mat ban. Error ko isolate kar aur seedha fix maar.',
  'Jhaatu logic ko refactor kar. Python tera therapist nahi hai.',
  'Chodu, output mismatch ka matlab output mismatch hi hota hai.',
  'Chodu bhagat mode activated. Ab actual logic likh.',
  'Aandu logic: input kuch, expectation kuch, output kuch aur.',
  'Teri debugging dekh ke bug khud confuse ho gaya hai ki kaun kisko fix kare.',
  'Dimag ka dahi mat bana. Pehle traceback ki last line padh.',
  'Ye code nahi, bakchodi ka production build hai.',
  'Arre bhosdike, ek variable ko teen alag meanings mat de.',
  'BC, copy-paste se skill unlock nahi hoti. Samajh bhi le.',
  'MC, loop ki boundary dekh. Off-by-one ne tujhe phir nanga kar diya.',
  'BSDK, function ko call karna tha, uska naam dekh ke pooja nahi karni thi.',
  'Chutiya compiler nahi hai. Python interpreter hai. Error tera hai.',
  'Gandu, indentation ko whitespace bolke ignore karega toh Python tujhe ignore karega.',
  'Bhosdike, exception ko catch karne se pehle samajh toh le kya explode hua.',
  'Madarchod traceback itna clear hai ki wall pe chipka de toh bhi samajh aa jaye.',
  'Behenchod, ek semicolon ke liye Python ko blame mat kar. Python ko semicolon chahiye hi nahi.',
  'Bakchodi band. Requirement padho, phir code likho.',
  'Gand se logic mat nikaal. Requirement se nikaal.',
  'Laude, expected output ko hard-code karke developer nahi banega.',
  'Kamine, hints ka subscription band. Ab khud soch.',
  'Chutiye, same error ka remix bana diya. Original bhi galat tha.',
  'Harami output: almost right is still wrong when the judge checks exact output.',
  'Gand mara aur phir bhi code nahi chala? Ab traceback padh.',
  'Tera code itna confused hai ki variable bhi apni identity verify kar raha hai.',
  'Ullu ke pathe, `range` ka stop endpoint generally include nahi hota. Dhyaan de.',
  'Bhadwa-level debugging strategy: RUN, pray, RUN, cry. Ab actual debugging kar.',
  'BSDK, function ke andar variable bana ke bahar use karega toh scope tera dushman banego.',
  'BC, list aur string ko same samajhne ki bakchodi band kar.',
  'MC, `=` assignment hai, `==` comparison. Ye basic hai, jaan le.',
  'Chutiya mistake, lekin fixable. Ab ego side mein aur code saamne.',
];

const ENGLISH_ROASTS = [
  'What the fuck was that code? Even the traceback looked disappointed.',
  'Dumbass, the bug is practically waving at you. Read the error.',
  'You absolute muppet. The variable has one job and you gave it three identities.',
  'Fuck me, that loop went sightseeing instead of solving the problem.',
  'This code is held together by hope, duct tape, and one missing bracket.',
  'You magnificent bastard, you found a new way to fail the same test.',
  'Holy shit, that output is nowhere near the target.',
  'For fucks sake, read the requirement before writing the solution.',
  'Your code just committed a felony against indentation.',
  'That is not debugging. That is repeatedly pressing RUN and praying.',
  'You absolute clown, the traceback literally tells you where to look.',
  'The interpreter did not betray you. Your logic did.',
  'What the hell is this variable doing with its life?',
  'Your loop has the confidence of a genius and the accuracy of a drunk GPS.',
  'This solution is bullshit. Replace the shortcut with actual logic.',
  'You hard-coded the answer. Congratulations, you defeated nothing.',
  'Fuck around with the edge case and find out.',
  'That exception just slapped your code back into reality.',
  'You wrote a bug so cleanly that it almost deserves documentation.',
  'Jesus fucking Christ, close the quote before blaming Python.',
  'Your indentation has entered witness protection.',
  'This is some premium-grade nonsense.',
  'The code works in your imagination. Unfortunately, the interpreter lives in reality.',
  'You absolute gremlin, stop changing five things at once and isolate the bug.',
  'That is not an edge case. That is the case you forgot.',
  'Your solution has more confidence than correctness.',
  'Fuck the panic. Read the traceback line by line.',
  'You just reinvented a bug that Python has been warning people about for decades.',
  'This code needs less vibes and more variables with sensible names.',
  'The test did not fail randomly. Your assumptions failed deterministically.',
  'You magnificent idiot, that comparison operator is not decorative.',
  'The function is not psychic. Pass it the damn argument.',
  'That is one hell of an off-by-one error.',
  'Stop bullying the interpreter and start reading the error message.',
  'Your code has achieved a rare state: technically executable, logically cursed.',
  'This is not spaghetti. Spaghetti has structure.',
  'You turned a two-line problem into a fucking side quest.',
  'No, mate. The output is wrong. Confidence does not change the test result.',
  'That variable scope just mugged you in broad daylight.',
  'Your code is not cursed. You simply forgot what you wrote five minutes ago.',
  'Holy shit, you actually fixed it. I take back approximately twelve insults.',
  'Against all odds, the code passed. The universe is healing.',
  'You finally stopped fucking around and wrote the correct solution.',
];

const MIXED_ROASTS = [
  'BC, what the fuck is this code?',
  'MC, this loop is doing full bakchodi instead of its job.',
  'BSDK, holy shit, read the traceback.',
  'Gandu code hai, but fixable. Stop panicking and debug.',
  'Chutiya-level bug with premium English documentation.',
  'Behenchod, why the fuck did you hard-code the expected answer?',
  'Bhosdike, Python ne bola error. Tu bola “maybe later.” BC, no.',
  'Gand ke kede, this variable has absolutely no fucking business being global.',
  'Beti chode, close the bracket before the interpreter closes your career.',
  'Bakchodi band kar, read the requirement and write actual logic.',
  'Laude, that output is fucked. Compare it character by character.',
  'Harami bug, desi naam but international-level bullshit.',
  'Kamine, stop pressing RUN like it owes you a solution.',
  'Ullu ke pathe, the last traceback line is basically giving you the answer.',
  'BC, range ka stop exclusive hai. Python ko blame mat kar, learn it.',
  'MC, `=` aur `==` ko cousins samajh ke mix mat kar. They do different shit.',
  'Chutiya, one missing colon and the whole program went to hell.',
  'Gandu, your indentation is fucked six ways from Sunday.',
  'BSDK, expected output saamne hai. Why the fuck are you inventing another one?',
  'Madarchod logic, but surprisingly close. Fix the one broken assumption.',
  'Behenchod, same error again? Bhai, memory use kar.',
  'Bhosdike, hints ka addiction chhod. Ab khud solve kar.',
  'Gand mara debugging ne, but this time you actually found the bug.',
  'BC, no cheating. Print karke answer dikha diya toh skill kahan hai, bhai?',
  'MC, this is not a coding solution, this is a fucking hostage note to the judge.',
  'Chutiya output mismatch. Tiny detail, massive consequences.',
  'Bakchod code finally passed. Screenshot le le, historic event hai.',
  'Holy BC, you actually fucking did it.',
  'Gandu, the code works now. Miracles are apparently real.',
];

const FIXES: Record<string, string> = {
  REQUIRED_CONCEPT_MISSING: 'Requirement ko follow kar: expected behavior implement kar, shortcut mat maar.',
  OUTPUT_ONLY_CHEAT: 'Expected answer print karke mat bach. Actual logic implement kar.',
  TIMEOUT: 'Loop/recursion inspect kar. Kahin program infinite bakchodi toh nahi kar raha?',
  SyntaxError: 'Syntax ko line-by-line check kar: brackets, quotes, colon, indentation.',
  IndentationError: 'Indentation fix kar. Python whitespace ko seriously leta hai.',
  NameError: 'Variable/function ka exact naam aur scope check kar.',
  UnboundLocalError: 'Variable ko read karne se pehle usko assign kar.',
  TypeError: 'Values ke types check kar. String, int, list aur function ko mix mat kar.',
  ValueError: 'Input ki value aur expected type/range inspect kar.',
  ZeroDivisionError: 'Division se pehle denominator check kar.',
};

const RECENT_LIMIT = 6;
const recentRoasts: Record<RoastBucket, string[]> = { HINDI: [], ENGLISH: [], MIXED: [] };

function bucketFor(language: string): RoastBucket {
  const normalized = String(language ?? '').toUpperCase();
  if (normalized === 'HINDI') return 'HINDI';
  if (normalized === 'MIXED') return 'MIXED';
  return 'ENGLISH';
}

function persistedRoastLanguage(): RoastBucket | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem('python-from-hell-progress');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { roastLanguage?: string };
    if (!parsed.roastLanguage) return undefined;
    return bucketFor(parsed.roastLanguage);
  } catch {
    return undefined;
  }
}

function poolFor(bucket: RoastBucket): string[] {
  if (bucket === 'HINDI') return HINDI_ROASTS;
  if (bucket === 'MIXED') return MIXED_ROASTS;
  return ENGLISH_ROASTS;
}

function hashFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function pick(pool: string[], seed: string, recent: string[]): string {
  if (pool.length === 0) return '';
  const start = hashFor(seed) % pool.length;
  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (candidate && !recent.includes(candidate)) return candidate;
  }
  return pool[start] ?? pool[0];
}

export class RoastEngine {
  static generateRoast(
    errorType: string,
    runtimeError: string,
    context: RoastContext,
    intensity: RoastIntensity,
    language: LearningLanguage,
    roastLanguage?: string
  ): RoastResult {
    const selectedLanguage = roastLanguage ?? persistedRoastLanguage() ?? language;
    const bucket = bucketFor(String(selectedLanguage));
    const pool = poolFor(bucket);
    const recent = recentRoasts[bucket];
    const intensityText = String(intensity ?? '').toUpperCase();
    const seed = [errorType, runtimeError, context.attemptCount, context.hintsUsed, intensityText].join('|');
    const roast = pick(pool, seed, recent);

    if (roast) {
      recent.push(roast);
      if (recent.length > RECENT_LIMIT) recent.shift();
    }

    const specificFix = FIXES[errorType] ?? FIXES[errorType.replace(/^.*?:\s*/, '')];
    return {
      roast,
      fix: specificFix ?? 'Trace the failure, isolate one assumption, then run the smallest useful test.',
    };
  }
}

export const ROAST_BANK_STATS = {
  hindi: HINDI_ROASTS.length,
  english: ENGLISH_ROASTS.length,
  mixed: MIXED_ROASTS.length,
  total: HINDI_ROASTS.length + ENGLISH_ROASTS.length + MIXED_ROASTS.length,
};
