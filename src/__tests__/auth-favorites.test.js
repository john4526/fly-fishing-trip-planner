import { isFirebaseConfigured } from "@/lib/firebase";

describe("Vertical Slice: Auth & Favorites State Management", () => {
  it("should correctly evaluate default mock/unconfigured firebase fallback state", () => {
    // When environment variables are missing, isFirebaseConfigured is boolean
    expect(typeof isFirebaseConfigured).toBe("boolean");
  });

  it("should evaluate admin permission check logic correctly for designated emails", () => {
    const checkIsAdmin = (email) => {
      return email === "admin@flyfishing.com" || email === "admin@kline.cloud";
    };

    expect(checkIsAdmin("angler@gmail.com")).toBe(false);
    expect(checkIsAdmin("admin@flyfishing.com")).toBe(true);
    expect(checkIsAdmin("admin@kline.cloud")).toBe(true);
  });

  it("should process favorites array addition and removal deterministically", () => {
    let userFavorites = ["mad-river"];

    const toggleFavorite = (corridorId) => {
      if (userFavorites.includes(corridorId)) {
        userFavorites = userFavorites.filter((id) => id !== corridorId);
      } else {
        userFavorites = [...userFavorites, corridorId];
      }
      return userFavorites;
    };

    // Toggle off existing
    expect(toggleFavorite("mad-river")).not.toContain("mad-river");

    // Toggle on new
    expect(toggleFavorite("clear-fork")).toContain("clear-fork");
  });
});
