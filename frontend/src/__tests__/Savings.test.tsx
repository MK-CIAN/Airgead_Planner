import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import '@testing-library/jest-dom';
import Savings from "@/components/Savings/Savings";
import Axios from "@/components/Axios";

(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Axios
jest.mock("@/components/Axios");

beforeEach(() => {
  (Axios.get as jest.Mock).mockResolvedValue({ data: [] });
  (Axios.post as jest.Mock).mockResolvedValue({});
  (Axios.delete as jest.Mock).mockResolvedValue({});
});


describe("Savings Component", () => {
  test("renders page title and add button", async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Savings />
        </BrowserRouter>
      );
    });

    expect(screen.getByText("Savings Goals")).toBeInTheDocument();
    expect(screen.getByText("Add Savings Goal")).toBeInTheDocument();
  });

  test("fetches and displays savings goals", async () => {
    (Axios.get as jest.Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          name: "New Car",
          target_amount: 10000,
          current_amount: 2000,
          monthly_contribution: 200,
        },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Savings />
        </BrowserRouter>
      );
    });

    await waitFor(() => expect(screen.getByText("New Car")).toBeInTheDocument());
  });

  test("adds a new savings goal", async () => {
    (Axios.post as jest.Mock).mockResolvedValue({});
    (Axios.get as jest.Mock).mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <BrowserRouter>
          <Savings />
        </BrowserRouter>
      );
    });

    const addButton = screen.getByText("Add Savings Goal");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Hide Form")).toBeInTheDocument();
    });
  });
});
