
import type { Loan, Borrower, Payment, LoanType, LoanPlan, User } from '@/lib/types';

const API_BASE = '/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// --- Auth Functions ---
export async function getCurrentUser(): Promise<User> {
  return handleResponse(await fetch(`${API_BASE}/auth/me`));
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
}

export async function forgotPassword(data: { email: string }): Promise<{ message: string }> {
  return handleResponse(await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));
}

// --- Borrower Functions ---
export async function getBorrowers(): Promise<Borrower[]> {
  return handleResponse(await fetch(`${API_BASE}/borrowers`));
}

export async function createBorrower(data: Partial<Borrower>): Promise<Borrower> {
  return handleResponse(await fetch(`${API_BASE}/borrowers`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));
}

// --- Loan Functions ---
export async function getLoans(): Promise<Loan[]> {
  return handleResponse(await fetch(`${API_BASE}/loans`));
}

export async function createLoan(data: Partial<Loan>): Promise<Loan> {
  return handleResponse(await fetch(`${API_BASE}/loans`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));
}

export async function getLoanTypes(): Promise<LoanType[]> {
  return handleResponse(await fetch(`${API_BASE}/loan-types`));
}

export async function getLoanPlans(): Promise<LoanPlan[]> {
  return handleResponse(await fetch(`${API_BASE}/loan-plans`));
}

// --- Payment Functions ---
export async function getPayments(): Promise<Payment[]> {
  return handleResponse(await fetch(`${API_BASE}/payments`));
}

export async function createPayment(data: Partial<Payment>): Promise<any> {
  return handleResponse(await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));
}

// --- User Management ---
export async function getUsers(): Promise<User[]> {
  return handleResponse(await fetch(`${API_BASE}/users`));
}

export async function createUser(data: Partial<User>): Promise<User> {
  return handleResponse(await fetch(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  }));
}

export async function updateUser(id: number | string, data: Partial<User>): Promise<any> {
  return handleResponse(await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }));
}

export async function deleteUser(id: number | string): Promise<void> {
  await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
}
