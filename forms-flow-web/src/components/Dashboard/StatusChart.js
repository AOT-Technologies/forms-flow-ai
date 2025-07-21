import React, { useState } from "react";
import { FormControl } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay-ts";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Pie, PolarArea, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
);

const chartTypes = [
  { value: 'pie', label: 'Pie Chart' },
  { value: 'v-bar', label: 'Vertical Bar Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'polar-area', label: 'Polar Area Chart' },
  { value: 'radar', label: 'Radar Chart' },
];

const testData = {
  datasets: [
    {
      label: 'Submissions Dataset',
      data: [{"Completed": 10}, {"In Progress": 4}, {"Inactive": 3}, {"Other": 1}],
      backgroundColor: [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#a05195",
        "#d45087",
        "#f95d6a",
        "#ff7c43"
      ]
    }
  ]
};


const ChartForm = React.memo((props) => {
  const { submissionsStatusList, submissionData, submissionStatusCountLoader } = props;
  const { formName } = submissionData;

  const [selectedChartValue, setSelectedChartValue] = useState('pie');

  const { t } = useTranslation();
  const chartData = submissionsStatusList || [];
  console.log(chartData);

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const renderChart = () => {
    switch (selectedChartValue) {
      case 'pie':
        return (
          <Pie
            data={testData}
            options={chartOptions}
          />
        );
      case 'v-bar':
        return (
          <Bar
            data={testData}
            options={chartOptions}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            data={testData}
            options={chartOptions}
          />
        );
      case 'polar-area':
        return (
          <PolarArea
            data={testData}
            options={chartOptions}
          />
        );
      case 'radar':
        return (
          <Radar
            data={testData}
            options={chartOptions}
          />
        );
    }
  };


  return (
    <div className="row">
      <div className="col-12">
        <div className="card-counter">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div className="d-flex flex-column">
              <div className="d-flex">
                <span className="text-primary me-2" style={{ whiteSpace: "nowrap" }}>
                  {t("Form Name")} :
                </span>
                <h2
                  className="mt-0 mb-2 fs-6"
                >
                  {formName}
                </h2>
              </div>
            </div>
          </div>
          <LoadingOverlay
            active={submissionStatusCountLoader}
            spinner
            text={t("Loading...")}
          >
            <div className="white-box status-container flex-row d-md-flex flex-wrap align-items-center justify-content-around">
              <div className="col-md-6">
                {renderChart()}
              </div>
              <div className="col-md-3 offset-md-1">
                <div className="input-group">
                  <FormControl
                    as="select"
                    onChange={(e) => setSelectedChartValue(e.target.value)}
                    className="form-select p-1"
                    title={t("Choose any")}
                    aria-label="Select chart type"
                  >
                    {chartTypes.map((option, index) => (
                      <option key={index} value={option.value}>{option.label}</option>
                    ))}
                  </FormControl>
                </div>
              </div>
            </div>
          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
});

export default ChartForm;