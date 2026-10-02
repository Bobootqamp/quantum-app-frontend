import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App";

afterEach(cleanup);

describe("App", () => {
  it("renders the placeholder and the circuit editor", () => {
    render(<App />);
    expect(screen.getByText(/IBM Bobに尋ねてみましょう/)).toBeTruthy();
    expect(screen.getByText("Circuit")).toBeTruthy();
  });
});
