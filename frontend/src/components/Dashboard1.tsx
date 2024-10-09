import {useState, useEffect} from 'react';
import Axios from './Axios';
import MyPieChart from './charts/PieChart';
import MyChartBox from './charts/ChartBox';

const Dashboard1 = () => {

  const [myData, setMyData] = useState([]);
  console.log("MyData: ", myData);

  const GetData = () => {
    Axios.get('supermarketsales/')
    .then((response) => {
      setMyData(response.data);
    })
  }

  useEffect(() => {
    GetData();
  }, []);

  return (
    <div>
      <MyChartBox />
      <MyPieChart />
    </div>
  );
}

export default Dashboard1;