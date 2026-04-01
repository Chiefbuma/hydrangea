import type { Transaction, Ambulance, Driver, EmergencyTechnician, User } from '@/lib/types';

// Generic function to handle API responses and extract error messages
async function getErrorFromResponse(response: Response): Promise<Error> {
    try {
        const errorData = await response.json();
        return new Error(errorData.message || 'An unknown error occurred.');
    } catch {
        return new Error(`Request failed with status ${response.status} and the response was not valid JSON.`);
    }
}


// --- Auth Functions ---

export async function login(credentials: {email: string, password: string}): Promise<User> {
    try {
        const res = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[LOGIN_ERROR]', error);
        throw error;
    }
}

export async function getCurrentUser(): Promise<User> {
    try {
        const res = await fetch(`/api/auth/me`, { cache: 'no-store' });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[GET_CURRENT_USER_ERROR]', error);
        throw error;
    }
}

export async function logout(): Promise<void> {
    try {
        const res = await fetch(`/api/auth/logout`, { method: 'POST' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error('[LOGOUT_ERROR]', error);
        throw error;
    }
}

export async function forgotPassword(data: {email: string}): Promise<{message: string}> {
    try {
        const res = await fetch(`/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[FORGOT_PASSWORD_ERROR]', error);
        throw error;
    }
}


// --- GET Functions ---

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`/api/transactions`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_TRANSACTIONS_ERROR]', error);
    throw error;
  }
}

export async function getAmbulances(): Promise<Ambulance[]> {
  try {
    const res = await fetch(`/api/ambulances`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_AMBULANCES_ERROR]', error);
    throw error;
  }
}

export async function getAmbulanceById(id: number): Promise<Ambulance> {
  try {
    const res = await fetch(`/api/ambulances/${id}`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error(`[GET_AMBULANCE_BY_ID_ERROR] ID: ${id}`, error);
    throw error;
  }
}

export async function getTransactionsByAmbulanceId(ambulanceId: number): Promise<Transaction[]> {
  try {
    const res = await fetch(`/api/transactions?ambulanceId=${ambulanceId}`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error(`[GET_TRANSACTIONS_BY_AMBULANCE_ID_ERROR] ID: ${ambulanceId}`, error);
    throw error;
  }
}

export async function getDrivers(): Promise<Driver[]> {
  try {
    const res = await fetch(`/api/drivers`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_DRIVERS_ERROR]', error);
    throw error;
  }
}

export async function getEmergencyTechnicians(): Promise<EmergencyTechnician[]> {
  try {
    const res = await fetch(`/api/emergency-technicians`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_EMERGENCY_TECHNICIANS_ERROR]', error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`/api/users`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
  } catch (error) {
    console.error('[GET_USERS_ERROR]', error);
    throw error;
  }
}


// --- Ambulance Mutations ---

export async function createAmbulance(data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    try {
        const res = await fetch(`/api/ambulances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[CREATE_AMBULANCE_ERROR]', error);
        throw error;
    }
}

export async function updateAmbulance(id: number, data: Partial<Ambulance>): Promise<{message: string, ambulance: Ambulance}> {
    try {
        const res = await fetch(`/api/ambulances/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error(`[UPDATE_AMBULANCE_ERROR] ID: ${id}`, error);
        throw error;
    }
}

export async function deleteAmbulance(id: number): Promise<void> {
    try {
        const res = await fetch(`/api/ambulances/${id}`, { method: 'DELETE' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error(`[DELETE_AMBULANCE_ERROR] ID: ${id}`, error);
        throw error;
    }
}


// --- Transaction Mutations ---

export async function createTransaction(data: any): Promise<{message: string, transaction: Transaction}> {
    try {
        const res = await fetch(`/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[CREATE_TRANSACTION_ERROR]', error);
        throw error;
    }
}

export async function updateTransaction(id: number, data: any): Promise<{message: string, transaction: Transaction}> {
    try {
        const res = await fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error(`[UPDATE_TRANSACTION_ERROR] ID: ${id}`, error);
        throw error;
    }
}

export async function deleteTransaction(id: number): Promise<void> {
    try {
        const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error(`[DELETE_TRANSACTION_ERROR] ID: ${id}`, error);
        throw error;
    }
}


// --- Driver Mutations ---

export async function createDriver(data: {name: string}): Promise<{message: string, driver: Driver}> {
    try {
        const res = await fetch(`/api/drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[CREATE_DRIVER_ERROR]', error);
        throw error;
    }
}

export async function updateDriver(id: number, data: {name: string}): Promise<{message: string, driver: Driver}> {
    try {
        const res = await fetch(`/api/drivers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error(`[UPDATE_DRIVER_ERROR] ID: ${id}`, error);
        throw error;
    }
}

export async function deleteDriver(id: number): Promise<void> {
    try {
        const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error(`[DELETE_DRIVER_ERROR] ID: ${id}`, error);
        throw error;
    }
}


// --- Technician Mutations ---

export async function createTechnician(data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    try {
        const res = await fetch(`/api/emergency-technicians`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[CREATE_TECHNICIAN_ERROR]', error);
        throw error;
    }
}

export async function updateTechnician(id: number, data: {name: string}): Promise<{message: string, technician: EmergencyTechnician}> {
    try {
        const res = await fetch(`/api/emergency-technicians/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error(`[UPDATE_TECHNICIAN_ERROR] ID: ${id}`, error);
        throw error;
    }
}

export async function deleteTechnician(id: number): Promise<void> {
    try {
        const res = await fetch(`/api/emergency-technicians/${id}`, { method: 'DELETE' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error(`[DELETE_TECHNICIAN_ERROR] ID: ${id}`, error);
        throw error;
    }
}


// --- User & Profile Mutations ---

export async function createUser(data: Partial<User>): Promise<{message: string, user: User}> {
    try {
        const res = await fetch(`/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error('[CREATE_USER_ERROR]', error);
        throw error;
    }
}

export async function updateUser(id: number, data: Partial<User>): Promise<{message: string, user: User}> {
    try {
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw await getErrorFromResponse(res);
        return res.json();
    } catch (error) {
        console.error(`[UPDATE_USER_ERROR] ID: ${id}`, error);
        throw error;
    }
}

export async function deleteUser(id: number): Promise<void> {
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw await getErrorFromResponse(res);
    } catch (error) {
        console.error(`[DELETE_USER_ERROR] ID: ${id}`, error);
        throw error;
    }
}
