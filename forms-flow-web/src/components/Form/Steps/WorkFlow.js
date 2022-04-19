import React, { useState } from "react";
import utils from 'formiojs/utils';
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Select from "react-dropdown-select";
import Button from "@material-ui/core/Button";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import TaskvariableCreate from "./TaskvariableCreate";
import { useSelector, useDispatch } from "react-redux";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { setFormProcessesData } from "../../../actions/processActions";
import ViewAndEditTaskvariable  from "./ViewAndEditTaskvariable";
const WorkFlow = React.memo(
  ({
    associateWorkFlow,
    changeWorkFlowStatus,
    populateDropdown,
    associateToWorkFlow,
    handleNext,
    handleBack,
    handleEditAssociation,
    activeStep,
    steps,
    workflow,
    disableWorkflowAssociation,
  }) => {
    const[modified,setModified] = useState(false)
    const [tabValue, setTabValue] = useState(0);
    const [showTaskVaribleCrete, setShowTaskVaribleCrete] = useState(false);
    const { form } = useSelector((state) => state.form);

    const componentLabel =[]
    const ignoredTypes = ['button','columns','panel','well','container']
    const flattedComponent = Object.values(utils.flattenComponents(form.components,true))
    flattedComponent.forEach(component=>{
      if(!ignoredTypes.includes(component.type)){
        componentLabel.push({ label: component.label, value: component.key })
      }
    })
  
    const dispatch = useDispatch();
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );

    
    const [selectedTaskVariable, setSelectedTaskVariable] = useState(
      formProcessList.taskVariable ? formProcessList.taskVariable : []
    );
    const [keyOfVariable, setKeyOfVariable] = useState(componentLabel.filter(item=>!selectedTaskVariable.find(variable=>item.value===variable.key)));
  

  


    const addTaskVariable = (data) => {
      setSelectedTaskVariable((prev) => {
        return [...prev, data];
      });

      setKeyOfVariable((prev) => {
        return prev.filter(
          (item) =>
            !selectedTaskVariable.find(
              (variable) => variable.key === item.value
            ) && item.value !== data.key
        );
      });
      setShowTaskVaribleCrete(false);
      dispatch(
        setFormProcessesData({
          ...formProcessList,
          taskVariable: [...selectedTaskVariable, data],
        })
      );
    };

    const deleteTaskVariable = (data) => {
      setSelectedTaskVariable((prev) =>
        prev.filter((item) => item.key !== data.key)
      );
      setKeyOfVariable([
        ...keyOfVariable,
        { label: data.defaultLabel, value: data.key },
      ]);
      dispatch(
        setFormProcessesData({
          ...formProcessList,
          taskVariable: selectedTaskVariable.filter(
            (item) => item.key !== data.key
          ),
        })
      );
    };

    const editTaskVariable= (data)=>{
      setSelectedTaskVariable((prev)=>{
        return prev.map(item=>item.key===data.key?{...data}:item)
      })
      dispatch(
        setFormProcessesData({
          ...formProcessList,
          taskVariable: selectedTaskVariable.map(variable=>variable.key===data.key?{...data}:variable)
        })
      );
    }
    const handleChange = (event, newValue) => {
      setTabValue(newValue);
    };

    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="baseline"
      >
        {/* <FormControl component="fieldset"> */}

        <Grid item xs={12} sm={1} spacing={3}>
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary"
            onClick={handleEditAssociation}
          >
            Edit
          </button>
        </Grid>
        <Grid item xs={12} sm={8} spacing={3} />
        <Grid item xs={12} sm={3} className="next-btn">
          <SaveNext
            handleBack={handleBack}
            handleNext={handleNext}
            activeStep={activeStep}
            steps={steps}
            changeWorkFlowStatus={changeWorkFlowStatus}
            modified={modified} 
          />
        </Grid>
        <Grid item xs={12} sm={12} spacing={3}>
          <br />
        </Grid>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label="Workflow Associate" />
          <Tab label="Task variable" />
        </Tabs>

        <Grid
          item
          xs={12}
          sm={12}
          spacing={3}
          disabled={disableWorkflowAssociation}
        >
          {tabValue === 0 ? (
            <Card variant="outlined" className="card-overflow">
              <CardContent>
                <Grid item xs={12} sm={12} spacing={3}>
                  <FormLabel component="legend">
                    Do you want to associate form with a workflow ?
                  </FormLabel>
                  <RadioGroup
                    aria-label="associateWorkFlow"
                    name="associateWorkFlow"
                    value={associateWorkFlow}
                    onChange={(e) => {
                      changeWorkFlowStatus(e.target.value);
                    }}
                    row
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio color="primary" />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio color="primary" />}
                      onClick={(item)=>setModified(true)}
                      label="No"
                    />
                  </RadioGroup>
                </Grid>

                {associateWorkFlow === "yes" && (
                  <>
                    <Grid item xs={12} sm={6} spacing={3}>
                      <h5>
                        Please select from one of the following workflows.
                      </h5>
                      <Select
                        options={populateDropdown()}
                        onChange={(item) =>{setModified(true);
                        associateToWorkFlow(item)}}
                        values={workflow && workflow.value ? [workflow] : []}
                        disabled={disableWorkflowAssociation}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} spacing={3} />
                    <br />
                    {workflow && workflow.value && (
                      <Grid item xs={12} spacing={3}>
                        <ProcessDiagram
                          process_key={workflow && workflow.value}
                        />
                      </Grid>
                    )}
                  </>
                )}
                {/* </FormControl> */}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card variant="outlined" className="card-overflow">
                <CardContent>
                  <p> Add form fields to display in task list </p>
                  {selectedTaskVariable.length !== 0 ? (
                    <Grid item xs={12} md={12} className="mb-2">
                      <TableContainer component={Paper} style={{maxHeight:"250px"}}>
                        <Table stickyHeader aria-label="simple table">
                          <TableHead>
                            <TableRow >
                              <TableCell className="font-weight-bold">Form field</TableCell>
                              <TableCell className="font-weight-bold" align="left">Label</TableCell>
                              <TableCell className="font-weight-bold"align="left">Show in list</TableCell>
                              <TableCell className="font-weight-bold" align="right">
                                Action
                              </TableCell>
                             
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedTaskVariable.map((item,index) => (
                              <ViewAndEditTaskvariable key={index}  
                              item={item}
                              deleteTaskVariable={deleteTaskVariable}
                              editTaskVariable={editTaskVariable}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ) : (
                   <div className="border p-2 mb-2">
                      <FormLabel>No Task variable selected</FormLabel>
                   </div>
                  )}

                  {showTaskVaribleCrete && (
                    <TaskvariableCreate
                      options={keyOfVariable}
                      addTaskVariable={addTaskVariable}
                    />
                  )}
                  {keyOfVariable.length !== 0 && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        setShowTaskVaribleCrete(!showTaskVaribleCrete)
                      }
                      color={showTaskVaribleCrete ? "secondary" : "primary"}
                    >
                      {showTaskVaribleCrete ? "cancel" : "Add"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    );
  }
);
export default WorkFlow;
