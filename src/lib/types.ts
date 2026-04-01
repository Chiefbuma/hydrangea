export type VehicleType = 'bus' | 'ambulance';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatarUrl?: string;
  password?: string;
};

export type Ambulance = {
  id: number;
  vehicle_type: VehicleType;
  reg_no: string;
  fuel_cost: number;
  operation_cost: number;
  target: number;
  status: "active" | "inactive";
  last_driven_by?: string;
  last_driven_on?: string;
};

export type Driver = {
  id: number;
  name: string;
  avatarUrl?: string;
}

export type Assistant = {
  id: number;
  name: string;
  avatarUrl?: string;
}

export type Transaction = {
    id: number;
    date: string;
    ambulance: Ambulance;
    driver: Driver;
    assistants: Assistant[];
    total_till: number;
    target: number;
    fuel: number;
    operation: number;
    cash_deposited_by_staff: number;
    // Calculated fields
    amount_paid_to_the_till: number;
    offload: number;
    salary: number;
    operations_cost: number;
    net_banked: number;
    deficit: number;
    fuel_revenue_ratio: number;
    performance: number;
}

export type AmbulancePerformanceData = {
    ambulanceId: number;
    vehicle_type: VehicleType;
    reg_no: string;
    total_target: number;
    total_net_banked: number;
    total_till: number;
    total_cash_deposited: number;
    total_deficit: number;
    performance: number;
}

export type PeriodComparisonData = {
    net_banked: number;
    deficit: number;
}

export type AdminDashboardData = {
    total_target: number;
    total_net_banked: number;
    total_till: number;
    total_cash_deposited: number;
    total_deficit: number;
    overall_performance: number;
    ambulance_performance: AmbulancePerformanceData[];
};
