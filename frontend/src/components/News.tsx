import React, { useState, useEffect } from 'react';
import Axios from './Axios';

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

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await Axios.get('/data/reccomended-articles/');
            setArticles(response.data);
        } catch (err: any) {
            setError('Failed to fetch articles. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    return (
        <div>
            <h1>Recommended News Articles</h1>
            {loading && <p>Loading articles...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && articles.length === 0 && (
                <p>No recommended articles found.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {articles.map((article) => (
                    <div key={article.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
                        <h2>{article.title}</h2>
                        {article.image_url && (
                            <img
                                src={article.image_url}
                                alt={article.title}
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        )}
                        <p>{article.description}</p>
                        <p>
                            <strong>Source:</strong> {article.source_name}
                        </p>
                        <p>
                            <strong>Published:</strong> {new Date(article.pub_date).toLocaleDateString()}
                        </p>
                        <div>
                            <strong>Keywords:</strong> {article.keywords.join(', ')}
                        </div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer">
                            Read more
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedArticles;
