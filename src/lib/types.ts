
export type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'active' | 'overdue' | 'completed' | 'rejected';

export type User = {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatarUrl?: string;
};

export type Borrower = {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  createdAt: string;
};

export type Loan = {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  totalRepayable: number;
  remainingBalance: number;
  status: LoanStatus;
  startDate?: string;
  disbursementDate?: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference?: string;
};

export type DashboardStats = {
  totalDisbursed: number;
  activePortfolio: number;
  totalRepaid: number;
  overdueCount: number;
  overdueAmount: number;
};
