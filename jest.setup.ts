import '@testing-library/jest-dom';
import React from 'react';

// グローバルなモックの設定
// Next.js Image コンポーネントのモック
jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
        return React.createElement('img', { ...props, alt: props.alt || '' });
    },
}));

// Next.js Router のモック
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            prefetch: jest.fn(),
            refresh: jest.fn(),
        };
    },
    usePathname() {
        return '/';
    },
    useSearchParams() {
        return new URLSearchParams();
    },
}));

// window.matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
