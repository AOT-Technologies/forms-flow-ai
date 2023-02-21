import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay";

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

 

  return (
    <div className="row">
      <div className="col-12">
        <div className="card-counter">
          <div className=" d-flex align-items-center justify-content-between">
          <div>
          <div className="d-flex align-items-center">
            <span className="text-primary mr-2">{t("Form Name")} : </span>
            <h2>{formName}</h2>
          </div>
          <p>
            <span className="text-primary">{t("Version")} :</span>{" "}
            {`v${version}`}
          </p>
          </div>
          {
            sortedVersions.length > 1 ? (
              <div className="col-3">
            <p className="form-label mb-0">Select form version</p>
            <select className="form-select" aria-label="Default select example"  onChange={(e) =>{ handlePieData(e.target.value);}}>
                {
                  sortedVersions.map((option)=> <option key={option.formId} 
                  value={option.formId}>v{option.version}</option>)
                }
                <option selected value={"all"}>All</option>
            </select>
          </div>
            ) : ""
          }
          </div>
          <LoadingOverlay
        active={submissionStatusCountLoader}
        spinner
        text={t("Loading...")}
      >
          <div className="white-box status-container flex-row d-md-flex align-items-center">
            <div className="chart text-center">
              <PieChart width={400} height={400}>
                <Pie
                  paddingAngle={1}
                  minAngle={1}
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

            {
              pieData.length ? (
                <div className="d-flex border flex-wrap rounded p-4   ">
              {pieData.map((entry, index) => (
                <div className=" d-flex align-items-center m-3" key={index}>
                  <span
                    className="rounded-circle shadow  mr-2"
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
              ) : "No submissions"
            }
          </div>
          </LoadingOverlay>
        </div>
      </div>
    </div>
  );
});

export default ChartForm;
