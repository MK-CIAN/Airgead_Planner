import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Axios from "../components/Axios";
import SavingsChart from "./charts/SavingsChart";
import BudgetChart from "./charts/BudgetChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dayjs, { Dayjs } from "dayjs";
import PortfolioGrowthChart from "./charts/PortfolioGrowthChart";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import BudgetPlaceholder from "./Placeholders/BudgetPlaceholder";
import SavingsPlaceholder from "./Placeholders/SavingsPlaceholder";

interface BudgetData {
  id: number;
  value: number;
  label: string;
  type: string;
}

interface SavingsGoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  contributions: { id: string; amount: number; contribution_date: string }[];
}

interface Article {
  id: number;
  title: string;
  link: string;
  description: string;
  source_name: string;
  pub_date: string;
  image_url: string | null;
}

interface Portfolio {
  balance: number;
  totalbalance: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsGoalData[]>([]);
  const [topArticle, setTopArticle] = useState<Article | null>(null);
  const [loadingArticle, setLoadingArticle] = useState<boolean>(true);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [, setLoading] = useState<boolean>(true);

  // Fetch Monthly Budget Data
  const fetchMonthlyBudget = async (month: Dayjs) => {
    setLoading(true);
    try {
      const response = await Axios.get("data/budget/", {
        params: { month: month.format("YYYY-MM") },
      });

      if (response.data.length > 0) {
        const budget = response.data[0];
        const formattedData: BudgetData[] = budget.items
          ? budget.items.map((item: any) => ({
              id: item.id,
              value: parseFloat(item.amount),
              label: item.category || "Unknown",
              type: item.transaction_type || "expense",
            }))
          : [];
        setBudgetData(formattedData);
      } else {
        setBudgetData([]);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Savings Data with Contributions
  const getSavingsData = () => {
    Axios.get(`data/savings`)
      .then((response) => {
        const formattedData = response.data.map((goal: any) => ({
          id: goal.id,
          name: goal.name,
          target_amount: Number(goal.target_amount),
          current_amount: Number(goal.current_amount),
          progress: (goal.current_amount / goal.target_amount) * 100,
          contributions: goal.contributions || [],
        }));
        setSavingsData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching savings goals:", error);
      });
  };

  // Fetch Top Recommended Article
  const fetchTopArticle = async () => {
    try {
      setLoadingArticle(true);
      const response = await Axios.get(`/data/reccomended-articles/`);
      if (response.data.length > 0) {
        setTopArticle(response.data[0]); // Get only the top article
      } else {
        setTopArticle(null);
      }
    } catch (err) {
      setArticleError("Failed to fetch recommended news.");
    } finally {
      setLoadingArticle(false);
    }
  };

  // Fetch Personal Portfolio Data
  const fetchPortfolio = async () => {
    try {
      const response = await Axios.get(
        `data/portfolio/?portfolio_type=personal`
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyBudget(currentMonth);
    getSavingsData();
    fetchTopArticle();
    fetchPortfolio();
  }, [currentMonth]);

  const firstSavingsGoal = savingsData.length > 0 ? savingsData[0] : null;

  // Get latest contribution
  const latestContribution = firstSavingsGoal?.contributions?.length
    ? firstSavingsGoal.contributions.sort(
        (a, b) =>
          new Date(b.contribution_date).getTime() -
          new Date(a.contribution_date).getTime()
      )[0]
    : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <TypewriterEffectSmooth
          className="text-center"
          words={[
            { text: "Your", className: "text-black dark:text-white" },
            { text: "Airgead", className: "text-green-600" },
            { text: "Planner", className: "text-black dark:text-white" },
            { text: "Dashboard", className: "text-black dark:text-white" },
          ]}
        />
      </div>

      {/* First Row: Budget & Savings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-stretch">
        {/* Budget Chart Widget */}
        {budgetData.length > 0 ? (
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            data-testid="monthly-budget-card"
            onClick={() => navigate("/budget/monthly-budget")}
          >
            <CardHeader>
              <CardTitle>{currentMonth.format("MMMM YYYY")} Budget</CardTitle>
              <CardDescription>Your Budget For This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetChart
                data={budgetData}
                showTitle={false}
                useCard={false}
              />
            </CardContent>
          </Card>
        ) : (
          <BudgetPlaceholder />
        )}

        {/* Savings Goal Widget */}
        {savingsData.length > 0 ? (
          <Card
          className="cursor-pointer transition hover:shadow-lg flex flex-col justify-between"
          onClick={() =>
            firstSavingsGoal
              ? navigate(`/savings/${firstSavingsGoal.id}`)
              : null
          }
        >
          <CardHeader className="text-center">
            <h3 className="text-lg font-semibold">Savings Goal</h3>
            {firstSavingsGoal && (
              <h4 className="text-xl font-medium text-gray-700">
                {firstSavingsGoal.name}
              </h4>
            )}
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-start flex-grow mt-2">
            {firstSavingsGoal ? (
              <div className="w-full flex justify-center">
                <div className="w-full h-auto">
                  <SavingsChart progress={firstSavingsGoal.progress} />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No savings goals available.
              </p>
            )}
          </CardContent>

          <div className="text-center border-t py-3 text-sm text-gray-600">
            {latestContribution ? (
              <p>
                Last Contribution: €
                {Number(latestContribution.amount).toFixed(2)} on{" "}
                {new Date(
                  latestContribution.contribution_date
                ).toLocaleDateString()}
              </p>
            ) : (
              <p>No contributions yet.</p>
            )}
          </div>
        </Card>
        ) : (
          <SavingsPlaceholder />
        )}
      </div>

      {/* Second Row: Top News Article Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="cursor-pointer transition hover:shadow-lg flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Top Financial News</CardTitle>
            <CardDescription>Stay updated with relevant news</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingArticle && <p>Loading article...</p>}
            {articleError && <p className="text-red-500">{articleError}</p>}
            {!loadingArticle && !articleError && topArticle ? (
              <div className="flex flex-col items-center text-center">
                {/* Article Image */}
                {topArticle.image_url && (
                  <img
                    src={topArticle.image_url}
                    alt={topArticle.title}
                    className="w-full max-w-xl h-56 object-cover rounded-md"
                  />
                )}

                {/* Article Title */}
                <a
                  href={topArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold mt-3 text-lg hover:underline"
                >
                  {topArticle.title}
                </a>

                {/* Source & Publication Date */}
                <p className="text-sm text-gray-500 mt-1">
                  {topArticle.source_name} -{" "}
                  {new Date(topArticle.pub_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-center">No news available.</p>
            )}
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition hover:shadow-lg flex flex-col justify-between"
          onClick={() => navigate("/stocksim?portfolio_type=personal")}
        >
          <CardHeader>
            <CardTitle>Your Investment Portfolio</CardTitle>
            <CardDescription>
              Track your stock market performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio ? (
              <div className="text-center">
                {/* Portfolio Growth Chart */}
                <div className="mt-4">
                  <PortfolioGrowthChart
                    portfolioType="personal"
                    showTitle={false}
                    showCardContainer={false}
                  />
                </div>
              </div>
            ) : (
              <p>Loading portfolio data...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
