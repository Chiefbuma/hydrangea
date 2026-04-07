
import type { Loan, Borrower, Payment, LoanType, LoanPlan, User } from '@/lib/types';
import { 
  MOCK_BORROWERS, 
  MOCK_LOANS, 
  MOCK_PAYMENTS, 
  MOCK_LOAN_TYPES, 
  MOCK_LOAN_PLANS, 
  MOCK_USERS 
} from '@/lib/mock-data';

// --- Auth Functions (Mocked) ---

export async function login(credentials: {email: string, password: string}): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password') {
        return user;
    }
    throw new Error('Invalid credentials');
}

export async function getCurrentUser(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_USERS[0]; // Default to admin for mock
}

export async function logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
}

export async function forgotPassword(data: {email: string}): Promise<{message: string}> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'If a user with that email exists, a password reset link has been sent.' };
}


// --- Borrower Functions (Mocked) ---

export async function getBorrowers(): Promise<Borrower[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [...MOCK_BORROWERS];
}

export async function getBorrowerById(id: string): Promise<Borrower | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_BORROWERS.find(b => b.borrower_id === id);
}

export async function createBorrower(data: Partial<Borrower>): Promise<Borrower> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        ...data,
        borrower_id: `b${Date.now()}`,
        created_at: new Date().toISOString(),
    } as Borrower;
}


// --- Loan Functions (Mocked) ---

export async function getLoans(): Promise<Loan[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_LOANS];
}

export async function getLoanById(id: string): Promise<Loan | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_LOANS.find(l => l.loan_id === id);
}

export async function createLoan(data: Partial<Loan>): Promise<Loan> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        ...data,
        loan_id: `L-${Math.floor(Math.random() * 9000) + 1000}`,
        created_at: new Date().toISOString(),
    } as Loan;
}

export async function getLoanTypes(): Promise<LoanType[]> {
    return MOCK_LOAN_TYPES;
}

export async function getLoanPlans(): Promise<LoanPlan[]> {
    return MOCK_LOAN_PLANS;
}


// --- Payment Functions (Mocked) ---

export async function getPayments(): Promise<Payment[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [...MOCK_PAYMENTS];
}

export async function createPayment(data: Partial<Payment>): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return {
        ...data,
        payment_id: `p${Date.now()}`,
        created_at: new Date().toISOString(),
    } as Payment;
}


// --- User & Profile Functions (Mocked) ---

export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_USERS];
}

export async function createUser(data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
        ...data,
        id: Date.now(),
    } as User;
}

export async function updateUser(id: number | string, data: Partial<User>): Promise<{message: string, user: User}> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = MOCK_USERS.find(u => String(u.id) === String(id)) || MOCK_USERS[0];
    return {
        message: 'User updated successfully',
        user: { ...user, ...data }
    };
}

export async function deleteUser(id: number | string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
}
