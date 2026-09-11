import type { ChallengeType, HellChallenge } from "../types/learning";

export interface TeachingSection {
  title: string;
  explanation: string;
  exampleCode?: string;
  exampleOutput?: string;
  teacherNote?: string;
}

export interface Terminology {
  term: string;
  simpleDefinition: string;
  brutalDefinition: string;
}

export interface KnowledgeCheck {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Challenge {
  id: string;
  instruction: string;
  starterCode: string;
  expectedOutput: string;

  requiredCodePatterns?: Array<{
    pattern: string;
    explanation: string;
  }>;

  type?: ChallengeType;
  title?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  hints?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  stage: string;
  concept: string;

  brutalIntro: string;

  teachingSections: TeachingSection[];

  terminology: Terminology[];

  knowledgeCheck: KnowledgeCheck;

  challenges: Challenge[];
}

export interface Level {
  id: string;
  title: string;
  lessons: Lesson[];
}

/*
|--------------------------------------------------------------------------
| PYTHON FROM HELL
|--------------------------------------------------------------------------
|
| The curriculum is deliberately structured around multiple kinds of
| evidence instead of only output-based coding.
|
| A learner should eventually be able to:
|
| PREDICT → TRACE → FIX → DEBUG → BUILD → EXPLAIN → BOSS
|
|--------------------------------------------------------------------------
*/

export const CURRICULUM: Level[] = [
  {
    id: "level_01",
    title: "THE PIT OF SYNTAX",
    lessons: [
      {
        id: "l1_1_print",
        title: "Print Ritual",
        stage: "HELL 01 // SYNTAX",
        concept: "print()",
        brutalIntro: "Welcome to Python. Your first task is so easy that failing it should probably trigger an investigation.",
        teachingSections: [
          { title: "What is print()?", explanation: "print() tells Python to display something in the terminal. Think of it as Python's mouth. You give it something, and it spits it onto the screen.", exampleCode: 'print("Hello, Python")', exampleOutput: "Hello, Python", teacherNote: "Do not confuse displaying a value with storing a value. print() displays. Variables store." },
          { title: "Strings", explanation: "Text inside quotes is called a string. Python needs the quotes so it knows you mean text rather than a variable or instruction.", exampleCode: 'print("I have entered Hell")', exampleOutput: "I have entered Hell" },
          { title: "Multiple values", explanation: "print() can receive multiple values separated by commas. Python will place spaces between them by default.", exampleCode: 'print("Level", 1)', exampleOutput: "Level 1" },
        ],
        terminology: [
          { term: "print", simpleDefinition: "A function used to display information.", brutalDefinition: "Python's loudspeaker. Whatever you shove into it gets announced." },
          { term: "string", simpleDefinition: "A sequence of text characters.", brutalDefinition: "Text wearing quotation marks so Python doesn't mistake it for something else." },
          { term: "function", simpleDefinition: "Reusable code that performs an action.", brutalDefinition: "A piece of code somebody already wrote so you don't have to reinvent the wheel like an idiot." },
        ],
        knowledgeCheck: { question: "What does print('Hello') actually do?", options: ["Stores Hello in memory", "Displays Hello", "Creates a variable named Hello", "Deletes Hello"], correctAnswer: 1, explanation: "print() displays the supplied value. It does not automatically create a variable." },
        challenges: [
          { id: "l1_1_predict_01", type: "PREDICT", title: "Predict the Output", difficulty: 1, instruction: 'Without running the code, predict exactly what Python will display:\n\nprint("Python From Hell")', starterCode: 'print("Python From Hell")', expectedOutput: "Python From Hell", hints: ["Read the argument inside print().", "The quotation marks mean the content is text."] },
          { id: "l1_1_build_01", type: "BUILD", title: "Announce Yourself", difficulty: 1, instruction: 'Write a program that prints exactly:\n\n"I HAVE ENTERED HELL"', starterCode: "# Write your code below\n", expectedOutput: "I HAVE ENTERED HELL", requiredCodePatterns: [{ pattern: "print", explanation: "You need to use Python's print() function." }], hints: ["You need the print() function.", "The sentence is text, so Python needs quotation marks."] },
          { id: "l1_1_fix_01", type: "FIX", title: "Fix the Ritual", difficulty: 1, instruction: "The code below is broken. Fix it so it prints:\n\nPython is watching", starterCode: 'print("Python is watching"\n', expectedOutput: "Python is watching", requiredCodePatterns: [{ pattern: "print", explanation: "The solution should use print()." }], hints: ["Look carefully at the parentheses.", "Every opening parenthesis needs its closing partner."] },
          { id: "l1_1_explain_01", type: "EXPLAIN", title: "Explain the Mouth", difficulty: 1, instruction: "Explain in your own words what print() does.", starterCode: "", expectedOutput: "display", hints: ["Think about what appears in the terminal."] },
        ],
      },
      {
        id: "l1_2_variables",
        title: "Variable Binding",
        stage: "HELL 01 // SYNTAX",
        concept: "variables",
        brutalIntro: "Now we teach Python how to remember shit. Congratulations: your program gets a tiny memory. Try not to lose it.",
        teachingSections: [
          { title: "Variables store values", explanation: "A variable is a name that refers to a value. Python uses = for assignment.", exampleCode: 'name = "Nikhil"\nprint(name)', exampleOutput: "Nikhil" },
          { title: "Numbers", explanation: "Variables can hold numbers as well as text.", exampleCode: "level = 7\nprint(level)", exampleOutput: "7" },
          { title: "Changing values", explanation: "A variable can be assigned a new value. The latest assignment becomes the current value.", exampleCode: "score = 10\nscore = 20\nprint(score)", exampleOutput: "20" },
        ],
        terminology: [
          { term: "variable", simpleDefinition: "A name referring to a value.", brutalDefinition: "A labelled box where Python keeps your shit until you replace it." },
          { term: "assignment", simpleDefinition: "Giving a value to a variable.", brutalDefinition: "Telling Python, 'this name now points at this thing.'" },
          { term: "=", simpleDefinition: "The assignment operator.", brutalDefinition: "Not 'equals' in the mathematical sense here. It means 'put this value over there.'" },
        ],
        knowledgeCheck: { question: "After score = 25, what value does score contain?", options: ["0", "5", "25", "score"], correctAnswer: 2, explanation: "The assignment stores the value 25 under the name score." },
        challenges: [
          { id: "l1_2_predict_01", type: "PREDICT", title: "Variable Autopsy", difficulty: 1, instruction: "Predict the output:\n\nscore = 10\nscore = 25\nprint(score)", starterCode: "score = 10\nscore = 25\nprint(score)", expectedOutput: "25", hints: ["Python executes assignments from top to bottom.", "The second assignment replaces the first value."] },
          { id: "l1_2_build_01", type: "BUILD", title: "Create Your Score", difficulty: 1, instruction: "Create a variable called score containing 100, then print it.", starterCode: "# Create score here\n", expectedOutput: "100", requiredCodePatterns: [{ pattern: "score", explanation: "A variable named score is required." }], hints: ["Create score using assignment.", "Then pass score into print()."] },
          { id: "l1_2_trace_01", type: "TRACE", title: "Track the Variable", difficulty: 2, instruction: "Predict the final value of health:\n\nhealth = 100\nhealth = health - 30\nhealth = health - 20\nprint(health)", starterCode: "health = 100\nhealth = health - 30\nhealth = health - 20\nprint(health)", expectedOutput: "50", hints: ["Track health after every line.", "100 - 30 = 70. Then subtract 20 again."] },
          { id: "l1_2_fix_01", type: "FIX", title: "Repair the Variable", difficulty: 2, instruction: "Fix the code so it prints 30.", starterCode: "score = 20\nscore = score + 10\nprint(scores)\n", expectedOutput: "30", hints: ["Look at the variable name used in print().", "Python cares about exact names."] },
        ],
      },
      {
        id: "l1_3_strings",
        title: "String Manipulation",
        stage: "HELL 01 // SYNTAX",
        concept: "strings",
        brutalIntro: "Text manipulation. Because apparently printing text wasn't enough suffering. Now we're going to cut it, join it and shove variables inside it.",
        teachingSections: [
          { title: "Joining strings", explanation: "The + operator can join strings together.", exampleCode: 'first = "Python"\nsecond = "Hell"\nprint(first + " " + second)', exampleOutput: "Python Hell" },
          { title: "String methods", explanation: "Strings have built-in methods such as upper() and lower().", exampleCode: 'name = "python"\nprint(name.upper())', exampleOutput: "PYTHON" },
          { title: "Length", explanation: "len() returns the number of characters in a string.", exampleCode: 'word = "Python"\nprint(len(word))', exampleOutput: "6" },
        ],
        terminology: [
          { term: "concatenation", simpleDefinition: "Joining strings together.", brutalDefinition: "Taking two pieces of text and gluing them together with +." },
          { term: "method", simpleDefinition: "A function associated with an object.", brutalDefinition: "A capability attached to a value so you can make it do useful shit." },
          { term: "len()", simpleDefinition: "Returns the length of a sequence.", brutalDefinition: "Python's measuring tape." },
        ],
        knowledgeCheck: { question: 'What does "Py" + "thon" produce?', options: ["Py thon", "Python", "Py+thon", "Error"], correctAnswer: 1, explanation: "The + operator concatenates the two strings." },
        challenges: [
          { id: "l1_3_predict_01", type: "PREDICT", title: "String Surgery", difficulty: 1, instruction: 'Predict the output:\n\nword = "python"\nprint(word.upper())', starterCode: 'word = "python"\nprint(word.upper())', expectedOutput: "PYTHON", hints: ["upper() changes the letters to uppercase."] },
          { id: "l1_3_build_01", type: "BUILD", title: "Forge a Name", difficulty: 2, instruction: 'Create first = "Python" and second = "Hell", then print them as:\n\nPython Hell', starterCode: "# Write your code here\n", expectedOutput: "Python Hell", hints: ["Create two string variables.", "Join them with a space between them."] },
          { id: "l1_3_debug_01", type: "DEBUG", title: "String Crime Scene", difficulty: 2, instruction: "Fix this program so it prints PYTHON.", starterCode: 'word = "python"\nprint(word.upper)', expectedOutput: "PYTHON", requiredCodePatterns: [{ pattern: "upper", explanation: "The upper method must be called." }], hints: ["upper is a method.", "Ask yourself what is missing after the method name."] },
          { id: "l1_3_explain_01", type: "EXPLAIN", title: "Explain upper()", difficulty: 2, instruction: "Explain what .upper() does to a string.", starterCode: "", expectedOutput: "uppercase", hints: ["Think about what happens to lowercase letters."] },
        ],
      },
    ],
  },
  {
    id: "level_02",
    title: "CONTROL FLOW PURGATORY",
    lessons: [
      {
        id: "l2_1_conditionals",
        title: "Judicial Logic",
        stage: "HELL 02 // CONTROL FLOW",
        concept: "conditionals",
        brutalIntro: "Python now gets to make decisions. Unfortunately, your code will still make worse decisions than your average YouTube comment section.",
        teachingSections: [
          { title: "if", explanation: "if executes a block of code only when a condition is true.", exampleCode: 'score = 80\nif score >= 50:\n    print("PASS")', exampleOutput: "PASS" },
          { title: "else", explanation: "else runs when the if condition is false.", exampleCode: 'score = 30\nif score >= 50:\n    print("PASS")\nelse:\n    print("FAIL")', exampleOutput: "FAIL" },
          { title: "elif", explanation: "elif lets Python test another condition when the previous condition was false.", exampleCode: 'score = 75\n\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")', exampleOutput: "B" },
        ],
        terminology: [
          { term: "condition", simpleDefinition: "An expression that evaluates to True or False.", brutalDefinition: "A yes/no question Python uses before deciding what shit to execute." },
          { term: "if", simpleDefinition: "Executes code when a condition is true.", brutalDefinition: "Python's 'if this happens, do this' command." },
          { term: "else", simpleDefinition: "Runs when the previous condition is false.", brutalDefinition: "The backup plan for when your first idea gets rejected." },
        ],
        knowledgeCheck: { question: "When does the code inside an if block execute?", options: ["Always", "When the condition is True", "Only when the condition is False", "Randomly"], correctAnswer: 1, explanation: "The if block executes when its condition evaluates to True." },
        challenges: [
          { id: "l2_1_predict_01", type: "PREDICT", title: "Judge the Code", difficulty: 2, instruction: 'Predict the output:\n\nage = 20\nif age >= 18:\n    print("ADULT")\nelse:\n    print("MINOR")', starterCode: 'age = 20\nif age >= 18:\n    print("ADULT")\nelse:\n    print("MINOR")', expectedOutput: "ADULT", hints: ["20 is greater than or equal to 18."] },
          { id: "l2_1_build_01", type: "BUILD", title: "Pass or Fail", difficulty: 2, instruction: "Create a program with score = 60 that prints PASS when score is at least 50 and FAIL otherwise.", starterCode: "score = 60\n# Write your condition below\n", expectedOutput: "PASS", requiredCodePatterns: [{ pattern: "if", explanation: "The solution requires an if condition." }], hints: ["Compare score with 50.", "Use >= because 50 itself should pass."] },
          { id: "l2_1_fix_01", type: "FIX", title: "Repair the Judge", difficulty: 2, instruction: "Fix the indentation so the program prints PASS.", starterCode: 'score = 80\nif score >= 50:\nprint("PASS")', expectedOutput: "PASS", requiredCodePatterns: [{ pattern: "if", explanation: "The solution must contain the conditional." }], hints: ["Python uses indentation to define blocks.", "The print statement belongs inside the if block."] },
          { id: "l2_1_debug_01", type: "DEBUG", title: "Conditional Crime Scene", difficulty: 3, instruction: "The program should print ADULT when age is 20. Fix the error.", starterCode: 'age = 20\nif age >= 18\n    print("ADULT")', expectedOutput: "ADULT", hints: ["Look at the end of the if condition.", "Python expects something there before the block begins."] },
        ],
      },
      {
        id: "l2_2_loops",
        title: "Eternal Loops",
        stage: "HELL 02 // CONTROL FLOW",
        concept: "loops",
        brutalIntro: "Now we make Python repeat things. Yes, we are deliberately teaching you how to create code that can potentially run forever.",
        teachingSections: [
          { title: "for loops", explanation: "A for loop repeats code for each item in a sequence or range.", exampleCode: "for i in range(3):\n    print(i)", exampleOutput: "0\n1\n2" },
          { title: "range()", explanation: "range(n) produces numbers starting at 0 and ending before n.", exampleCode: "for i in range(5):\n    print(i)", exampleOutput: "0\n1\n2\n3\n4" },
          { title: "while", explanation: "A while loop continues while its condition remains true.", exampleCode: "count = 0\nwhile count < 3:\n    print(count)\n    count += 1", exampleOutput: "0\n1\n2" },
        ],
        terminology: [
          { term: "loop", simpleDefinition: "A structure that repeats code.", brutalDefinition: "Python's way of saying 'do this again until I say stop.'" },
          { term: "range", simpleDefinition: "Generates a sequence of numbers.", brutalDefinition: "A number dispenser that starts counting from 0 unless you tell it otherwise." },
          { term: "iteration", simpleDefinition: "One execution of a loop.", brutalDefinition: "One lap around the loop before Python sends you around again." },
        ],
        knowledgeCheck: { question: "What numbers does range(3) produce?", options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"], correctAnswer: 1, explanation: "range(3) starts at 0 and stops before 3." },
        challenges: [
          { id: "l2_2_predict_01", type: "PREDICT", title: "Count the Damn Things", difficulty: 2, instruction: "Predict the output:\n\nfor i in range(3):\n    print(i)", starterCode: "for i in range(3):\n    print(i)", expectedOutput: "0\n1\n2", hints: ["range(3) starts at 0.", "The stopping value 3 is not included."] },
          { id: "l2_2_build_01", type: "BUILD", title: "Summon Five Numbers", difficulty: 2, instruction: "Write a for loop that prints the numbers 0 through 4, one per line.", starterCode: "# Write your loop here\n", expectedOutput: "0\n1\n2\n3\n4", requiredCodePatterns: [{ pattern: "for", explanation: "A for loop is required." }, { pattern: "range", explanation: "Use range() to generate the numbers." }], hints: ["Use for with range().", "range(5) gives 0 through 4."] },
          { id: "l2_2_trace_01", type: "TRACE", title: "Follow the Counter", difficulty: 3, instruction: "Predict the final value:\n\ncount = 0\nfor i in range(4):\n    count += 2\nprint(count)", starterCode: "count = 0\nfor i in range(4):\n    count += 2\nprint(count)", expectedOutput: "8", hints: ["The loop runs four times.", "Each iteration adds 2."] },
          { id: "l2_2_debug_01", type: "DEBUG", title: "Infinite Idiocy", difficulty: 3, instruction: "Fix the loop so it prints 0, 1, 2 and then stops.", starterCode: "count = 0\nwhile count < 3:\n    print(count)", expectedOutput: "0\n1\n2", hints: ["The condition never changes.", "Something needs to happen to count inside the loop."] },
        ],
      },
    ],
  },
  {
    id: "level_03",
    title: "THE COLLECTIONS ABYSS",
    lessons: [
      {
        id: "l3_1_lists",
        title: "List Prison",
        stage: "HELL 03 // COLLECTIONS",
        concept: "lists",
        brutalIntro: "One value wasn't enough, apparently. Now we're putting multiple values into one container and giving you more opportunities to index the wrong fucking thing.",
        teachingSections: [
          { title: "Creating lists", explanation: "Lists store multiple values in square brackets.", exampleCode: 'fruits = ["apple", "banana", "mango"]\nprint(fruits)', exampleOutput: "['apple', 'banana', 'mango']" },
          { title: "Indexing", explanation: "Python lists use zero-based indexing. The first item is index 0.", exampleCode: 'fruits = ["apple", "banana", "mango"]\nprint(fruits[0])', exampleOutput: "apple" },
          { title: "Appending", explanation: "append() adds an item to the end of a list.", exampleCode: 'numbers = [1, 2]\nnumbers.append(3)\nprint(numbers)', exampleOutput: "[1, 2, 3]" },
        ],
        terminology: [
          { term: "list", simpleDefinition: "An ordered collection of values.", brutalDefinition: "A Python container where you throw multiple values together and hope your indexing survives." },
          { term: "index", simpleDefinition: "The position of an item in a sequence.", brutalDefinition: "The item's seat number. Python starts counting seats from 0 because apparently normal counting was too easy." },
          { term: "append", simpleDefinition: "Adds an item to the end of a list.", brutalDefinition: "Shoves another item onto the end of the list." },
        ],
        knowledgeCheck: { question: 'What is the index of "apple" in ["apple", "banana"]?', options: ["0", "1", "2", "-1"], correctAnswer: 0, explanation: "Python uses zero-based indexing, so the first item is at index 0." },
        challenges: [
          { id: "l3_1_predict_01", type: "PREDICT", title: "Index Trial", difficulty: 2, instruction: 'Predict the output:\n\nitems = ["A", "B", "C"]\nprint(items[1])', starterCode: 'items = ["A", "B", "C"]\nprint(items[1])', expectedOutput: "B", hints: ["Remember that indexing starts at 0."] },
          { id: "l3_1_build_01", type: "BUILD", title: "Build the List", difficulty: 2, instruction: 'Create a list containing "Python", "From", "Hell" and print the second item.', starterCode: "# Write your code here\n", expectedOutput: "From", hints: ["Create a list with three strings.", "The second item has index 1."] },
          { id: "l3_1_debug_01", type: "DEBUG", title: "Index Disaster", difficulty: 3, instruction: 'Fix the program so it prints "Python".', starterCode: 'items = ["Python", "Hell"]\nprint(items[1])', expectedOutput: "Python", hints: ["Which index points to the first item?"] },
        ],
      },
    ],
  },
  {
    id: "level_04",
    title: "FUNCTION FORGE",
    lessons: [
      {
        id: "l4_1_functions",
        title: "Function Summoning",
        stage: "HELL 04 // FUNCTIONS",
        concept: "functions",
        brutalIntro: "Congratulations. Your programs are becoming large enough that copying the same shit repeatedly is now officially stupid. Meet functions.",
        teachingSections: [
          { title: "Defining a function", explanation: "Functions package reusable logic under a name.", exampleCode: 'def greet():\n    print("Hello")\n\ngreet()', exampleOutput: "Hello" },
          { title: "Parameters", explanation: "Parameters allow functions to receive input.", exampleCode: 'def greet(name):\n    print("Hello", name)\n\ngreet("Nikhil")', exampleOutput: "Hello Nikhil" },
          { title: "return", explanation: "return sends a value back to the code that called the function.", exampleCode: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))", exampleOutput: "5" },
        ],
        terminology: [
          { term: "function", simpleDefinition: "Reusable block of code.", brutalDefinition: "A reusable machine that saves you from copying the same garbage everywhere." },
          { term: "parameter", simpleDefinition: "A named input accepted by a function.", brutalDefinition: "A slot where you shove information into your function." },
          { term: "return", simpleDefinition: "Sends a value back from a function.", brutalDefinition: "The function handing your result back instead of just screaming into the void." },
        ],
        knowledgeCheck: { question: "What does return do inside a function?", options: ["Repeats the function", "Stops Python completely", "Sends a value back to the caller", "Prints automatically"], correctAnswer: 2, explanation: "return sends a value back to the code that called the function." },
        challenges: [
          { id: "l4_1_predict_01", type: "PREDICT", title: "Function Autopsy", difficulty: 2, instruction: "Predict the output:\n\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))", starterCode: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))", expectedOutput: "5", hints: ["The function adds its two parameters."] },
          { id: "l4_1_build_01", type: "BUILD", title: "Forge an Adder", difficulty: 3, instruction: "Create a function called multiply(a, b) that returns a multiplied by b. Then print multiply(4, 5).", starterCode: "# Define your function here\n", expectedOutput: "20", requiredCodePatterns: [{ pattern: "def", explanation: "You must define a function." }, { pattern: "return", explanation: "The function must return the result." }], hints: ["Define multiply with two parameters.", "Return a * b."] },
          { id: "l4_1_debug_01", type: "DEBUG", title: "Return From Hell", difficulty: 3, instruction: "Fix the function so print(calculate(5, 2)) outputs 7.", starterCode: "def calculate(a, b):\n    a + b\n\nprint(calculate(5, 2))", expectedOutput: "7", hints: ["The expression is calculated but never sent back.", "What keyword sends a value out of a function?"] },
        ],
      },
    ],
  },
  {
    id: "level_05",
    title: "ERROR INFERNO",
    lessons: [
      {
        id: "l5_1_exceptions",
        title: "Traceback Torture",
        stage: "HELL 05 // ERRORS",
        concept: "exceptions",
        brutalIntro: "You will now learn the most important Python skill: reading the error message instead of staring at the screen like the computer personally betrayed you.",
        teachingSections: [
          { title: "Errors are information", explanation: "A traceback tells you what went wrong and where Python encountered the problem.", exampleCode: 'number = int("hello")', exampleOutput: "ValueError" },
          { title: "try and except", explanation: "try contains risky code. except handles a matching exception.", exampleCode: 'try:\n    number = int("hello")\nexcept ValueError:\n    print("Invalid number")', exampleOutput: "Invalid number" },
        ],
        terminology: [
          { term: "exception", simpleDefinition: "An error condition raised during program execution.", brutalDefinition: "Python throwing a warning flare because your code just walked into traffic." },
          { term: "traceback", simpleDefinition: "Information describing where an error occurred.", brutalDefinition: "Python's crime-scene report." },
          { term: "try", simpleDefinition: "Block containing code that may raise an exception.", brutalDefinition: "The 'let's see how badly this explodes' section." },
        ],
        knowledgeCheck: { question: "Why should you read a traceback?", options: ["It is decorative", "It identifies useful information about the failure", "It automatically fixes your code", "It deletes the program"], correctAnswer: 1, explanation: "Tracebacks contain valuable information about the exception and where it occurred." },
        challenges: [
          { id: "l5_1_debug_01", type: "DEBUG", title: "Read the Crime Scene", difficulty: 3, instruction: 'Fix the program so it prints "Invalid number" instead of crashing.', starterCode: 'try:\n    number = int("hello")\nexcept:\n    print("Invalid number")', expectedOutput: "Invalid number", hints: ["The program already catches the error.", "Run it and inspect what actually happens."] },
          { id: "l5_1_build_01", type: "BUILD", title: "Catch the Explosion", difficulty: 4, instruction: 'Write a program that attempts int("abc") and catches ValueError, printing exactly:\n\nBAD INPUT', starterCode: "# Write your code here\n", expectedOutput: "BAD INPUT", requiredCodePatterns: [{ pattern: "try", explanation: "The risky conversion should be inside try." }, { pattern: "except", explanation: "The exception must be handled." }, { pattern: "ValueError", explanation: "Catch the specific conversion error." }], hints: ["Put int('abc') inside try.", "Catch ValueError.", "Print BAD INPUT inside the handler."] },
        ],
      },
    ],
  },
  {
    id: "level_06",
    title: "OBJECT ORIENTED ABYSS",
    lessons: [
      {
        id: "l6_1_classes",
        title: "Class Summoning",
        stage: "HELL 06 // OOP",
        concept: "classes and objects",
        brutalIntro: "Welcome to Object-Oriented Programming. This is where Python developers discover that making simple things complicated can apparently be an entire career.",
        teachingSections: [
          { title: "Classes", explanation: "A class defines the structure and behavior that objects created from it can have.", exampleCode: 'class Dog:\n    def bark(self):\n        print("Woof")\n\ndog = Dog()\ndog.bark()', exampleOutput: "Woof" },
          { title: "__init__", explanation: "__init__ runs when an object is created and is commonly used to initialize attributes.", exampleCode: 'class Person:\n    def __init__(self, name):\n        self.name = name\n\nperson = Person("Nikhil")\nprint(person.name)', exampleOutput: "Nikhil" },
        ],
        terminology: [
          { term: "class", simpleDefinition: "A blueprint for creating objects.", brutalDefinition: "A blueprint for making a whole army of similar objects." },
          { term: "object", simpleDefinition: "An instance of a class.", brutalDefinition: "The actual thing created from your class blueprint." },
          { term: "self", simpleDefinition: "Reference to the current object.", brutalDefinition: "Python's way of saying 'this particular bastard right here.'" },
        ],
        knowledgeCheck: { question: "What is an object created from a class called?", options: ["An instance", "A loop", "A traceback", "A module"], correctAnswer: 0, explanation: "An object created from a class is an instance of that class." },
        challenges: [
          { id: "l6_1_build_01", type: "BUILD", title: "Create a Dog", difficulty: 4, instruction: 'Create a Dog class with a bark() method that prints "WOOF". Create an object and call bark().', starterCode: "# Create your class here\n", expectedOutput: "WOOF", requiredCodePatterns: [{ pattern: "class", explanation: "You must define a class." }, { pattern: "bark", explanation: "The class needs a bark method." }], hints: ["Define class Dog.", "Create bark(self).", "Instantiate Dog and call bark()."] },
          { id: "l6_1_debug_01", type: "DEBUG", title: "Self Destruction", difficulty: 4, instruction: 'Fix the class so it prints "HELLO".', starterCode: 'class Greeter:\n    def greet():\n        print("HELLO")\n\ng = Greeter()\ng.greet()', expectedOutput: "HELLO", hints: ["Instance methods receive the current object automatically.", "Look at the method parameters."] },
        ],
      },
    ],
  },
];

export function toHellChallenge(challenge: Challenge, lesson: Lesson): HellChallenge {
  return { id: challenge.id, type: challenge.type ?? "BUILD", title: challenge.title ?? challenge.id, instruction: challenge.instruction, concept: lesson.concept, skillId: lesson.id, difficulty: challenge.difficulty ?? 1, starterCode: challenge.starterCode, expectedOutput: challenge.expectedOutput, requiredCodePatterns: challenge.requiredCodePatterns, hints: challenge.hints };
}

export function findLesson(lessonId: string): Lesson | undefined {
  for (const level of CURRICULUM) {
    const lesson = level.lessons.find((item) => item.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function findChallenge(challengeId: string): { lesson: Lesson; challenge: Challenge } | undefined {
  for (const level of CURRICULUM) {
    for (const lesson of level.lessons) {
      const challenge = lesson.challenges.find((item) => item.id === challengeId);
      if (challenge) return { lesson, challenge };
    }
  }
  return undefined;
}

export function getAllLessons(): Lesson[] { return CURRICULUM.flatMap((level) => level.lessons); }

export function getAllChallenges(): { lesson: Lesson; challenge: Challenge }[] {
  return CURRICULUM.flatMap((level) => level.lessons.flatMap((lesson) => lesson.challenges.map((challenge) => ({ lesson, challenge }))));
}
