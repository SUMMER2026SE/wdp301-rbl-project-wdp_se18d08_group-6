import { describe, it, expect } from "vitest";
import { extractFilters } from "./filter-extractor";

describe("FilterExtractor", () => {
  describe("extractCategory", () => {
    it("extracts 'áo dài' category", () => {
      const result = extractFilters("Em muốn tìm áo dài");
      expect(result.category).toContain("Áo dài truyền thống");
    });

    it("extracts 'váy' category", () => {
      const result = extractFilters("Cho thuê váy");
      expect(result.category).toContain("Váy cưới");
    });

    it("extracts 'đầm' as Váy cưới", () => {
      const result = extractFilters("Còn đầm đỏ không?");
      expect(result.category).toContain("Váy cưới");
    });

    it("returns undefined when no category mentioned", () => {
      const result = extractFilters("Cảm ơn shop");
      expect(result.category).toBeUndefined();
    });
  });

  describe("extractColor", () => {
    it("extracts 'đỏ'", () => {
      const result = extractFilters("áo dài đỏ");
      expect(result.color).toContain("đỏ");
    });

    it("extracts 'xanh' from 'xanh dương'", () => {
      const result = extractFilters("váy xanh dương");
      expect(result.color).toContain("xanh");
    });

    it("extracts multiple colors", () => {
      const result = extractFilters("áo dài đỏ và xanh");
      expect(result.color).toContain("đỏ");
      expect(result.color).toContain("xanh");
    });

    it("returns undefined when no color mentioned", () => {
      const result = extractFilters("Có áo dài không?");
      expect(result.color).toBeUndefined();
    });
  });

  describe("extractSize", () => {
    it("extracts size from 'size M' pattern", () => {
      const result = extractFilters("Còn size M không?");
      expect(result.size).toContain("M");
    });

    it("extracts standalone XL", () => {
      const result = extractFilters("Có áo size XL không?");
      expect(result.size).toContain("XL");
    });

    it("returns undefined when no size mentioned", () => {
      const result = extractFilters("áo dài đỏ");
      expect(result.size).toBeUndefined();
    });
  });

  describe("extractBudget", () => {
    it("extracts 'dưới 500k' as max budget", () => {
      const result = extractFilters("Áo dài dưới 500k");
      expect(result.budgetMax).toBe(500_000);
    });

    it("extracts 'trên 1 triệu' as min budget", () => {
      const result = extractFilters("Áo trên 1 triệu");
      expect(result.budgetMin).toBe(1_000_000);
    });

    it("extracts range '300k - 500k'", () => {
      const result = extractFilters("Áo dài 300k - 500k");
      expect(result.budgetMin).toBe(300_000);
      expect(result.budgetMax).toBe(500_000);
    });

    it("extracts 'khoảng 1tr' with tolerance", () => {
      const result = extractFilters("Áo dài khoảng 1tr");
      expect(result.budgetMin).toBe(800_000);
      expect(result.budgetMax).toBe(1_200_000);
    });

    it("returns undefined when no budget", () => {
      const result = extractFilters("Có áo dài không?");
      expect(result.budgetMin).toBeUndefined();
      expect(result.budgetMax).toBeUndefined();
    });

    it("extracts 'dưới 1,2 triệu' with Vietnamese decimal comma", () => {
      const result = extractFilters("áo dài tím dưới 1,2 triệu");
      expect(result.budgetMax).toBe(1_200_000);
      expect(result.budgetMin).toBeUndefined();
    });

    it("extracts 'dưới 1 ,2 triệu' with space before decimal comma", () => {
      const result = extractFilters("áo dài tím dưới 1 ,2 triệu");
      expect(result.budgetMax).toBe(1_200_000);
    });

    it("extracts 'trên 1.200.000' with dot thousand separators", () => {
      const result = extractFilters("váy trên 1.200.000");
      expect(result.budgetMin).toBe(1_200_000);
    });
  });

  describe("extractKeyword", () => {
    it("extracts remaining text as keyword after removing filters", () => {
      const result = extractFilters("áo dài đỏ chụp kỷ yếu");
      expect(result.keyword).toBeDefined();
      expect(result.keyword!.toLowerCase()).toContain("chụp");
    });

    it("returns undefined when only filters remain", () => {
      const result = extractFilters("áo dài đỏ");
      expect(result.keyword).toBeUndefined();
    });

    it("does not leak budget words into keyword", () => {
      const result = extractFilters("áo dài tím dưới 1,2 triệu");
      expect(result.keyword).toBeUndefined();
    });

    it("does not leak color into keyword", () => {
      const result = extractFilters("áo dài tím");
      expect(result.keyword).toBeUndefined();
    });
  });
});
