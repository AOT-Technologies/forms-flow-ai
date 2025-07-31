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


const BACKGROUND_COLORS = [
  "#0088FE33",
  "#00C49F33",
  "#FFBB2833",
  "#FF804233",
  "#a0519533",
  "#d4508733",
  "#f95d6a33",
  "#ff7c4333",
];

const BORDER_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
];

const CHART_TYPES = [
  { value: 'pie', label: 'Pie Chart' },
  { value: 'v-bar', label: 'Vertical Bar Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'polar-area', label: 'Polar Area Chart' },
  { value: 'radar', label: 'Radar Chart' },
];


const ChartForm = React.memo((props) => {
  const { submissionsStatusList, submissionData, submissionStatusCountLoader } = props;
  const {title} = submissionData;
  const { t } = useTranslation();

  const [selectedChartValue, setSelectedChartValue] = useState('pie');

  let chartLabels = [];
  let chartDataset = [];
  submissionsStatusList.map((metric) => {
    chartLabels.push(metric.metric);
    chartDataset.push(metric.count);
  });

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: `${title} Dataset`,
      data: chartDataset,
      backgroundColor: BACKGROUND_COLORS,
      borderColor: BORDER_COLORS,
      borderWidth: 1
    }]
  } || {};

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
            data={chartData}
            options={chartOptions}
          />
        );
      case 'v-bar':
        return (
          <Bar
            data={chartData}
            options={chartOptions}
          />
        );
      case 'doughnut':
        return (
          <Doughnut
            data={chartData}
            options={chartOptions}
          />
        );
      case 'polar-area':
        return (
          <PolarArea
            data={chartData}
            options={chartOptions}
          />
        );
      case 'radar':
        return (
          <Radar
            data={chartData}
            options={chartOptions}
          />
        );
    }
  };


  return (
    <div className="row">
      <div className="col-12">
        <div className="card-counter">
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
                    {CHART_TYPES.map((option, index) => (
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