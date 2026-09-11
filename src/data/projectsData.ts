export interface ProjectFile {
  name: string;
  initialContent: string;
  description: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  objective: string;
  requirements: string[];
  testHarness: string;
  expectedOutput: string;
  directorFeedbackOnSuccess: string;
  directorFeedbackOnFailure: string;
}

export interface PythonProject {
  id: string;
  title: string;
  category: 'CLI_TOOL' | 'DATA_PROCESSOR' | 'SYSTEM_UTILITY';
  difficulty: 'INTERMEDIATE' | 'ADVANCED';
  overview: string;
  files: ProjectFile[];
  milestones: ProjectMilestone[];
}

export const REAL_PROJECTS: PythonProject[] = [
  {
    id: 'proj_expense_cli',
    title: 'Hades Expense Ledger CLI',
    category: 'CLI_TOOL',
    difficulty: 'INTERMEDIATE',
    overview: 'A robust command-line expense tracker that manages structured financial transactions, computes category totals, and validates input integrity.',
    files: [
      {
        name: 'models.py',
        description: 'Data model definitions for Expense items',
        initialContent: `class Expense:
    def __init__(self, amount: float, category: str, description: str):
        # TODO: validate and normalize the incoming data.
        self.amount = amount
        self.category = category
        self.description = description

    def to_dict(self):
        # TODO: return a serializable dictionary.
        return {}`,
      },
      {
        name: 'ledger.py',
        description: 'Ledger management class handling additions and calculations',
        initialContent: `from models import Expense

class ExpenseLedger:
    def __init__(self):
        self.expenses = []

    def add_expense(self, amount, category, description):
        # TODO: reject non-positive amounts and store a normalized Expense.
        return None

    def get_total_by_category(self, category):
        # TODO: sum matching categories case-insensitively.
        return 0

    def get_grand_total(self):
        # TODO: sum every recorded expense.
        return 0`,
      },
      {
        name: 'main.py',
        description: 'CLI entry point and command processor',
        initialContent: `from ledger import ExpenseLedger

def run_app():
    ledger = ExpenseLedger()
    # TODO: add sample expenses and print the required totals.
    print(f"Grand Total: {ledger.get_grand_total()}")
    print(f"Food Total: {ledger.get_total_by_category('FOOD')}")

if __name__ == "__main__":
    run_app()`,
      },
    ],
    milestones: [
      {
        id: 'm1_models',
        title: 'Milestone 1: Immutable Expense Data Modeling',
        objective: 'Implement Expense class in models.py with positive float validation and to_dict serialization.',
        requirements: [
          'Expense(amount, category, description) must convert amount to float',
          'category must be standardized to uppercase',
          'to_dict() must return a dictionary with amount, category, description',
        ],
        testHarness: `from models import Expense
e = Expense(45.50, "  food ", "Lunch")
print(e.category)
print(e.to_dict())`,
        expectedOutput: `FOOD\n{'amount': 45.5, 'category': 'FOOD', 'description': 'Lunch'}`,
        directorFeedbackOnSuccess: 'Solid data modeling. Categories are properly standardized to uppercase.',
        directorFeedbackOnFailure: 'Expense instantiation failed or category uppercase stripping is missing.',
      },
      {
        id: 'm2_ledger_totals',
        title: 'Milestone 2: Ledger Category Aggregations',
        objective: 'Implement ExpenseLedger in ledger.py with add_expense and category summation.',
        requirements: [
          'add_expense must validate positive amount (> 0)',
          'get_total_by_category must sum matching categories case-insensitively',
          'get_grand_total must sum all recorded expenses',
        ],
        testHarness: `from ledger import ExpenseLedger
l = ExpenseLedger()
l.add_expense(100.0, "SERVERS", "AWS")
l.add_expense(50.0, "servers", "GCP")
l.add_expense(25.0, "FOOD", "Coffee")
print(f"Servers: {l.get_total_by_category('servers')}")
print(f"Grand Total: {l.get_grand_total()}")`,
        expectedOutput: `Servers: 150.0\nGrand Total: 175.0`,
        directorFeedbackOnSuccess: 'Aggregations verified! Both single-category and grand totals calculate accurately.',
        directorFeedbackOnFailure: 'Ledger totals do not match expected summation or category filtering failed.',
      },
      {
        id: 'm3_error_handling',
        title: 'Milestone 3: Defensive Input Validation & Exceptions',
        objective: 'Ensure ExpenseLedger rejects non-positive amounts with a ValueError.',
        requirements: [
          'Calling add_expense(-10, ...) or add_expense(0, ...) must raise ValueError',
          'Exceptions must not corrupt existing ledger records',
        ],
        testHarness: `from ledger import ExpenseLedger
l = ExpenseLedger()
try:
    l.add_expense(-50, "FOOD", "Invalid")
    print("FAILED")
except ValueError:
    print("REJECTED_NEGATIVE")

try:
    l.add_expense(0, "FOOD", "Zero")
    print("FAILED")
except ValueError:
    print("REJECTED_ZERO")`,
        expectedOutput: `REJECTED_NEGATIVE\nREJECTED_ZERO`,
        directorFeedbackOnSuccess: 'Defensive validation verified! Negative and zero amounts are rejected safely.',
        directorFeedbackOnFailure: 'Ledger allowed invalid or negative expense amounts without raising ValueError.',
      },
    ],
  },
];
