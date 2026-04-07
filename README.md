Loan Management Application - Business Logic Summary Document
1. LOAN CREATION & CALCULATION LOGIC
1.1 Pre-Calculation Requirements
•	User must select: Borrower, Loan Type, Loan Plan, Amount, Payment Amount, Release Date
•	Payment Amount cannot exceed Loan Amount
•	Calculation must be performed before saving
1.2 Interest Calculation
•	Interest Amount = Loan Amount × (Interest Rate / 100)
•	Total Loan Amount = Loan Amount + Interest Amount
1.3 Duration & Due Date Calculation
Frequency	Duration Formula	Due Date Calculation
Daily	Total Loan / Daily Amount	Release Date + Duration (days)
Weekly	Total Loan / Weekly Amount	Release Date + Duration (weeks)
Monthly	Total Loan / Monthly Amount	Release Date + Duration (months)
1.4 Daily Payment Derivation
•	Daily Frequency → Daily Amount = Payment Amount
•	Weekly Frequency → Daily Amount = Weekly Amount / 7
•	Monthly Frequency → Daily Amount = Monthly Amount / 30
1.5 Validation Rules
•	Duration must be greater than 0
•	All calculation fields must be present
•	Loan Plan must exist in database
________________________________________
2. LOAN STATUS MANAGEMENT
2.1 Status Values
Code	Status	Description
0	Request	Initial application
1	Confirmed	Approved but not released
2	Released	Disbursed to borrower
3	Completed	Fully paid
4	Denied	Rejected
2.2 Automatic Status Updates
Completed Status Trigger:
•	When Remaining Balance = 0
•	Status changes to Completed automatically
Overdue Status Trigger:
•	When Remaining Balance > 0 AND Current Date > Due Date
•	Status changes to Overdue automatically
Pending Status:
•	When Remaining Balance > 0 AND Due Date not passed
2.3 Status Display Logic (Table View)
•	Completed → Green badge
•	Overdue → Red badge
•	Pending → Yellow badge
________________________________________
3. PAYMENT LOGIC
3.1 Payment Recording Rules
•	Payment Amount cannot exceed Remaining Balance
•	Payment Date cannot be in the future (max = today)
•	Payment automatically linked to loan and borrower
3.2 Payment Calculations
•	Total Paid = SUM of all payment_amount for the loan
•	Remaining Balance = MAX(0, Total Loan - Total Paid)
3.3 Post-Payment Actions
•	Loan status is re-evaluated after each payment
•	If Remaining Balance = 0 → Status becomes Completed
________________________________________
4. BORROWER VALIDATION RULES
4.1 Unique Constraints
•	Contact Number must be unique across all borrowers
•	National ID must be unique across all borrowers
4.2 Duplicate Checking Logic
•	When creating new borrower: Check entire table
•	When editing existing: Exclude current record from check
•	If duplicate detected: Show error notification and clear field
4.3 Borrower Display Format
•	Format: "Name - Contact Number"
•	Used in dropdown selections
________________________________________
5. LOAN PLAN LOGIC
5.1 Plan Components
•	Interest Rate (%)
•	Penalty Rate (%)
5.2 Penalty Calculation
•	Penalty Amount = Loan Amount × (Penalty Rate / 100)
•	Penalty stored but not automatically applied (manual handling)
5.3 Plan Display Format
•	Format: "{Interest Rate}% interest rate, {Penalty Rate}% penalty"
________________________________________
6. DELETE PROTECTION LOGIC
6.1 Single Loan Deletion
•	Check if loan has any associated payments
•	If payments exist → Prevent deletion with error message
•	If no payments → Allow deletion
6.2 Bulk Deletion
•	Check all selected loans for payments
•	If ANY selected loan has payments → Block entire bulk delete
•	Show error: "Some selected loans have payments associated"
________________________________________
7. EXPORT LOGIC
7.1 Excel Export
•	Export all disbursed loans
•	Include borrower relationship data
•	Filename: all-loans-export-YYYY-MM-DD.xlsx
7.2 PDF Export
•	Export by status filter (Pending, Completed, Overdue, or All)
•	A4 Landscape paper size
•	Filename: released-loans-export-YYYY-MM-DD.pdf
________________________________________
8. FILTERING LOGIC
8.1 Status Filter Logic
Filter	SQL Condition
Completed	Total Loan - SUM(Payments) = 0
Overdue	Balance > 0 AND (Release Date + Duration) < Today
Pending	Balance > 0 AND (Release Date + Duration) ≥ Today
8.2 Date Range Filter
•	Filter by date_released between from_date and until_date
•	Both dates optional (can filter by start only or end only)
________________________________________
9. CACHING LOGIC
9.1 Cached Values
•	Pending loans count
•	Completed loans count
•	Overdue loans count
•	Total loans count
9.2 Cache Duration
•	30 minutes expiration
9.3 Cache Invalidation Triggers
•	New loan created
•	Loan status updated
•	Loan deleted
________________________________________
10. LOAN CALCULATION FORMULA SUMMARY
text
Step 1: Calculate Interest
        Interest = Amount × (InterestRate / 100)

Step 2: Calculate Total Payable
        TotalPayable = Amount + Interest

Step 3: Calculate Duration
        Duration = TotalPayable / PaymentAmount

Step 4: Calculate Due Date
        If Daily:   DueDate = ReleaseDate + Duration days
        If Weekly:  DueDate = ReleaseDate + Duration weeks
        If Monthly: DueDate = ReleaseDate + Duration months

Step 5: Calculate Daily Equivalent
        If Weekly:  DailyAmount = PaymentAmount / 7
        If Monthly: DailyAmount = PaymentAmount / 30
        If Daily:   DailyAmount = PaymentAmount
________________________________________
11. SUMMARY TABLE: CORE BUSINESS RULES
#	Rule	Action
1	Cannot save loan without calculation	Block save, show error
2	Payment > Remaining Balance	Block payment
3	Balance = 0	Auto-status → Completed
4	Due Date passed with balance > 0	Auto-status → Overdue
5	Duplicate Contact/ID	Block creation
6	Loan has payments	Block deletion
7	Payment Amount > Loan Amount	Block calculation
8	Duration = 0	Block calculation
________________________________________
12. DATA RELATIONSHIPS SUMMARY
text
Borrower (1) ──────< (Many) Loan
Loan Type (1) ─────< (Many) Loan
Loan Plan (1) ─────< (Many) Loan
Loan (1) ──────────< (Many) Payment
Borrower (1) ──────< (Many) Payment
Loan (1) ──────────< (Many) LoanPayment
Payment (1) ───────< (Many) LoanPayment
add all gables, relationships and requirments
Loan Management Application - Complete Database & Business Logic Document
________________________________________
PART 1: DATABASE TABLES
TABLE 1: borrower
Purpose: Stores all borrower/client information
Column	Data Type	Constraints	Description
borrower_id	INT	PRIMARY KEY, AUTO_INCREMENT	Unique borrower identifier
name	VARCHAR(255)	NOT NULL	Borrower's full name
contact_no	VARCHAR(15)	NOT NULL, UNIQUE	Phone number (unique constraint)
national_id	VARCHAR(20)	NOT NULL, UNIQUE	National ID number (unique constraint)
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Record creation date
updated_at	TIMESTAMP	ON UPDATE CURRENT_TIMESTAMP	Last update date
Indexes:
•	PRIMARY KEY: borrower_id
•	UNIQUE KEY: contact_no
•	UNIQUE KEY: national_id
________________________________________
TABLE 2: loan_type
Purpose: Defines different categories of loans
Column	Data Type	Constraints	Description
ltype_id	INT	PRIMARY KEY, AUTO_INCREMENT	Loan type identifier
ltype_name	VARCHAR(255)	NOT NULL	Name of loan type (e.g., "Personal", "Business")
ltype_desc	VARCHAR(255)	NULLABLE	Optional description
Indexes:
•	PRIMARY KEY: ltype_id
________________________________________
TABLE 3: loan_plan
Purpose: Defines interest and penalty rates for loans
Column	Data Type	Constraints	Description
lplan_id	INT	PRIMARY KEY, AUTO_INCREMENT	Loan plan identifier
lplan_interest	DECIMAL(5,2)	NOT NULL, DEFAULT 0	Interest rate percentage
lplan_penalty	DECIMAL(5,2)	NOT NULL, DEFAULT 0	Penalty rate percentage
Validation Rules:
•	lplan_interest ≥ 0
•	lplan_penalty ≥ 0
Indexes:
•	PRIMARY KEY: lplan_id
________________________________________
TABLE 4: loan (Main Table)
Purpose: Core table storing all loan applications and their details
Column	Data Type	Constraints	Description
loan_id	INT	PRIMARY KEY, AUTO_INCREMENT	Unique loan identifier
borrower_id	INT	FOREIGN KEY, NOT NULL	References borrower table
ltype_id	INT	FOREIGN KEY, NOT NULL	References loan_type table
lplan_id	INT	FOREIGN KEY, NOT NULL	References loan_plan table
amount	DECIMAL(10,2)	NOT NULL, > 0	Original loan amount
total_loan	DECIMAL(10,2)	NOT NULL	Amount + interest (calculated)
daily_amount	DECIMAL(10,2)	NOT NULL, > 0	Payment amount per frequency
duration	INT	NULLABLE	Number of payment periods
payment_frequency	ENUM	NOT NULL, DEFAULT 'daily'	daily/weekly/monthly
status	INT	NOT NULL, DEFAULT 0	0=Request,1=Confirmed,2=Released,3=Completed,4=Denied
date_released	DATE	NOT NULL	Loan disbursement date
due_date	DATE	NULLABLE	Calculated final payment date
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Record creation date
updated_at	TIMESTAMP	ON UPDATE CURRENT_TIMESTAMP	Last update date
Status Values:
Value	Label	Description
0	Request	Initial application submitted
1	Confirmed	Approved by admin
2	Released	Money disbursed to borrower
3	Completed	Fully repaid
4	Denied	Application rejected
Validation Rules:
•	amount ≥ 1
•	daily_amount ≥ 1
•	payment_amount cannot exceed amount (pre-calculation)
•	total_loan must be calculated before save
Indexes:
•	PRIMARY KEY: loan_id
•	FOREIGN KEY: borrower_id → borrower(borrower_id)
•	FOREIGN KEY: ltype_id → loan_type(ltype_id)
•	FOREIGN KEY: lplan_id → loan_plan(lplan_id)
•	INDEX: status
•	INDEX: date_released
•	INDEX: due_date
________________________________________
TABLE 5: payment
Purpose: Records individual payments made by borrowers
Column	Data Type	Constraints	Description
payment_id	INT	PRIMARY KEY, AUTO_INCREMENT	Unique payment identifier
loan_id	INT	FOREIGN KEY, NOT NULL	References loan table
borrower_id	INT	FOREIGN KEY, NOT NULL	References borrower table
payment_amount	DECIMAL(10,2)	NOT NULL, > 0	Amount paid
payment_date	DATE	NOT NULL	Date of payment (cannot be future)
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Record creation date
updated_at	TIMESTAMP	ON UPDATE CURRENT_TIMESTAMP	Last update date
Validation Rules:
•	payment_amount ≤ remaining balance of loan
•	payment_date ≤ current date (cannot be future)
Indexes:
•	PRIMARY KEY: payment_id
•	FOREIGN KEY: loan_id → loan(loan_id)
•	FOREIGN KEY: borrower_id → borrower(borrower_id)
•	INDEX: payment_date
________________________________________
TABLE 6: loan_payments
Purpose: Junction table tracking payment history and running balance
Column	Data Type	Constraints	Description
id	INT	PRIMARY KEY, AUTO_INCREMENT	Unique record identifier
loan_id	INT	FOREIGN KEY, NOT NULL	References loan table
payment_id	INT	FOREIGN KEY, NOT NULL	References payment table
payment_amount	DECIMAL(10,2)	NOT NULL	Amount of this payment
date_paid	DATETIME	NOT NULL, DEFAULT CURRENT_TIMESTAMP	Exact timestamp of payment
balance	DECIMAL(10,2)	NOT NULL	Remaining balance after this payment
Indexes:
•	PRIMARY KEY: id
•	FOREIGN KEY: loan_id → loan(loan_id)
•	FOREIGN KEY: payment_id → payment(payment_id)
•	INDEX: date_paid
________________________________________
TABLE 7: users
Purpose: System user authentication and management
Column	Data Type	Constraints	Description
id	INT	PRIMARY KEY, AUTO_INCREMENT	User identifier
name	VARCHAR(255)	NOT NULL	User's full name
email	VARCHAR(255)	NOT NULL, UNIQUE	User email (login credential)
password	VARCHAR(255)	NOT NULL	Hashed password
remember_token	VARCHAR(100)	NULLABLE	Session remember token
email_verified_at	TIMESTAMP	NULLABLE	Email verification timestamp
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Account creation date
updated_at	TIMESTAMP	ON UPDATE CURRENT_TIMESTAMP	Last update date
Indexes:
•	PRIMARY KEY: id
•	UNIQUE KEY: email
________________________________________
PART 2: TABLE RELATIONSHIPS
Entity Relationship Diagram (ERD)
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RELATIONSHIP MAP                                │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    users     │
                                    │  (Admin/Staff)│
                                    └──────────────┘
                                           │
                                           │ (No direct FK)
                                           │
    ┌──────────────┐                      ▼
    │  loan_type   │              ┌──────────────┐
    │──────────────│              │   borrower   │
    │ ltype_id (PK)│◄────────────┐│──────────────│
    │ ltype_name   │             ││ borrower_id(PK)│
    │ ltype_desc   │             ││ name         │
    └──────────────┘             ││ contact_no   │
           │                     ││ national_id  │
           │                     │└──────────────┘
           │                     │        │
           │                     │        │ 1:M
           │                     │        │
           │                     │        ▼
    ┌──────────────┐             │  ┌──────────────┐
    │  loan_plan   │             │  │     loan     │
    │──────────────│             └─►│──────────────│
    │ lplan_id (PK)│◄────────────┐ ││ loan_id (PK) │
    │ lplan_interest│            │ ││ borrower_id(FK)│
    │ lplan_penalty│            │ ││ ltype_id (FK)│
    └──────────────┘            │ ││ lplan_id (FK)│
           │                    │ ││ amount       │
           │                    │ ││ total_loan   │
           │                    │ ││ daily_amount │
           │                    │ ││ duration     │
           │                    │ ││ payment_freq │
           │                    │ ││ status       │
           │                    │ ││ date_released│
           │                    │ ││ due_date     │
           │                    │ └──────────────┘
           │                    │        │
           │                    │        │ 1:M
           │                    │        │
           │                    │        ▼
           │                    │  ┌──────────────┐
           │                    │  │   payment    │
           │                    │  │──────────────│
           │                    └─►│ payment_id(PK)│
           │                       │ loan_id (FK) │
           │                       │ borrower_id(FK)│
           │                       │ payment_amount│
           │                       │ payment_date │
           │                       └──────────────┘
           │                              │
           │                              │ 1:1
           │                              │
           │                              ▼
           │                       ┌──────────────┐
           │                       │ loan_payments│
           │                       │──────────────│
           └──────────────────────►│ id (PK)      │
                                   │ loan_id (FK) │
                                   │ payment_id(FK)│
                                   │ payment_amount│
                                   │ date_paid    │
                                   │ balance      │
                                   └──────────────┘
Relationship Summary Table
#	Parent Table	Child Table	Relationship Type	Foreign Key
1	borrower	loan	One-to-Many	loan.borrower_id → borrower.borrower_id
2	loan_type	loan	One-to-Many	loan.ltype_id → loan_type.ltype_id
3	loan_plan	loan	One-to-Many	loan.lplan_id → loan_plan.lplan_id
4	loan	payment	One-to-Many	payment.loan_id → loan.loan_id
5	borrower	payment	One-to-Many	payment.borrower_id → borrower.borrower_id
6	loan	loan_payments	One-to-Many	loan_payments.loan_id → loan.loan_id
7	payment	loan_payments	One-to-One	loan_payments.payment_id → payment.payment_id
Detailed Relationship Descriptions
Relationship 1: Borrower → Loan (One-to-Many)
text
One Borrower can have MANY Loans
One Loan belongs to ONE Borrower
Business Rule: A borrower can take multiple loans over time, but each loan is associated with exactly one borrower.
Relationship 2: Loan Type → Loan (One-to-Many)
text
One Loan Type can have MANY Loans
One Loan belongs to ONE Loan Type
Business Rule: Loan types (e.g., Personal, Business, Emergency) can be used for multiple loans.
Relationship 3: Loan Plan → Loan (One-to-Many)
text
One Loan Plan can have MANY Loans
One Loan belongs to ONE Loan Plan
Business Rule: Interest rate plans can be applied to multiple loans.
Relationship 4: Loan → Payment (One-to-Many)
text
One Loan can have MANY Payments
One Payment belongs to ONE Loan
Business Rule: A loan can be repaid through multiple partial payments over time.
Relationship 5: Borrower → Payment (One-to-Many)
text
One Borrower can make MANY Payments
One Payment belongs to ONE Borrower
Business Rule: Tracks which borrower made each payment (redundant but useful for quick lookups).
Relationship 6: Loan → Loan Payments (One-to-Many)
text
One Loan can have MANY LoanPayment records
One LoanPayment belongs to ONE Loan
Business Rule: Maintains historical running balance after each payment.
Relationship 7: Payment → Loan Payments (One-to-One)
text
One Payment has exactly ONE LoanPayment record
One LoanPayment belongs to ONE Payment
Business Rule: Each payment creates one running balance record.
________________________________________
PART 3: DATABASE REQUIREMENTS SUMMARY
Required Constraints Summary
Constraint Type	Tables	Columns
PRIMARY KEY	All tables	id/xxx_id columns
FOREIGN KEY	loan, payment, loan_payments	borrower_id, ltype_id, lplan_id, loan_id
UNIQUE	borrower	contact_no, national_id
UNIQUE	users	email
NOT NULL	All tables	All critical business fields
CHECK	loan	amount ≥ 1, daily_amount ≥ 1
CHECK	loan_plan	lplan_interest ≥ 0, lplan_penalty ≥ 0
CHECK	payment	payment_amount > 0
DEFAULT	loan	status = 0, payment_frequency = 'daily'
Required Indexes Summary
Table	Indexed Columns	Purpose
loan	status	Filtering by status
loan	date_released	Date range filtering
loan	due_date	Overdue calculation
loan	borrower_id	Join performance
payment	loan_id	Join performance
payment	payment_date	Date-based queries
borrower	contact_no	Uniqueness/lookup
borrower	national_id	Uniqueness/lookup
Data Integrity Rules
Rule ID	Description	Enforcement Point
DI-01	Payment cannot exceed remaining balance	Application logic + trigger
DI-02	Loan must be calculated before saving	Application logic
DI-03	Cannot delete loan with payments	Application logic
DI-04	Contact number must be unique	Database UNIQUE constraint
DI-05	National ID must be unique	Database UNIQUE constraint
DI-06	Due date cannot be before release date	Application logic
DI-07	Payment date cannot be future date	Application logic
DI-08	Status must be valid (0-4)	Application logic + ENUM
________________________________________
PART 4: COMPLETE BUSINESS LOGIC (Point by Point)
A. LOAN CALCULATION LOGIC
#	Rule	Formula/Action
A1	Interest Calculation	Interest = Amount × (InterestRate / 100)
A2	Total Payable	TotalPayable = Amount + Interest
A3	Duration (Daily)	Duration = TotalPayable / DailyAmount
A4	Duration (Weekly)	Duration = TotalPayable / WeeklyAmount
A5	Duration (Monthly)	Duration = TotalPayable / MonthlyAmount
A6	Due Date (Daily)	DueDate = ReleaseDate + Duration (days)
A7	Due Date (Weekly)	DueDate = ReleaseDate + Duration (weeks)
A8	Due Date (Monthly)	DueDate = ReleaseDate + Duration (months)
A9	Daily Equivalent (Weekly)	DailyAmount = WeeklyAmount / 7
A10	Daily Equivalent (Monthly)	DailyAmount = MonthlyAmount / 30
B. VALIDATION RULES
#	Rule	Validation Check	Error Message
B1	Loan Calculation Required	is_calculated = true	"Please calculate before saving"
B2	Payment vs Loan Amount	payment_amount ≤ amount	"Payment cannot exceed loan amount"
B3	Payment vs Remaining Balance	payment_amount ≤ remaining_balance	"Amount exceeds remaining balance"
B4	Duration Positive	duration > 0	"Repayment period cannot be 0"
B5	Loan Plan Exists	loan_plan found	"Invalid loan plan selected"
B6	Unique Contact	contact_no not exists	"Contact number already exists"
B7	Unique National ID	national_id not exists	"National ID already exists"
B8	Future Payment Date	payment_date ≤ today	"Payment date cannot be in future"
C. STATUS MANAGEMENT RULES
#	Current Status	Condition	New Status
C1	Any	remaining_balance = 0	Completed (3)
C2	Any	balance > 0 AND due_date < today	Overdue (auto)
C3	Any	balance > 0 AND due_date ≥ today	Pending (0)
C4	Request (0)	Admin approval	Confirmed (1)
C5	Confirmed (1)	Money disbursed	Released (2)
C6	Any	Admin action	Denied (4)
D. PAYMENT RULES
#	Rule	Description
D1	Payment Recording	Each payment creates record in payment table
D2	Balance Tracking	Each payment creates record in loan_payments with running balance
D3	Status Update	After payment, loan status is re-evaluated
D4	Override Protection	Payment cannot be modified after recording
D5	Total Paid Calculation	SUM(payment_amount) for the loan
E. DELETE PROTECTION RULES
#	Scenario	Action
E1	Delete single loan with payments	BLOCK - Show error message
E2	Delete single loan without payments	ALLOW - Cascade safe
E3	Bulk delete - ANY loan has payments	BLOCK entire operation
E4	Bulk delete - ALL loans have no payments	ALLOW
F. EXPORT RULES
#	Export Type	Filter	Format	Orientation
F1	Excel Export	All disbursed loans	.xlsx	N/A
F2	PDF Export	By status (Pending/Completed/Overdue/All)	.pdf	Landscape (A4)
G. CACHING RULES
#	Cache Key	Value	Duration	Invalidation Triggers
G1	loans_count_pending	Count of status=0	30 min	Create, Update, Delete
G2	loans_count_completed	Count of status=3	30 min	Create, Update, Delete
G3	loans_count_overdue	Count of status=Overdue	30 min	Create, Update, Delete
G4	loans_count_total	Total loan count	30 min	Create, Update, Delete
H. FILTER RULES
#	Filter Type	Condition	SQL Logic
H1	Status: Completed	Balance = 0	total_loan - SUM(payments) = 0
H2	Status: Overdue	Balance > 0 AND past due	balance > 0 AND due_date < CURDATE()
H3	Status: Pending	Balance > 0 AND not due	balance > 0 AND due_date ≥ CURDATE()
H4	Date Range	date_released between	date_released BETWEEN from AND until
I. BORROWER DISPLAY RULES
#	Context	Format	Example
I1	Dropdown selection	"Name - Contact Number"	"John Doe - 0712345678"
I2	Table view	Name only	"John Doe"
I3	Detail view	All fields	Name, Contact, National ID
J. LOAN PLAN DISPLAY RULES
#	Context	Format	Example
J1	Dropdown selection	"{Interest}% interest, {Penalty}% penalty"	"12% interest, 5% penalty"
________________________________________
PART 5: QUICK REFERENCE - FORMULAS
Calculation Formula Set
text
// Input Variables
Amount = Loan amount requested
InterestRate = Selected loan plan interest rate (%)
PaymentAmount = Amount borrower pays per period
Frequency = daily | weekly | monthly
ReleaseDate = Date money is disbursed

// Calculations
Interest = Amount × (InterestRate ÷ 100)
TotalPayable = Amount + Interest

IF Frequency = 'daily':
    Duration = TotalPayable ÷ PaymentAmount
    DueDate = ReleaseDate + Duration days
    DailyAmount = PaymentAmount

ELSE IF Frequency = 'weekly':
    Duration = TotalPayable ÷ PaymentAmount
    DueDate = ReleaseDate + Duration weeks
    DailyAmount = PaymentAmount ÷ 7

ELSE IF Frequency = 'monthly':
    Duration = TotalPayable ÷ PaymentAmount
    DueDate = ReleaseDate + Duration months
    DailyAmount = PaymentAmount ÷ 30

// Post-Creation
TotalPaid = SUM(all payments for this loan)
RemainingBalance = TotalPayable - TotalPaid

IF RemainingBalance = 0:
    Status = "Completed"
ELSE IF CurrentDate > DueDate:
    Status = "Overdue"
ELSE:
    Status = "Pending"
________________________________________
PART 6: INDEX REQUIREMENTS SUMMARY
sql
-- Performance indexes for optimal query execution
CREATE INDEX idx_loan_borrower ON loan(borrower_id);
CREATE INDEX idx_loan_status ON loan(status);
CREATE INDEX idx_loan_dates ON loan(date_released, due_date);
CREATE INDEX idx_loan_ltype ON loan(ltype_id);
CREATE INDEX idx_loan_lplan ON loan(lplan_id);
CREATE INDEX idx_payment_loan ON payment(loan_id);
CREATE INDEX idx_payment_borrower ON payment(borrower_id);
CREATE INDEX idx_payment_date ON payment(payment_date);
CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_payment ON loan_payments(payment_id);

