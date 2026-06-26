import { describe, expect, test } from "bun:test";
import { validateReceiptUrl } from "../src/url-policy";

describe("validateReceiptUrl", () => {
  test("accepts a public HTTPS receipt URL", () => {
    expect(validateReceiptUrl("https://www.sefaz.example/nfce?p=1").protocol).toBe(
      "https:",
    );
  });

  test("rejects HTTP and local addresses", () => {
    expect(() => validateReceiptUrl("http://example.com")).toThrow();
    expect(() => validateReceiptUrl("https://127.0.0.1/cupom")).toThrow();
    expect(() => validateReceiptUrl("https://localhost/cupom")).toThrow();
  });
});
