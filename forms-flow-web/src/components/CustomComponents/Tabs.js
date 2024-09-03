import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

function CustomTabs({ defaultActiveKey, tabs }) {
  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      id="uncontrolled-tab"
      className="custom-tabs mb-3"
    >
      {tabs.map((tab, index) => (
        <Tab key={index} eventKey={tab.eventKey} title={tab.title}>
          {tab.content}
        </Tab>
      ))}
    </Tabs>
  );
}

export default CustomTabs;
