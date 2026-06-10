import { beforeEach, describe, expect, it } from "vitest";
import { useSession } from "./session";

beforeEach(() => {
  useSession.setState({ user: null });
  localStorage.clear();
});

describe("useSession", () => {
  it("starts signed out", () => {
    expect(useSession.getState().user).toBeNull();
  });

  it("signs a client in and out", () => {
    useSession.getState().signIn({ role: "client", name: "Sarah Jones" });
    expect(useSession.getState().user).toEqual({ role: "client", name: "Sarah Jones" });

    useSession.getState().signOut();
    expect(useSession.getState().user).toBeNull();
  });

  it("supports the host role", () => {
    useSession.getState().signIn({ role: "host", name: "Finance Ops" });
    expect(useSession.getState().user?.role).toBe("host");
  });
});
