import { useState, useEffect } from 'react';
import Axios from './Axios';
import MyPieChart from './charts/PieChart';

const Dashboard = () => {
  const [myBrancheData, setMyBrancheData] = useState([]);
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [loading, setLoading] = useState(true); // State to manage loading

  const GetData = () => {
    Axios.get('branchdata/')
      .then((response) => {
        setMyBrancheData(response.data); // Update the branch data state
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data, please try again."); // Set error message
        setLoading(false); // Stop loading on error
      });
  };

  useEffect(() => {
    GetData();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Loading message
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there's an error
  }

  return (
    <div>
      <h1>Sales Dashboard</h1>
      <MyPieChart myData={myBrancheData} />
    </div>
  );
}

export default Dashboard;
