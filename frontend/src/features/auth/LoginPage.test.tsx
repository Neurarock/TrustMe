import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "@/store/session";
import { renderWithProviders } from "@/test/utils";
import { LoginPage } from "./LoginPage";

beforeEach(() => {
  useSession.setState({ user: null });
  localStorage.clear();
});

describe("LoginPage", () => {
  it("offers both client and host roles", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });
    expect(screen.getByText("I'm submitting a request")).toBeInTheDocument();
    expect(screen.getByText("I'm the finance team")).toBeInTheDocument();
  });

  it("signs in as host with the chosen role", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.click(screen.getByText("I'm the finance team"));
    await user.click(screen.getByRole("button", { name: /continue as finance team/i }));

    expect(useSession.getState().user?.role).toBe("host");
  });

  it("defaults the client's name when left blank", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: "/login" });

    await user.click(screen.getByRole("button", { name: /continue as client/i }));

    const signedIn = useSession.getState().user;
    expect(signedIn?.role).toBe("client");
    expect(signedIn?.name).toBe("Sarah Jones");
  });
});
