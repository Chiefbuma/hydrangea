
import { Borrower, Loan, Payment, LoanType, LoanPlan } from './types';

export const MOCK_BORROWERS: Borrower[] = [
  {
    borrower_id: 'b1',
    name: 'John Doe',
    contact_no: '0712345678',
    national_id: '12345678',
    email: 'john.doe@example.com',
    address: '123 Nairobi St, Nairobi',
    created_at: new Date('2023-10-01').toISOString(),
  },
  {
    borrower_id: 'b2',
    name: 'Jane Smith',
    contact_no: '0722987654',
    national_id: '87654321',
    email: 'jane.smith@example.com',
    address: '456 Mombasa Rd, Mombasa',
    created_at: new Date('2023-11-15').toISOString(),
  },
];

export const MOCK_LOAN_TYPES: LoanType[] = [
  { ltype_id: 'lt1', ltype_name: 'Personal Loan', ltype_desc: 'For individual needs' },
  { ltype_id: 'lt2', ltype_name: 'Business Loan', ltype_desc: 'For enterprise growth' },
];

export const MOCK_LOAN_PLANS: LoanPlan[] = [
  { lplan_id: 'lp1', lplan_interest: 12, lplan_penalty: 5 },
  { lplan_id: 'lp2', lplan_interest: 15, lplan_penalty: 7 },
];

export const MOCK_LOANS: Loan[] = [
  {
    loan_id: 'L-1001',
    borrower_id: 'b1',
    borrower_name: 'John Doe',
    ltype_id: 'lt1',
    lplan_id: 'lp1',
    amount: 50000,
    total_loan: 56000, // 50000 + (12% of 50000)
    daily_amount: 500,
    duration: 112, // 56000 / 500
    payment_frequency: 'daily',
    status: 2, // Released
    date_released: '2023-11-01',
    due_date: '2024-02-21',
    remaining_balance: 32000,
    created_at: '2023-10-25',
  },
  {
    loan_id: 'L-1002',
    borrower_id: 'b2',
    borrower_name: 'Jane Smith',
    ltype_id: 'lt2',
    lplan_id: 'lp2',
    amount: 100000,
    total_loan: 115000,
    daily_amount: 2000,
    duration: 58,
    payment_frequency: 'weekly',
    status: 0, // Request
    date_released: '2024-03-01',
    due_date: '2024-06-01',
    remaining_balance: 115000,
    created_at: '2024-02-20',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    payment_id: 'p1',
    loan_id: 'L-1001',
    borrower_id: 'b1',
    payment_amount: 5000,
    payment_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
  },
];
