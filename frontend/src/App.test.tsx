import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";

/**
 * Since the full App component has heavy dependencies (sidebar, theme, routing),
 * we test individual pages/components rendered in isolation with the necessary providers.
 * This file serves as a smoke test to ensure basic rendering works.
 */

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={createTestQueryClient()}>
            {children}
        </QueryClientProvider>
    );
}

describe("Frontend Smoke Tests", () => {
    it("should render a simple React element", () => {
        const { container } = render(<div data-testid="smoke">Hello</div>);
        expect(container).toBeTruthy();
        expect(screen.getByTestId("smoke")).toBeInTheDocument();
        expect(screen.getByTestId("smoke").textContent).toBe("Hello");
    });

    it("should render within QueryClientProvider", () => {
        const { container } = render(
            <TestWrapper>
                <div data-testid="wrapped">Wrapped Content</div>
            </TestWrapper>,
        );
        expect(container).toBeTruthy();
        expect(screen.getByTestId("wrapped")).toBeInTheDocument();
    });

    it("should have the testing-library matchers available", () => {
        render(<button disabled>Click me</button>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent("Click me");
    });
});
