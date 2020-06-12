import React from "react";

import { Legend, PieChart, Pie, Cell, LabelList } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// label={renderCustomizedLabel}
const ChartForm = (props) => {
  const { submissionsStatusList } = props;
  console.log("submissionsStatusList", submissionsStatusList);
  const pieData = submissionsStatusList;
  if (pieData.length === 0) {
    return <div>Loading status ..</div>;
  }
  return (
    <div className="card-counter">
      <div className="white-box analytics-info">
        <h4>submission status</h4>
        <PieChart width={500} height={300}>
          <Pie
            data={pieData}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="count"
            nameKey="formName"
            label="formName"
          >
            <Legend />
            <LabelList
              dataKey="formName"
              nameKey="formName"
              position="insideTop"
              angle="45"
            />
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
        {/* </div>
        </div> */}
      </div>
    </div>
  );
};

export default ChartForm;
