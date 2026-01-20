import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay-ts";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

const ChartForm = React.memo((props) => {
  const { submissionsStatusList, submissionData, submissionStatusCountLoader } = props;
  const {formVersions, formName, parentFormId} = submissionData;

  const sortedVersions = useMemo(()=>
  (formVersions?.sort((version1, version2)=>
  version1.version > version2.version ? 1 : -1)),[formVersions]);

  const version = formVersions?.length;
  const { t } = useTranslation();
  const pieData = submissionsStatusList || [];

  const handlePieData = (value) => {
    const isParentId = value === "all";
    const id = isParentId ? parentFormId : value;
    const option = {parentId : isParentId};
    props.getStatusDetails(id,option);
  };

  // Transform data from Recharts format to Chart.js format
  const chartData = useMemo(() => {
    if (!pieData || pieData.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
        }]
      };
    }

    return {
      labels: pieData.map(entry => entry.statusName),
      datasets: [{
        data: pieData.map(entry => entry.count),
        backgroundColor: pieData.map((entry, index) => 
          COLORS[index % COLORS.length]
        ),
        borderWidth: 0,
      }]
    };
  }, [pieData]);

  // Chart.js options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We're using custom legend below
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      }
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

          <p>
            <span className="text-primary" >{t("Latest Version")} :</span>{" "}
            {`v${version}`}
          </p>
          </div>
          {sortedVersions.length > 1 && (
  <div className="d-flex align-items-center">
    <p className="text-primary mb-0 me-2" style={{ whiteSpace: "nowrap" }}>
      {t("Select form version")}:
    </p>
    <select
      className="form-select"
      aria-label="Default select example"
      onChange={(e) => {
        handlePieData(e.target.value);
      }}
    >
      {sortedVersions.map((option) => (
        <option key={option.formId} value={option.formId}>
          v{option.version}
        </option>
      ))}
      <option selected value={"all"}>
        {t("All")}
      </option>
    </select>
  </div>
)}


          </div>
          <LoadingOverlay
        active={submissionStatusCountLoader}
        spinner
        text={t("Loading...")}
      >
         <div className="white-box status-container flex-row d-md-flex flex-wrap align-items-center justify-content-around">
 
    <div className="col-md-6" style={{ height: '400px', width: '400px' }}>
      {pieData.length > 0 ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
          <span className="text-center">{t("No submissions")}</span>
        </div>
      )}
    </div>
    {
              pieData.length ? (
                <div className="d-flex border flex-wrap rounded p-4   ">
              {pieData.map((entry, index) => (
                <div className=" d-flex align-items-center m-3" key={entry.statusName}>
                  <span
                    className="rounded-circle shadow  me-2"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                      width: "25px",
                      height: "25px",
                    }}
                  ></span>
                  <div className="legent-text">{entry.statusName}</div>
                </div>
              ))}
            </div>
              )  : null
  }
</div>

          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
});

export default ChartForm;
