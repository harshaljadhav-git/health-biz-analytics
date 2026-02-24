import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiRequest } from "./queryClient";

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
    mockFetch.mockReset();
});

describe("apiRequest", () => {
    it("should make a GET request with correct URL", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({}),
            text: async () => "",
        });

        await apiRequest("GET", "/api/patients");

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/patients",
            expect.objectContaining({
                method: "GET",
                credentials: "include",
            }),
        );
    });

    it("should make a POST request with JSON body", async () => {
        const data = { firstName: "John", lastName: "Doe" };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => data,
            text: async () => "",
        });

        await apiRequest("POST", "/api/patients", data);

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/patients",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            }),
        );
    });

    it("should throw an error when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: "Not Found",
            text: async () => "Resource not found",
        });

        await expect(apiRequest("GET", "/api/patients/unknown")).rejects.toThrow(
            "404: Resource not found",
        );
    });

    it("should throw with statusText when response body is empty", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            text: async () => "",
        });

        await expect(apiRequest("GET", "/api/stats")).rejects.toThrow(
            "500: Internal Server Error",
        );
    });

    it("should not send Content-Type header for requests without data", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => "",
        });

        await apiRequest("DELETE", "/api/patients/123");

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/patients/123",
            expect.objectContaining({
                method: "DELETE",
                headers: {},
                body: undefined,
            }),
        );
    });
});
