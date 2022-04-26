import React from "react";

import { Legend, PieChart, Pie, Cell, LabelList } from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
];

// label={renderCustomizedLabel}
const ChartForm = React.memo((props) => {
  
  const { submissionsStatusList,submissionData } = props;

  const pieData = submissionsStatusList;
  
  if (pieData?.length === 0) {
    return <div>No submission status</div>;
  }

  const { applicationName  } = pieData[0];
  
  return (
    <div className="row">
      <div className="col-12">
        <div className="card-counter">
       <div className="d-flex align-items-center">
       <span className="text-primary mr-2">Form Name : </span><h2>{applicationName}</h2>
       </div>
        <p><span className="text-primary">Version :</span> {submissionData?.version}</p>
          <div className="white-box status-container flex-row d-md-flex align-items-center">
            <div className="chart text-center">
                <PieChart width={400} height={400}>
                  <Pie
                    data={pieData}
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="statusName"
                    label
                  >
                    <Legend />
                    <LabelList
                      dataKey="statusName"
                      nameKey="statusName"
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
              </div>
            
            <div className="d-flex border flex-wrap rounded p-4   ">
              {pieData.map((entry, index) => (
                <div className=" d-flex align-items-center m-3" key={index}>
                  <span
                    className="rounded-circle shadow bg-primary mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] , width:"25px", height:"25px"}}
                  ></span>
                  <div className="legent-text">{entry.statusName}</div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
       
    </div>
  );
});

export default ChartForm;
