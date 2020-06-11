import { map } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import ColorPicker from "@/components/ColorPicker";

export default function Legend({ items, alignText }) {
  return (
    <div className="choropleth-visualization-legend">
      {map(items, (item, index) => (
        <div key={`legend${index}`} className="legend-item">
          <ColorPicker.Swatch color={item.color} />
          <div className={`legend-item-text text-${alignText}`}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

Legend.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  alignText: PropTypes.oneOf(["left", "center", "right"]),
};

Legend.defaultProps = {
  items: [],
  alignText: "left",
};
