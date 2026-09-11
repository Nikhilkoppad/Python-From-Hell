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
 * The bank is intentionally large and varied. It uses profanity, slang,
 * developer humor and memes, while excluding protected-class slurs.
 * The learner's roastLanguage controls the vocabulary pool.
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
  'BSDK, function ke andar variable bana ke bahar use karega toh scope tera dushman banega.',
  'BC, list aur string ko same samajhne ki bakchodi band kar.',
  'MC, `=` assignment hai, `==` comparison. Ye basic hai, jaan le.',
  'Chutiya mistake, lekin fixable. Ab ego side mein aur code saamne.',
  'Bhosdike, tera traceback kisi horror movie ka trailer nahi, debugging clue hai.',
  'Bhonsdike, function ko argument de warna woh tera future predict nahi karega.',
  'Bhosdiwale logic ko test case ne do second mein expose kar diya.',
  'Bhosadpappu code: naam cute, output ghatiya.',
  'Bhosadike, `None` ko number samajhne ki bakchodi mat kar.',
  'Chutiyapa level: variable initialize hi nahi kiya aur result maang raha hai.',
  'Chutiyagiri ka world record bana raha hai kya? Same bug teesri baar.',
  'Chaman chutiya moment: typo ne poora program hostage bana liya.',
  'Chodam-patti band kar. One assumption at a time test kar.',
  'Lund se logic mat naap. Test se naap.',
  'Lunddu-level confidence, zero evidence. Ab actual output dekh.',
  'Lavdu, `return` bhool ke function se result expect kar raha hai.',
  'Lulloo code: dekhne mein chalak, execute hote hi dhadaam.',
  'Tatti-level output hai. Requirement dobara padh.',
  'Tatti karne se easier hai traceback padhna, kar le.',
  'Gand mein dimaag mat dhoondh. Code ke flow mein dhoondh.',
  'Pichhwada-level debugging nahi chalegi. Root cause pakad.',
  'Kutta, billi, ullu sab traceback padh sakte hain. Tu bhi padh le.',
  'Saaley, variable shadow karke phir scope ko gaali de raha hai.',
  'Saalon ki programming ka dard ek missing colon mein daal diya.',
  'Harami shortcut ne tujhe judge ke saamne pakad liya.',
  'Kaminepan ki limit hai. Expected behavior implement kar.',
  'Maa kasam, ye loop termination dekh ke debugger bhi thak gaya.',
  'Abe chutiye, ek hi bug fix kar. Poora universe rewrite mat kar.',
  'Abe laude, error line se pehle wali line bhi check kar.',
  'Abe bhosdike, input validate karna koi optional decoration nahi.',
  'BC, test pass hona luck nahi, evidence hai. Fail hona bhi evidence hai.',
  'MC, code ko ghuma-phira ke clever mat bana. Pehle correct bana.',
  'Gandu, edge case ne tera confidence seedha null kar diya.',
  'BSDK, empty list ko index karne gaya aur surprise mil gaya.',
  'Chutiye, `len()` ko magic wand mat samajh.',
  'Harami recursion ko base case de, warna ye infinite family drama chalega.',
  'Ullu ke pathe, mutable state ko track kar. Bug hawa mein se nahi aaya.',
  'Kamine, print statements ka jungle bana diya. Ab debugger ki tarah soch.',
  'Bakchod, code review mein excuses nahi, reproducible evidence chahiye.',
  'Bhosdike, typo fix karne ko architecture rewrite kar diya.',
  'Gand ke kede, requirement ke words ko ignore karke apni kahani mat likh.',
  'Beti chode, exact output mein ek space bhi matter kar sakta hai.',
  'Gand mara, ab solution ko simplify kar. Overengineering ka janaza nikaal.',
  'BC, finally pass! Aaj interpreter ne tujhe maaf kar diya.',
  'MC, holy shit, ye baar sahi kar diya. Screenshot le, historic moment hai.',
  'BSDK, victory mil gayi. Ab overconfidence mein next bug mat bana.',
  'Gandu, code pass hua. Ab samjha bhi ki kyun pass hua?',
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
  'What the fuck is this variable naming? `x`, `y`, `z` are not a personality.',
  'You absolute bastard, the test case was right there.',
  'This function has more exits than a shopping mall.',
  'Your recursion has no base case and apparently no fear of death.',
  'You turned a simple boolean into a philosophical crisis.',
  'That list index error came with a fucking invitation. You still missed it.',
  'Your exception handler is basically a rug hiding a corpse.',
  'Stop adding print statements and start forming a hypothesis.',
  'You are not debugging; you are conducting random experiments with production code.',
  'That variable got shadowed so hard it needs witness protection.',
  'The code is syntactically legal and morally bankrupt.',
  'You made an empty list and then acted surprised it was empty. Incredible.',
  'Your type error has a better understanding of the program than you do.',
  'That missing return statement just robbed your entire function.',
  'You overengineered a fucking `if` statement.',
  'The requirement said “do X” and you built a fucking theme park.',
  'You solved the wrong problem with extraordinary confidence.',
  'This bug has tenure now. It has survived too many attempts.',
  'You found the edge case by walking directly into it face-first.',
  'Your code has big “works on my machine” energy.',
  'The judge does not care about your feelings, only the output.',
  'Stop negotiating with the failing test. Read it.',
  'Your loop needs a condition, not a fucking miracle.',
  'This is the kind of code that makes future-you file a restraining order.',
  'You did not break Python. You broke your own assumption.',
  'That shortcut was so obvious the evaluator caught it before I did.',
  'Congratulations: you have successfully made a one-line bug into a twelve-line bug.',
  'You absolute goblin, clean up the state before you chase another symptom.',
  'The stack trace is not a novel. Start at the useful line.',
  'Your function arguments are not optional just because you wish they were.',
  'You forgot the base case. The recursion is now legally immortal.',
  'This output is bullshit with punctuation.',
  'You have achieved maximum confidence with minimum evidence.',
  'That typo just cost you ten minutes. Proofreading is cheaper.',
  'Holy fucking shit, it passed. Do not touch anything for five seconds.',
  'You actually solved it. I am contractually obligated to shut up for a moment.',
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
  'Bhosdike, scope ne phir teri le li. Variable ko sahi jagah define kar.',
  'Bhosdiwale logic ko test case ne do second mein expose kar diya.',
  'Bhosadpappu code: naam cute, output ghatiya.',
  'Chutiyapa level: variable initialize hi nahi kiya aur result maang raha hai.',
  'Chutiyagiri ka world record bana raha hai kya? Same bug teesri baar.',
  'Chaman chutiya moment: typo ne poora program hostage bana liya.',
  'Chodam-patti band kar. One assumption at a time test kar.',
  'Lund se logic mat naap. Test se naap.',
  'Lavdu, `return` bhool ke function se result expect kar raha hai.',
  'Lulloo code: dekhne mein smart, execute hote hi dhadaam.',
  'Tatti-level output hai. Requirement dobara padh.',
  'Gand mein dimaag mat dhoondh. Code ke flow mein dhoondh.',
  'Pichhwada-level debugging nahi chalegi. Root cause pakad.',
  'Saaley, variable shadow karke phir scope ko gaali de raha hai.',
  'Harami shortcut ne tujhe judge ke saamne pakad liya.',
  'Kaminepan ki limit hai. Expected behavior implement kar.',
  'Abe chutiye, ek hi bug fix kar. Poora universe rewrite mat kar.',
  'Abe laude, error line se pehle wali line bhi check kar.',
  'Abe bhosdike, input validate karna optional decoration nahi hai.',
  'BC, edge case ne tera confidence seedha null kar diya.',
  'MC, code ko clever mat bana. Pehle fucking correct bana.',
  'Gandu, empty list ko index kiya aur phir surprise ho gaya. Wah.',
  'BSDK, recursion ko base case de warna ye family drama kabhi khatam nahi hoga.',
  'Chutiye, print statements ka jungle bana diya. Hypothesis bhi bana le.',
  'Ullu ke pathe, `None` ko integer samajh ke kya achievement unlock karega?',
  'Kamine, test fail hua hai. Debate nahi, diagnosis chahiye.',
  'Bakchod, requirement kuch aur thi aur tune side quest bana diya.',
  'Bhosdike, typo fix karne ko architecture rewrite kar diya.',
  'Gand ke kede, exact output mein ek space bhi matter kar sakta hai.',
  'Beti chode, shortcut ne evaluator ko impress nahi kiya.',
  'Gand mara, ab solution simplify kar. Overengineering ka janaza nikaal.',
  'BC, finally pass! Aaj interpreter ne tujhe maaf kar diya.',
  'MC, holy shit, ye baar sahi kar diya. Historic moment hai.',
  'BSDK, victory mil gayi. Ab overconfidence mein next bug mat bana.',
  'Gandu, code pass hua. Ab samjha bhi ki kyun pass hua?',
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

function bucketFor(language: string): RoastBucket {
  const normalized = String(language ?? '').toUpperCase();
  if (normalized === 'HINDI') return 'HINDI';
  if (normalized === 'MIXED') return 'MIXED';
  return 'ENGLISH';
}

function poolFor(bucket: RoastBucket): string[] {
  if (bucket === 'HINDI') return HINDI_ROASTS;
  if (bucket === 'MIXED') return MIXED_ROASTS;
  return ENGLISH_ROASTS;
}

function readRecent(bucket: RoastBucket): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`python-from-hell-roast-history-${bucket}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(-12) : [];
  } catch {
    return [];
  }
}

function writeRecent(bucket: RoastBucket, recent: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`python-from-hell-roast-history-${bucket}`, JSON.stringify(recent.slice(-12)));
  } catch {
    // Roast history is optional; never let storage failure break learning.
  }
}

function pick(pool: string[], seed: string, bucket: RoastBucket): string {
  if (pool.length === 0) return 'Your code failed. Fix it.';

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const recent = readRecent(bucket);
  const available = pool.filter((line) => !recent.includes(line));
  const candidates = available.length > 0 ? available : pool;
  const roast = candidates[Math.abs(hash) % candidates.length] ?? candidates[0];
  writeRecent(bucket, [...recent.filter((line) => line !== roast), roast]);
  return roast;
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
    const selectedLanguage = roastLanguage ?? language;
    const bucket = bucketFor(selectedLanguage);
    const pool = poolFor(bucket);
    const intensityText = String(intensity ?? '').toUpperCase();
    const seed = [errorType, runtimeError, context.attemptCount, context.hintsUsed, Date.now(), intensityText, Math.random()].join('|');
    const roast = pick(pool, seed, bucket);
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
