import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import "@testing-library/jest-dom";
import SavingsGoalDetails from "../components/Savings/SavingGoalDetails";
import axios from "@/components/Axios";

// Mock Axios
jest.mock("@/components/Axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Fix Carousel Mock
jest.mock("@/components/ui/carousel", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="carousel" />),
  CarouselContent: jest.fn(() => <div data-testid="carousel-content" />),
  CarouselItem: jest.fn(() => <div data-testid="carousel-item" />),
  CarouselPrevious: jest.fn(() => (
    <button data-testid="carousel-previous">Previous</button>
  )),
  CarouselNext: jest.fn(() => (
    <button data-testid="carousel-next">Next</button>
  )),
}));

const mockSavingsGoal = {
  id: "1",
  name: "New Car Fund",
  target_amount: 5000.0,
  current_amount: 1000.0,
  contributors: [{ id: 1, username: "User1" }],
  image_url: "https://example.com/image.jpg",
};

describe("SavingsGoalDetails Component", () => {
  beforeEach(async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: mockSavingsGoal });
    await waitFor(() => {}); // Ensure data loads before test runs
  });

  it("renders savings goal details correctly", async () => {
    const router = createMemoryRouter(
      [{ path: "/", element: <SavingsGoalDetails /> }],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);

    // Ensure the correct goal name is displayed
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("New Car Fund"))).toBeInTheDocument();
    });

    // Ensure progress text is displayed
    await waitFor(() => {
        expect(
          screen.getByText((content) => /\€1000(?:\.00)?\s*\/\s*\€5000(?:\.00)?/.test(content))
        ).toBeInTheDocument();
      });
      

    // Ensure contribution form exists
    expect(screen.getByLabelText("Contribution Amount")).toBeInTheDocument();

    // Ensure the "Add Contribution" button exists
    expect(
      screen.getByRole("button", { name: /Add Contribution/i })
    ).toBeInTheDocument();
  });

  console.log(SavingsGoalDetails);
});
