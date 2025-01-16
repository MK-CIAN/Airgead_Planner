import React, { useState, useEffect } from "react";
import Axios from "./Axios";
import { HoverEffect } from "./ui/hover-effect"; // Ensure this is correctly imported based on your project structure

// Article interface
interface Article {
  id: number;
  title: string;
  link: string;
  description: string;
  source_name: string;
  pub_date: string;
  image_url: string | null;
  keywords: string[];
}

// RecommendedArticles component
const RecommendedArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommended articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/data/reccomended-articles/`);
      setArticles(response.data);
    } catch (err: any) {
      setError("Failed to fetch articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Map articles to the HoverEffect component's expected structure
  const mappedArticles = articles.map((article) => ({
    title: article.title,
    description: article.description,
    link: article.link,
    image: article.image_url, // Include the image URL
  }));
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recommended News Articles</h1>
      {loading && <p>Loading articles...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && articles.length === 0 && (
        <p>No recommended articles found.</p>
      )}
      <HoverEffect items={mappedArticles} className="mt-4" />
    </div>
  );
};

export default RecommendedArticles;
