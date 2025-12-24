'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { Customer, CustomerInput } from '@/types/customer';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CustomerContextType {
    customers: Customer[];
    addCustomer: (customer: CustomerInput) => void;
    updateCustomer: (id: string, customer: Partial<CustomerInput>) => void;
    deleteCustomer: (id: string) => void;
    getCustomerById: (id: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customers, setCustomers] = useLocalStorage<Customer[]>('yusystem_customers', []);

    // 既存データとの互換性を確保（contactPersonsが存在しない場合は空配列で初期化）
    React.useEffect(() => {
        const needsUpdate = customers.some(c => !c.contactPersons);
        if (needsUpdate) {
            const updatedCustomers = customers.map(customer => ({
                ...customer,
                contactPersons: customer.contactPersons || [],
            }));
            setCustomers(updatedCustomers);
        }
    }, []);

    // 顧客を追加
    const addCustomer = useCallback((customerData: CustomerInput) => {
        const newCustomer: Customer = {
            id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...customerData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setCustomers(prev => [...prev, newCustomer]);
    }, [setCustomers]);

    // 顧客を更新
    const updateCustomer = useCallback((id: string, customerData: Partial<CustomerInput>) => {
        setCustomers(prev => prev.map(customer =>
            customer.id === id
                ? { ...customer, ...customerData, updatedAt: new Date() }
                : customer
        ));
    }, [setCustomers]);

    // 顧客を削除
    const deleteCustomer = useCallback((id: string) => {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
    }, [setCustomers]);

    // IDで顧客を取得
    const getCustomerById = useCallback((id: string) => {
        return customers.find(customer => customer.id === id);
    }, [customers]);

    return (
        <CustomerContext.Provider
            value={{
                customers,
                addCustomer,
                updateCustomer,
                deleteCustomer,
                getCustomerById,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomers() {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
}
