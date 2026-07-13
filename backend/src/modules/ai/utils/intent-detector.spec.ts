import { describe, it, expect } from "vitest";
import { detectIntent } from "./intent-detector";

describe("IntentDetector", () => {
  it("detects search intent with product keyword + color + category", () => {
    const result = detectIntent("Em muốn tìm áo dài đỏ chụp kỷ yếu");
    expect(result.intent).toBe("search");
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("detects search intent with rental action", () => {
    const result = detectIntent("Cho thuê áo dài không?");
    expect(result.intent).toBe("search");
  });

  it("detects search intent with size", () => {
    const result = detectIntent("Còn size M không?");
    expect(result.intent).toBe("search");
  });

  it("detects search intent with budget + product", () => {
    const result = detectIntent("Có áo nào dưới 500k không?");
    expect(result.intent).toBe("search");
  });

  it("detects search intent for short product query", () => {
    const result = detectIntent("áo dài");
    expect(result.intent).toBe("search");
  });

  it("detects general intent for store policy question", () => {
    const result = detectIntent("Mấy giờ mở cửa?");
    expect(result.intent).toBe("general");
  });

  it("detects general intent for location question", () => {
    const result = detectIntent("Shop ở đâu vậy?");
    expect(result.intent).toBe("general");
  });

  it("detects general intent for payment question", () => {
    const result = detectIntent("Thanh toán thế nào?");
    expect(result.intent).toBe("general");
  });

  it("detects general intent for price-only question without product", () => {
    const result = detectIntent("Giá bao nhiêu?");
    expect(result.intent).toBe("general");
  });

  it("detects other intent for greeting", () => {
    const result = detectIntent("Chào shop");
    expect(result.intent).toBe("other");
  });

  it("detects other intent for empty message", () => {
    const result = detectIntent("");
    expect(result.intent).toBe("other");
  });

  it("detects other intent for chit-chat", () => {
    const result = detectIntent("Cám ơn shop nha");
    expect(result.intent).toBe("other");
  });

  it("detects search intent even with mixed wording", () => {
    const result = detectIntent("Còn váy xanh không?");
    expect(result.intent).toBe("search");
  });
});
