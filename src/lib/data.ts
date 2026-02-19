import type { Transaction, Ambulance, Driver, EmergencyTechnician, User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        console.error(`API Error: ${response.status}`, errorBody);
        throw new Error(errorBody.message || 'An API error occurred.');
    }
    if (response.status === 204) {
        return null as T;
    }
    return response.json() as Promise<T>;
}

// --- Auth Functions ---

export function login(credentials: {email: string, password: string}): Promise<User> {
    return fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    }).then(handleResponse<User>);
}

export function forgotPassword(data: {email: string}): Promise<{message: string}> {
    return fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string}>);
}


// --- GET Functions ---

export function getTransactions(): Promise<Transaction[]> {
  return fetch(`${API_URL}/transactions`, { cache: 'no-store' }).then(handleResponse<Transaction[]>);
}

export function getAmbulances(): Promise<Ambulance[]> {
  return fetch(`${API_URL}/ambulances`, { cache: 'no-store' }).then(handleResponse<Ambulance[]>);
}

export function getAmbulanceById(id: number): Promise<Ambulance> {
  return fetch(`${API_URL}/ambulances/${id}`, { cache: 'no-store' }).then(handleResponse<Ambulance>);
}

export function getTransactionsByAmbulanceId(ambulanceId: number): Promise<Transaction[]> {
  return fetch(`${API_URL}/transactions?ambulanceId=${ambulanceId}`, { cache: 'no-store' }).then(handleResponse<Transaction[]>);
}

export function getDrivers(): Promise<Driver[]> {
  return fetch(`${API_URL}/drivers`, { cache: 'no-store' }).then(handleResponse<Driver[]>);
}

export function getEmergencyTechnicians(): Promise<EmergencyTechnician[]> {
  return fetch(`${API_URL}/emergency-technicians`, { cache: 'no-store' }).then(handleResponse<EmergencyTechnician[]>);
}

export function getUsers(): Promise<User[]> {
  return fetch(`${API_URL}/users`, { cache: 'no-store' }).then(handleResponse<User[]>);
}


// --- Ambulance Mutations ---

export function createAmbulance(data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    return fetch(`${API_URL}/ambulances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, ambulance: Ambulance}>);
}

export function updateAmbulance(id: number, data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    return fetch(`${API_URL}/ambulances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, ambulance: Ambulance}>);
}

export function deleteAmbulance(id: number): Promise<null> {
    return fetch(`${API_URL}/ambulances/${id}`, { method: 'DELETE' }).then(handleResponse<null>);
}


// --- Transaction Mutations ---

export function createTransaction(data: any): Promise<{message: string, transaction: Transaction}> {
    return fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, transaction: Transaction}>);
}

export function updateTransaction(id: number, data: any): Promise<{message: string, transaction: Transaction}> {
    return fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, transaction: Transaction}>);
}

export function deleteTransaction(id: number): Promise<null> {
    return fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' }).then(handleResponse<null>);
}


// --- Driver Mutations ---

export function createDriver(data: {name: string}): Promise<{message: string, driver: Driver}> {
    return fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, driver: Driver}>);
}

export function updateDriver(id: number, data: {name: string}): Promise<{message: string, driver: Driver}> {
    return fetch(`${API_URL}/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, driver: Driver}>);
}

export function deleteDriver(id: number): Promise<null> {
    return fetch(`${API_URL}/drivers/${id}`, { method: 'DELETE' }).then(handleResponse<null>);
}


// --- Technician Mutations ---

export function createTechnician(data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    return fetch(`${API_URL}/emergency-technicians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, technician: EmergencyTechnician}>);
}

export function updateTechnician(id: number, data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    return fetch(`${API_URL}/emergency-technicians/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, technician: EmergencyTechnician}>);
}

export function deleteTechnician(id: number): Promise<null> {
    return fetch(`${API_URL}/emergency-technicians/${id}`, { method: 'DELETE' }).then(handleResponse<null>);
}


// --- User & Profile Mutations ---

export function createUser(data: Partial<User>): Promise<{message: string, user: User}> {
    return fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, user: User}>);
}

export function updateUser(id: number, data: Partial<User>): Promise<{message: string, user: User}> {
    return fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse<{message: string, user: User}>);
}

export function deleteUser(id: number): Promise<null> {
    return fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse<null>);
}
