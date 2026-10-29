import { STATES } from "@/config/rivers";

describe("Vertical Slice: River Corridors & Flow Classification", () => {
  it("should contain mandatory fields for all 7 state configurations", () => {
    const stateKeys = Object.keys(STATES);
    expect(stateKeys.length).toBeGreaterThanOrEqual(7);
    expect(stateKeys).toContain("ohio");
    expect(stateKeys).toContain("michigan");
    expect(stateKeys).toContain("pennsylvania");
    expect(stateKeys).toContain("west-virginia");
    expect(stateKeys).toContain("tennessee");
    expect(stateKeys).toContain("north-carolina");
    expect(stateKeys).toContain("montana");

    stateKeys.forEach((key) => {
      const state = STATES[key];
      expect(state).toHaveProperty("id");
      expect(state).toHaveProperty("name");
      expect(state).toHaveProperty("abbr");
      expect(state.corridors.length).toBeGreaterThan(0);
    });
  });

  it("should correctly validate flow status classification logic", () => {
    const madRiver = STATES.ohio.corridors.find((c) => c.id === "mad-river");
    expect(madRiver).toBeDefined();

    const { min, max } = madRiver.flowRange;

    // Helper logic matching CorridorDetails evaluation
    const evaluateFlow = (flow) => {
      if (flow < min) return "Too Low";
      if (flow > max) return "Too High / Unsafe";
      return "Optimal Flow";
    };

    expect(evaluateFlow(25)).toBe("Too Low");
    expect(evaluateFlow(100)).toBe("Optimal Flow");
    expect(evaluateFlow(250)).toBe("Too High / Unsafe");
  });

  it("should ensure every corridor has valid coordinates and access points", () => {
    Object.values(STATES).forEach((state) => {
      state.corridors.forEach((corridor) => {
        expect(corridor.latitude).toBeGreaterThan(-90);
        expect(corridor.latitude).toBeLessThan(90);
        expect(corridor.longitude).toBeGreaterThan(-180);
        expect(corridor.longitude).toBeLessThan(180);
        expect(corridor.accessPoints).toBeDefined();
        expect(Array.isArray(corridor.accessPoints)).toBe(true);
      });
    });
  });
});
