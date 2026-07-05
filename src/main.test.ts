/**
 * Sample test — kiểm tra game config
 */
import { describe, it, expect } from "vitest";

describe("Game Config", () => {
  it("should have valid Phaser config", () => {
    const config = {
      type: 0, // Phaser.AUTO
      width: 960,
      height: 540,
      backgroundColor: "#0f172a",
    };

    expect(config.width).toBe(960);
    expect(config.height).toBe(540);
    expect(config.backgroundColor).toBe("#0f172a");
  });
});
