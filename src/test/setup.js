import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/msw-handlers';
export const server = setupServer(...handlers);
if (typeof window !== 'undefined') {
    if (!window.matchMedia) {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => { },
                removeListener: () => { },
                addEventListener: () => { },
                removeEventListener: () => { },
                dispatchEvent: () => false,
            }),
        });
    }
    if (!window.localStorage) {
        const store = {};
        const mockStorage = {
            getItem: (key) => store[key] ?? null,
            setItem: (key, value) => {
                store[key] = String(value);
            },
            removeItem: (key) => {
                delete store[key];
            },
            clear: () => {
                for (const k of Object.keys(store)) {
                    delete store[k];
                }
            },
            key: (index) => Object.keys(store)[index] ?? null,
            get length() {
                return Object.keys(store).length;
            },
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            writable: true,
        });
    }
}
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
