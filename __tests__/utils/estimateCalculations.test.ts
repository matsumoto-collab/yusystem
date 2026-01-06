import { EstimateItem } from '@/types/estimate';

// 見積書計算ユーティリティ関数（テスト用に定義）
function calculateItemAmount(item: Omit<EstimateItem, 'id' | 'amount'>): number {
    return item.quantity * item.unitPrice;
}

function calculateSubtotal(items: EstimateItem[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

function calculateTax(items: EstimateItem[], taxRate: number = 0.1): number {
    const taxableAmount = items
        .filter(item => item.taxType === 'standard')
        .reduce((sum, item) => sum + item.amount, 0);
    return Math.floor(taxableAmount * taxRate);
}

function calculateTotal(subtotal: number, tax: number): number {
    return subtotal + tax;
}

describe('Estimate Calculations', () => {
    const createItem = (
        id: string,
        quantity: number,
        unitPrice: number,
        taxType: 'none' | 'standard' = 'standard'
    ): EstimateItem => ({
        id,
        description: `Item ${id}`,
        quantity,
        unitPrice,
        amount: quantity * unitPrice,
        taxType,
    });

    describe('calculateItemAmount', () => {
        it('should calculate amount correctly', () => {
            const item = {
                description: 'Test Item',
                quantity: 10,
                unitPrice: 1000,
                taxType: 'standard' as const,
            };
            expect(calculateItemAmount(item)).toBe(10000);
        });

        it('should handle zero quantity', () => {
            const item = {
                description: 'Test Item',
                quantity: 0,
                unitPrice: 1000,
                taxType: 'standard' as const,
            };
            expect(calculateItemAmount(item)).toBe(0);
        });

        it('should handle decimal quantities', () => {
            const item = {
                description: 'Test Item',
                quantity: 2.5,
                unitPrice: 1000,
                taxType: 'standard' as const,
            };
            expect(calculateItemAmount(item)).toBe(2500);
        });
    });

    describe('calculateSubtotal', () => {
        it('should sum all item amounts', () => {
            const items = [
                createItem('1', 10, 1000), // 10,000
                createItem('2', 5, 2000),  // 10,000
                createItem('3', 3, 5000),  // 15,000
            ];
            expect(calculateSubtotal(items)).toBe(35000);
        });

        it('should return 0 for empty items', () => {
            expect(calculateSubtotal([])).toBe(0);
        });

        it('should handle single item', () => {
            const items = [createItem('1', 5, 1000)]; // 5,000
            expect(calculateSubtotal(items)).toBe(5000);
        });
    });

    describe('calculateTax', () => {
        it('should calculate 10% tax on taxable items', () => {
            const items = [
                createItem('1', 10, 1000, 'standard'), // 10,000 (taxable)
            ];
            expect(calculateTax(items)).toBe(1000);
        });

        it('should not include non-taxable items', () => {
            const items = [
                createItem('1', 10, 1000, 'standard'), // 10,000 (taxable)
                createItem('2', 10, 1000, 'none'),     // 10,000 (not taxable)
            ];
            expect(calculateTax(items)).toBe(1000); // Only tax on 10,000
        });

        it('should floor the tax amount', () => {
            const items = [createItem('1', 1, 111, 'standard')]; // 111
            expect(calculateTax(items)).toBe(11); // 111 * 0.1 = 11.1 -> 11
        });

        it('should handle custom tax rate', () => {
            const items = [createItem('1', 10, 1000, 'standard')]; // 10,000
            expect(calculateTax(items, 0.08)).toBe(800); // 8%
        });

        it('should return 0 for no taxable items', () => {
            const items = [
                createItem('1', 10, 1000, 'none'),
                createItem('2', 5, 2000, 'none'),
            ];
            expect(calculateTax(items)).toBe(0);
        });
    });

    describe('calculateTotal', () => {
        it('should add subtotal and tax', () => {
            expect(calculateTotal(10000, 1000)).toBe(11000);
        });

        it('should handle zero tax', () => {
            expect(calculateTotal(10000, 0)).toBe(10000);
        });

        it('should handle zero subtotal', () => {
            expect(calculateTotal(0, 0)).toBe(0);
        });
    });

    describe('complete estimate calculation', () => {
        it('should calculate a complete estimate correctly', () => {
            const items = [
                createItem('1', 10, 10000, 'standard'), // 100,000
                createItem('2', 5, 20000, 'standard'),  // 100,000
                createItem('3', 1, 50000, 'none'),      // 50,000 (non-taxable)
            ];

            const subtotal = calculateSubtotal(items);
            const tax = calculateTax(items);
            const total = calculateTotal(subtotal, tax);

            expect(subtotal).toBe(250000);
            expect(tax).toBe(20000); // 10% of 200,000 (taxable amount)
            expect(total).toBe(270000);
        });
    });
});
