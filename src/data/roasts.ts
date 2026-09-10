import type { LearningLanguage, RoastIntensity } from '../types';

export type RoastCategory = 'SUCCESS' | 'SYNTAX' | 'INDENTATION' | 'VARIABLE' | 'TIMEOUT' | 'RUNTIME' | 'WRONG_ANSWER';

export interface RoastTemplate {
  id: string;
  category: RoastCategory;
  intensity: RoastIntensity;
  language: LearningLanguage;
  text: string;
}

export const ROASTS: RoastTemplate[] = [
  { id: 'hi-success-miracle', category: 'SUCCESS', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Arey wah, nalayak. Aaj code chal gaya — miracles officially exist.' },
  { id: 'hi-success-rescue', category: 'SUCCESS', intensity: 'SAVAGE', language: 'HINDI', text: 'BSDK, is baar Python ko rescue team nahi bulani padi. Sahi kaam kiya.' },
  { id: 'hi-success-processor', category: 'SUCCESS', intensity: 'DESI_SENIOR', language: 'HINDI', text: 'Oho, processor activate ho gaya. Ab next challenge mein bhi yahi dimaag dikha.' },
  { id: 'hi-syntax-gate', category: 'SYNTAX', intensity: 'SAVAGE', language: 'HINDI', text: 'Abe o, syntax dekh pehle. Python ne tera code seedha gate pe rok diya.' },
  { id: 'hi-syntax-punctuation', category: 'SYNTAX', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Yeh syntax nahi, punctuation ka crime scene hai. Bracket aur colon gin, bhai.' },
  { id: 'hi-syntax-mindread', category: 'SYNTAX', intensity: 'DESI_SENIOR', language: 'HINDI', text: 'Dhaakkan, Python mind-reading service nahi hai. Jo syntax chahiye woh likh.' },
  { id: 'hi-indent-spaces', category: 'INDENTATION', intensity: 'SAVAGE', language: 'HINDI', text: 'Indentation ko ignore karke hero mat ban. Python spaces ko tujhse zyada seriously leta hai.' },
  { id: 'hi-indent-stairs', category: 'INDENTATION', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Code ki seedhiyan tedhi kar di. Block ke andar wali lines ko properly indent kar.' },
  { id: 'hi-variable-rishtedaar', category: 'VARIABLE', intensity: 'SAVAGE', language: 'HINDI', text: 'Variable ka naam kuch aur, use kuch aur. Python tera rishtedaar nahi jo samajh jayega.' },
  { id: 'hi-variable-missing', category: 'VARIABLE', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Naam use karne se pehle variable bana. Hawa mein variable dhoondh raha hai kya?' },
  { id: 'hi-timeout-treadmill', category: 'TIMEOUT', intensity: 'SAVAGE', language: 'HINDI', text: 'Loop ko treadmill pe chadha diya. Worker band karke UI ki jaan bachayi.' },
  { id: 'hi-timeout-eternal', category: 'TIMEOUT', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Yeh loop nahi, reincarnation hai. Exit condition dekh aur dobara chala.' },
  { id: 'hi-runtime-lastline', category: 'RUNTIME', intensity: 'SAVAGE', language: 'HINDI', text: 'Code chala aur khud se ladne laga. Traceback ki last line padh — asli lafda wahi hai.' },
  { id: 'hi-runtime-debug', category: 'RUNTIME', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Kamine, runtime error drama nahi hai. Error name aur line number se bug pakad.' },
  { id: 'hi-output-target', category: 'WRONG_ANSWER', intensity: 'SAVAGE', language: 'HINDI', text: 'Output aaya hai, par target se iska purana jhagda lagta hai. Har line compare kar.' },
  { id: 'hi-output-confidence', category: 'WRONG_ANSWER', intensity: 'APOCALYPSE', language: 'HINDI', text: 'Confidence full, answer ulta. Spelling, spaces aur logic dobara check kar.' },
  { id: 'en-success-survives', category: 'SUCCESS', intensity: 'APOCALYPSE', language: 'ENGLISH', text: 'Unexpected development: your code survived contact with reality.' },
  { id: 'en-success-clean', category: 'SUCCESS', intensity: 'SAVAGE', language: 'ENGLISH', text: 'Well, that is annoyingly correct. Keep the standard up.' },
  { id: 'en-syntax-punctuation', category: 'SYNTAX', intensity: 'SAVAGE', language: 'ENGLISH', text: 'Python caught the punctuation crime before it could spread.' },
  { id: 'en-syntax-keyboard', category: 'SYNTAX', intensity: 'APOCALYPSE', language: 'ENGLISH', text: 'This is not syntax; it is a keyboard accident with ambitions.' },
  { id: 'en-indent-whitespace', category: 'INDENTATION', intensity: 'SAVAGE', language: 'ENGLISH', text: 'Python takes whitespace seriously. Your block needs to do the same.' },
  { id: 'en-variable-name', category: 'VARIABLE', intensity: 'SAVAGE', language: 'ENGLISH', text: 'You created one variable name and used another. Python is not guessing.' },
  { id: 'en-timeout-loop', category: 'TIMEOUT', intensity: 'SAVAGE', language: 'ENGLISH', text: 'That loop tried to become eternal. The worker was stopped before the UI suffered.' },
  { id: 'en-runtime-traceback', category: 'RUNTIME', intensity: 'SAVAGE', language: 'ENGLISH', text: 'Your code reached runtime and immediately argued with itself. Read the last traceback line.' },
  { id: 'en-output-mismatch', category: 'WRONG_ANSWER', intensity: 'SAVAGE', language: 'ENGLISH', text: 'It produced output. Correct output remains unconvinced.' },
];
