
import { Borrower, Loan, Payment } from './types';

export const MOCK_BORROWERS: Borrower[] = [
  {
    id: 'b1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 712 345 678',
    idNumber: '12345678',
    address: '123 Nairobi St, Nairobi',
    createdAt: new Date('2023-10-01').toISOString(),
  },
  {
    id: 'b2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+254 722 987 654',
    idNumber: '87654321',
    address: '456 Mombasa Rd, Mombasa',
    createdAt: new Date('2023-11-15').toISOString(),
  },
  {
    id: 'b3',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '+254 733 111 222',
    idNumber: '55667788',
    address: '789 Kisumu Dr, Kisumu',
    createdAt: new Date('2024-01-10').toISOString(),
  },
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'L-1001',
    borrowerId: 'b1',
    borrowerName: 'John Doe',
    principalAmount: 50000,
    interestRate: 15,
    termMonths: 12,
    totalRepayable: 57500,
    remainingBalance: 32000,
    status: 'active',
    startDate: '2023-11-01',
    disbursementDate: '2023-11-01',
    createdAt: '2023-10-25',
  },
  {
    id: 'L-1002',
    borrowerId: 'b2',
    borrowerName: 'Jane Smith',
    principalAmount: 120000,
    interestRate: 12,
    termMonths: 24,
    totalRepayable: 134400,
    remainingBalance: 134400,
    status: 'disbursed',
    startDate: '2024-02-01',
    disbursementDate: '2024-02-01',
    createdAt: '2024-01-20',
  },
  {
    id: 'L-1003',
    borrowerId: 'b3',
    borrowerName: 'Robert Wilson',
    principalAmount: 30000,
    interestRate: 20,
    termMonths: 6,
    totalRepayable: 36000,
    remainingBalance: 12000,
    status: 'overdue',
    startDate: '2023-09-01',
    disbursementDate: '2023-09-01',
    createdAt: '2023-08-20',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    loanId: 'L-1001',
    borrowerId: 'b1',
    amount: 5000,
    paymentDate: '2024-01-15',
    method: 'mobile_money',
    reference: 'MPESA-ABC123XYZ',
  },
  {
    id: 'p2',
    loanId: 'L-1003',
    borrowerId: 'b3',
    amount: 6000,
    paymentDate: '2023-12-10',
    method: 'bank_transfer',
    reference: 'BANK-TRF-9988',
  },
];
