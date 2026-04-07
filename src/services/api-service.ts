
import type { Loan, Borrower, Payment, LoanType, LoanPlan, User } from '@/lib/types';
import { MOCK_BORROWERS, MOCK_LOANS, MOCK_PAYMENTS, MOCK_LOAN_PLANS, MOCK_LOAN_TYPES, MOCK_USERS } from '@/lib/mock-data';

// Helper for simulating async API calls with mock data
const simulate = <T>(data: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(data), 200));

// --- Auth Functions ---
export async function getCurrentUser(): Promise<User> {
  return simulate(MOCK_USERS[0]);
}

export async function logout(): Promise<void> {
  return simulate(undefined);
}

export async function forgotPassword(data: { email: string }): Promise<{ message: string }> {
  return simulate({ message: 'If that email exists, a link has been sent.' });
}

// --- Borrower Functions ---
export async function getBorrowers(): Promise<Borrower[]> {
  return simulate([...MOCK_BORROWERS]);
}

export async function createBorrower(data: Partial<Borrower>): Promise<Borrower> {
  const newB = { ...data, borrower_id: `b${Date.now()}`, created_at: new Date().toISOString() } as Borrower;
  MOCK_BORROWERS.push(newB);
  return simulate(newB);
}

// --- Loan Functions ---
export async function getLoans(): Promise<Loan[]> {
  return simulate([...MOCK_LOANS]);
}

export async function createLoan(data: Partial<Loan>): Promise<Loan> {
  const borrower = MOCK_BORROWERS.find(b => b.borrower_id === data.borrower_id);
  const newL = { 
    ...data, 
    loan_id: `L-${1000 + MOCK_LOANS.length + 1}`,
    borrower_name: borrower?.name || 'Unknown',
    remaining_balance: data.total_loan,
    status: 0,
    created_at: new Date().toISOString() 
  } as Loan;
  MOCK_LOANS.push(newL);
  return simulate(newL);
}

export async function getLoanTypes(): Promise<LoanType[]> {
  return simulate([...MOCK_LOAN_TYPES]);
}

export async function getLoanPlans(): Promise<LoanPlan[]> {
  return simulate([...MOCK_LOAN_PLANS]);
}

// --- Payment Functions ---
export async function getPayments(): Promise<Payment[]> {
  return simulate([...MOCK_PAYMENTS]);
}

export async function createPayment(data: Partial<Payment>): Promise<any> {
  const newP = { ...data, payment_id: `p${Date.now()}`, created_at: new Date().toISOString() } as Payment;
  MOCK_PAYMENTS.push(newP);
  
  // Update loan balance in mock data
  const loan = MOCK_LOANS.find(l => l.loan_id === data.loan_id);
  if (loan) {
    loan.remaining_balance = Math.max(0, loan.remaining_balance - (data.payment_amount || 0));
    if (loan.remaining_balance === 0) loan.status = 3;
  }
  
  return simulate({ message: 'Payment recorded' });
}

// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return simulate([...MOCK_USERS]);
}

export async function createUser(data: Partial<User>): Promise<User> {
  const newU = { ...data, id: Date.now() } as User;
  MOCK_USERS.push(newU);
  return simulate(newU);
}

export async function updateUser(id: number | string, data: Partial<User>): Promise<any> {
  return simulate({ message: 'User updated' });
}

export async function deleteUser(id: number | string): Promise<void> {
  return simulate(undefined);
}
