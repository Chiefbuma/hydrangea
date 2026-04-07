
import { Borrower, Loan, Payment, LoanType, LoanPlan, User } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'System Admin', email: 'admin@blueoak.com', role: 'admin' },
  { id: 2, name: 'Sarah Staff', email: 'sarah@blueoak.com', role: 'staff' }
];

export const MOCK_BORROWERS: Borrower[] = [
  {
    borrower_id: 'b1',
    name: 'John Doe',
    contact_no: '0712345678',
    national_id: '12345678',
    email: 'john.doe@example.com',
    address: '123 Nairobi St, Westlands, Nairobi',
    created_at: '2023-10-01T00:00:00Z',
  },
  {
    borrower_id: 'b2',
    name: 'Jane Smith',
    contact_no: '0722987654',
    national_id: '87654321',
    email: 'jane.smith@example.com',
    address: '456 Mombasa Rd, Nyali, Mombasa',
    created_at: '2023-11-15T00:00:00Z',
  },
  {
    borrower_id: 'b3',
    name: 'Robert Wilson',
    contact_no: '0733445566',
    national_id: '11223344',
    email: 'robert.wilson@example.com',
    address: '789 Kisumu Rd, Milimani',
    created_at: '2024-01-01T00:00:00Z',
  }
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
    total_loan: 56000,
    daily_amount: 500,
    duration: 112,
    payment_frequency: 'daily',
    status: 2,
    date_released: '2023-11-01',
    due_date: '2024-02-21',
    remaining_balance: 32000,
    created_at: '2023-10-25T00:00:00Z',
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
    status: 0,
    date_released: '2024-03-01',
    due_date: '2024-06-01',
    remaining_balance: 115000,
    created_at: '2024-02-20T00:00:00Z',
  },
  {
    loan_id: 'L-0995',
    borrower_id: 'b1',
    borrower_name: 'John Doe',
    ltype_id: 'lt1',
    lplan_id: 'lp1',
    amount: 20000,
    total_loan: 22400,
    daily_amount: 400,
    duration: 56,
    payment_frequency: 'daily',
    status: 3,
    date_released: '2023-01-01',
    due_date: '2023-03-01',
    remaining_balance: 0,
    created_at: '2022-12-15T00:00:00Z',
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
  {
    payment_id: 'p2',
    loan_id: 'L-1001',
    borrower_id: 'b1',
    payment_amount: 10000,
    payment_date: '2024-02-01',
    created_at: '2024-02-01T14:30:00Z',
  },
  {
    payment_id: 'p3',
    loan_id: 'L-0995',
    borrower_id: 'b1',
    payment_amount: 22400,
    payment_date: '2023-02-25',
    created_at: '2023-02-25T11:00:00Z',
  },
];
