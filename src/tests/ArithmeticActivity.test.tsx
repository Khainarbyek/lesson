import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArithmeticActivity } from "../components/ArithmeticActivity";
import { getArithmeticPracticeCopy } from "../lib/content";

const copy = getArithmeticPracticeCopy("en");

function equationText(container: HTMLElement) {
  return container.querySelector(".arithmetic-equation")?.textContent?.replace(/\s+/g, "") ?? "";
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("ArithmeticActivity", () => {
  it("checks a correct typed answer and advances to a new random problem", async () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.7)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.4);

    const { container } = render(
      <ArithmeticActivity
        operationId="addition"
        title="Addition 0-10"
        subject="Math"
        range={{ min: 0, max: 10 }}
        copy={copy}
      />
    );
    const input = screen.getByLabelText("Answer");

    await waitFor(() => {
      expect(equationText(container)).toBe("2+7=?");
    });

    vi.useFakeTimers();
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: /Check answer/i }));

    expect(input).toHaveClass("is-correct");
    expect(screen.getByText("Great job!")).toBeInTheDocument();
    expect(screen.getByText("1 correct")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(equationText(container)).toBe("1+4=?");
    expect(input).toHaveValue(null);
    expect(screen.queryByText("Great job!")).not.toBeInTheDocument();
  });

  it("resets an incorrect answer on the same subtraction problem", async () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.1).mockReturnValueOnce(0.3);

    const { container } = render(
      <ArithmeticActivity
        operationId="subtraction"
        title="Subtraction 0-10"
        subject="Math"
        range={{ min: 0, max: 10 }}
        copy={copy}
      />
    );
    const input = screen.getByLabelText("Answer");

    await waitFor(() => {
      expect(equationText(container)).toBe("3-1=?");
    });

    vi.useFakeTimers();
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: /Check answer/i }));

    expect(input).toHaveClass("is-incorrect");
    expect(input).toBeDisabled();
    expect(screen.getByText("Try again.")).toBeInTheDocument();
    expect(screen.getByText("0 correct")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(equationText(container)).toBe("3-1=?");
    expect(input).toBeEnabled();
    expect(input).toHaveValue(null);
    expect(screen.queryByText("Try again.")).not.toBeInTheDocument();
  });
});
