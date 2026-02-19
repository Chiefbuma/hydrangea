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
    return fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    }).then(handleResponse<User>);
}

export function forgotPassword(data: {email: string}): Promise<{message: string}> {
    return fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}


// --- GET Functions ---

export function getTransactions(): Promise<Transaction[]> {
  return fetch(`${API_URL}/api/transactions`, { cache: 'no-store' }).then(handleResponse);
}

export function getAmbulances(): Promise<Ambulance[]> {
  return fetch(`${API_URL}/api/ambulances`, { cache: 'no-store' }).then(handleResponse);
}

export function getAmbulanceById(id: number): Promise<Ambulance> {
  return fetch(`${API_URL}/api/ambulances/${id}`, { cache: 'no-store' }).then(handleResponse);
}

export function getTransactionsByAmbulanceId(ambulanceId: number): Promise<Transaction[]> {
  return fetch(`${API_URL}/api/transactions?ambulanceId=${ambulanceId}`, { cache: 'no-store' }).then(handleResponse);
}

export function getDrivers(): Promise<Driver[]> {
  return fetch(`${API_URL}/api/drivers`, { cache: 'no-store' }).then(handleResponse);
}

export function getEmergencyTechnicians(): Promise<EmergencyTechnician[]> {
  return fetch(`${API_URL}/api/emergency-technicians`, { cache: 'no-store' }).then(handleResponse);
}

export function getUsers(): Promise<User[]> {
  return fetch(`${API_URL}/api/users`, { cache: 'no-store' }).then(handleResponse);
}


// --- Ambulance Mutations ---

export function createAmbulance(data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    return fetch(`${API_URL}/api/ambulances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function updateAmbulance(id: number, data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    return fetch(`${API_URL}/api/ambulances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function deleteAmbulance(id: number): Promise<null> {
    return fetch(`${API_URL}/api/ambulances/${id}`, { method: 'DELETE' }).then(handleResponse);
}


// --- Transaction Mutations ---

export function createTransaction(data: any): Promise<{message: string, transaction: Transaction}> {
    return fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function updateTransaction(id: number, data: any): Promise<{message: string, transaction: Transaction}> {
    return fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function deleteTransaction(id: number): Promise<null> {
    return fetch(`${API_URL}/api/transactions/${id}`, { method: 'DELETE' }).then(handleResponse);
}


// --- Driver Mutations ---

export function createDriver(data: {name: string}): Promise<{message: string, driver: Driver}> {
    return fetch(`${API_URL}/api/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function updateDriver(id: number, data: {name: string}): Promise<{message: string, driver: Driver}> {
    return fetch(`${API_URL}/api/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function deleteDriver(id: number): Promise<null> {
    return fetch(`${API_URL}/api/drivers/${id}`, { method: 'DELETE' }).then(handleResponse);
}


// --- Technician Mutations ---

export function createTechnician(data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    return fetch(`${API_URL}/api/emergency-technicians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function updateTechnician(id: number, data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    return fetch(`${API_URL}/api/emergency-technicians/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function deleteTechnician(id: number): Promise<null> {
    return fetch(`${API_URL}/api/emergency-technicians/${id}`, { method: 'DELETE' }).then(handleResponse);
}


// --- User & Profile Mutations ---

export function createUser(data: Partial<User>): Promise<{message: string, user: User}> {
    return fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function updateUser(id: number, data: Partial<User>): Promise<{message: string, user: User}> {
    return fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse);
}

export function deleteUser(id: number): Promise<null> {
    return fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' }).then(handleResponse);
}
