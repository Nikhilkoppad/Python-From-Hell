export type BugCategory =
  | 'SYNTAX_INDENTATION'
  | 'LOGIC_OFF_BY_ONE'
  | 'MUTABLE_DEFAULT_STATE'
  | 'SCOPE_SHADOWING'
  | 'TYPE_COERCION_CONCAT'
  | 'EXCEPTION_HANDLING';

export interface DebugTestCase {
  inputCode: string;
  expectedOutput: string;
  description: string;
  isHidden?: boolean;
}

export interface DebugScenario {
  id: string;
  title: string;
  category: BugCategory;
  difficulty: 'ROOKIE' | 'INTERMEDIATE' | 'NIGHTMARE';
  lore: string;
  symptom: string;
  buggyCode: string;
  clues: string[];
  publicTests: DebugTestCase[];
  hiddenTests: DebugTestCase[];
  misconceptionKey: string;
}

export const DEBUG_SCENARIOS: DebugScenario[] = [
  {
    id: 'debug_mutable_default',
    title: 'The Ghost Memory Trap',
    category: 'MUTABLE_DEFAULT_STATE',
    difficulty: 'INTERMEDIATE',
    lore: 'A backend microservice is accumulating user sessions across separate requests because of Python default argument evaluation quirks.',
    symptom: 'Calling add_session("user1") followed by add_session("user2") returns ["user1", "user2"] instead of isolated lists.',
    buggyCode: `def create_user_session(user_id, session_log=[]):
    # BUG: session_log default evaluates once at function definition time!
    session_log.append(user_id)
    return session_log

# Test calls
print(create_user_session("alice"))
print(create_user_session("bob"))`,
    clues: [
      'In Python, default parameter expressions are evaluated ONCE when the def statement executes, not on each call.',
      'Using a mutable default like [] or {} causes all calls that omit the parameter to share the exact same object in memory.',
      'Replace the default argument with None, and initialize session_log = [] inside the function if session_log is None.',
    ],
    publicTests: [
      {
        inputCode: 's1 = create_user_session("alice")\ns2 = create_user_session("bob")\nprint(s1)\nprint(s2)',
        expectedOutput: "['alice']\n['bob']",
        description: 'Verify sessions remain isolated between separate function calls',
      },
    ],
    hiddenTests: [
      {
        inputCode: 's3 = create_user_session("charlie", ["existing"])\nprint(s3)\ns4 = create_user_session("david")\nprint(s4)',
        expectedOutput: "['existing', 'charlie']\n['david']",
        description: 'Verify explicit list parameter works while default remains isolated',
        isHidden: true,
      },
    ],
    misconceptionKey: 'Mutable Default Argument Memory Leak',
  },
  {
    id: 'debug_off_by_one',
    title: 'The Out-of-Bounds Abyss',
    category: 'LOGIC_OFF_BY_ONE',
    difficulty: 'ROOKIE',
    lore: 'A batch processor is crashing with an IndexError or skipping the final element in array chunking routines.',
    symptom: 'get_even_indexed_elements([10, 20, 30, 40, 50]) crashes with IndexError or misses index 4.',
    buggyCode: `def get_even_indexed_elements(items):
    evens = []
    # BUG: range(0, len(items) + 1) goes one index beyond array bounds!
    for i in range(0, len(items) + 1):
        if i % 2 == 0:
            evens.append(items[i])
    return evens

print(get_even_indexed_elements([10, 20, 30, 40, 50]))`,
    clues: [
      'Python list indices run from 0 up to len(items) - 1.',
      'range(0, len(items) + 1) generates indices up to len(items), which does not exist in items.',
      'Change the range to range(0, len(items)) or simply iterate with step: range(0, len(items), 2).',
    ],
    publicTests: [
      {
        inputCode: 'print(get_even_indexed_elements([10, 20, 30, 40, 50]))',
        expectedOutput: '[10, 30, 50]',
        description: 'Extract elements at indices 0, 2, 4 without crashing',
      },
    ],
    hiddenTests: [
      {
        inputCode: 'print(get_even_indexed_elements([]))\nprint(get_even_indexed_elements([99]))',
        expectedOutput: '[]\n[99]',
        description: 'Handle empty lists and single-element lists cleanly',
        isHidden: true,
      },
    ],
    misconceptionKey: 'Range Index Boundary Off-By-One',
  },
  {
    id: 'debug_scope_shadowing',
    title: 'The Shadowed Counter',
    category: 'SCOPE_SHADOWING',
    difficulty: 'INTERMEDIATE',
    lore: 'A transaction tally function is raising UnboundLocalError when trying to update a module-level total counter.',
    symptom: 'Running tally_transaction(50) throws UnboundLocalError: local variable "total_balance" referenced before assignment.',
    buggyCode: `total_balance = 100

def tally_transaction(amount):
    # BUG: modifying total_balance treats it as local unless declared global
    total_balance = total_balance + amount
    return total_balance

print(tally_transaction(50))`,
    clues: [
      'In Python, assigning to a variable inside a function marks that variable as local to the entire function scope.',
      'Because total_balance is read before the assignment on the same line, Python looks for a local total_balance that does not exist yet.',
      'Add "global total_balance" at the top of the function to explicitly reference the module-level variable.',
    ],
    publicTests: [
      {
        inputCode: 'total_balance = 100\nprint(tally_transaction(50))\nprint(total_balance)',
        expectedOutput: '150\n150',
        description: 'Update and return global balance correctly',
      },
    ],
    hiddenTests: [
      {
        inputCode: 'print(tally_transaction(-30))\nprint(total_balance)',
        expectedOutput: '120\n120',
        description: 'Handle negative adjustments correctly across multiple transactions',
        isHidden: true,
      },
    ],
    misconceptionKey: 'UnboundLocalError / Global Scope Shadowing',
  },
  {
    id: 'debug_type_coercion',
    title: 'The Concatenation Catastrophe',
    category: 'TYPE_COERCION_CONCAT',
    difficulty: 'ROOKIE',
    lore: 'An order processing invoice generator crashes with TypeError: can only concatenate str (not "int") to str.',
    symptom: 'format_receipt("Order", 1024, 45) fails with TypeError instead of returning formatted receipt string.',
    buggyCode: `def format_receipt(item_name, order_id, price):
    # BUG: Attempting string concatenation directly with raw integers
    return "RECEIPT #" + order_id + " - " + item_name + " : $" + price

print(format_receipt("Keyboard", 1024, 45))`,
    clues: [
      'Python is strongly typed and will NEVER automatically coerce integers to strings during the + operation.',
      'Convert order_id and price to str(order_id) and str(price) or use an f-string: f"RECEIPT #{order_id} - {item_name} : ${price}".',
      'F-strings are the cleanest and most idiomatic Python 3.11 solution.',
    ],
    publicTests: [
      {
        inputCode: 'print(format_receipt("Keyboard", 1024, 45))',
        expectedOutput: 'RECEIPT #1024 - Keyboard : $45',
        description: 'Format invoice receipt with mixed string and numeric parameters',
      },
    ],
    hiddenTests: [
      {
        inputCode: 'print(format_receipt("Desk", 0, 0))',
        expectedOutput: 'RECEIPT #0 - Desk : $0',
        description: 'Handle zero values correctly without type errors',
        isHidden: true,
      },
    ],
    misconceptionKey: 'Implicit Type Coercion Assumption',
  },
];
