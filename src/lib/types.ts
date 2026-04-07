
export type LoanStatus = 0 | 1 | 2 | 3 | 4; // 0=Request, 1=Confirmed, 2=Released, 3=Completed, 4=Denied

export type PaymentFrequency = 'daily' | 'weekly' | 'monthly';

export type User = {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatarUrl?: string;
};

export type Borrower = {
  borrower_id: number | string;
  name: string;
  contact_no: string;
  national_id: string;
  email?: string;
  address?: string;
  created_at: string;
};

export type LoanType = {
  ltype_id: number | string;
  ltype_name: string;
  ltype_desc?: string;
};

export type LoanPlan = {
  lplan_id: number | string;
  lplan_interest: number;
  lplan_penalty: number;
};

export type Loan = {
  loan_id: number | string;
  borrower_id: number | string;
  borrower_name?: string;
  ltype_id: number | string;
  lplan_id: number | string;
  amount: number;
  total_loan: number;
  daily_amount: number;
  duration: number;
  payment_frequency: PaymentFrequency;
  status: LoanStatus;
  date_released: string;
  due_date: string;
  remaining_balance: number;
  created_at: string;
};

export type Payment = {
  payment_id: number | string;
  loan_id: number | string;
  borrower_id: number | string;
  payment_amount: number;
  payment_date: string;
  created_at: string;
};
