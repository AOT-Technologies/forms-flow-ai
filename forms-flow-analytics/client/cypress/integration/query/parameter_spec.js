import { createQuery } from "../../support/redash-api";

describe("Parameter", () => {
  const expectDirtyStateChange = edit => {
    cy.getByTestId("ParameterName-test-parameter")
      .find(".parameter-input")
      .should($el => {
        assert.isUndefined($el.data("dirty"));
      });

    edit();

    cy.getByTestId("ParameterName-test-parameter")
      .find(".parameter-input")
      .should($el => {
        assert.isTrue($el.data("dirty"));
      });
  };

  beforeEach(() => {
    cy.login();
  });

  describe("Text Parameter", () => {
    beforeEach(() => {
      const queryData = {
        name: "Text Parameter",
        query: "SELECT '{{test-parameter}}' AS parameter",
        options: {
          parameters: [{ name: "test-parameter", title: "Test Parameter", type: "text" }],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}`));
    });

    it("updates the results after clicking Apply", () => {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .type("Redash");

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", "Redash");
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => {
        cy.getByTestId("ParameterName-test-parameter")
          .find("input")
          .type("Redash");
      });
    });
  });

  describe("Number Parameter", () => {
    beforeEach(() => {
      const queryData = {
        name: "Number Parameter",
        query: "SELECT '{{test-parameter}}' AS parameter",
        options: {
          parameters: [{ name: "test-parameter", title: "Test Parameter", type: "number" }],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}`));
    });

    it("updates the results after clicking Apply", () => {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .type("{selectall}42");

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", 42);

      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .type("{selectall}31415");

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", 31415);
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => {
        cy.getByTestId("ParameterName-test-parameter")
          .find("input")
          .type("{selectall}42");
      });
    });
  });

  describe("Dropdown Parameter", () => {
    beforeEach(() => {
      const queryData = {
        name: "Dropdown Parameter",
        query: "SELECT '{{test-parameter}}' AS parameter",
        options: {
          parameters: [
            { name: "test-parameter", title: "Test Parameter", type: "enum", enumOptions: "value1\nvalue2\nvalue3" },
          ],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));
    });

    it("updates the results after selecting a value", () => {
      cy.getByTestId("ParameterName-test-parameter")
        .find(".ant-select")
        .click();

      cy.contains("li.ant-select-dropdown-menu-item", "value2").click();

      cy.getByTestId("ParameterApplyButton").click();
      // ensure that query is being executed
      cy.getByTestId("QueryExecutionStatus").should("exist");

      cy.getByTestId("TableVisualization").should("contain", "value2");
    });

    it("supports multi-selection", () => {
      cy.clickThrough(`
        ParameterSettings-test-parameter
        AllowMultipleValuesCheckbox
        QuotationSelect
        DoubleQuotationMarkOption
        SaveParameterSettings
      `);

      cy.getByTestId("ParameterName-test-parameter")
        .find(".ant-select")
        .click();

      // select all unselected options
      cy.get("li.ant-select-dropdown-menu-item").each($option => {
        if (!$option.hasClass("ant-select-dropdown-menu-item-selected")) {
          cy.wrap($option).click();
        }
      });

      cy.getByTestId("QueryEditor").click(); // just to close the select menu

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", '"value1","value2","value3"');
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => {
        cy.getByTestId("ParameterName-test-parameter")
          .find(".ant-select")
          .click();

        cy.contains("li.ant-select-dropdown-menu-item", "value2").click();
      });
    });
  });

  describe("Query Based Dropdown Parameter", () => {
    context("based on a query with no results", () => {
      beforeEach(() => {
        const dropdownQueryData = {
          name: "Dropdown Query",
          query: "",
        };
        createQuery(dropdownQueryData, true).then(dropdownQuery => {
          const queryData = {
            name: "Query Based Dropdown Parameter",
            query: "SELECT '{{test-parameter}}' AS parameter",
            options: {
              parameters: [
                { name: "test-parameter", title: "Test Parameter", type: "query", queryId: dropdownQuery.id },
              ],
            },
          };

          createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));
        });
      });

      it("should show a 'No options available' message when you click", () => {
        cy.getByTestId("ParameterName-test-parameter")
          .find(".ant-select:not(.ant-select-disabled) .ant-select-selection")
          .click();

        cy.contains("li.ant-select-dropdown-menu-item", "No options available");
      });
    });

    context("based on a query with 3 results", () => {
      beforeEach(() => {
        const dropdownQueryData = {
          name: "Dropdown Query",
          query: `SELECT 'value1' AS name, 1 AS value UNION ALL
                  SELECT 'value2' AS name, 2 AS value UNION ALL
                  SELECT 'value3' AS name, 3 AS value`,
        };
        createQuery(dropdownQueryData, true).then(dropdownQuery => {
          const queryData = {
            name: "Query Based Dropdown Parameter",
            query: "SELECT '{{test-parameter}}' AS parameter",
            options: {
              parameters: [
                { name: "test-parameter", title: "Test Parameter", type: "query", queryId: dropdownQuery.id },
              ],
            },
          };

          cy.visit(`/queries/${dropdownQuery.id}`);
          cy.getByTestId("ExecuteButton").click();
          cy.getByTestId("TableVisualization")
            .should("contain", "value1")
            .and("contain", "value2")
            .and("contain", "value3");

          createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));
        });
      });

      it("supports multi-selection", () => {
        cy.clickThrough(`
          ParameterSettings-test-parameter
          AllowMultipleValuesCheckbox
          QuotationSelect
          DoubleQuotationMarkOption
          SaveParameterSettings
        `);

        cy.getByTestId("ParameterName-test-parameter")
          .find(".ant-select")
          .click();

        // make sure all options are unselected and select all
        cy.get("li.ant-select-dropdown-menu-item").each($option => {
          expect($option).not.to.have.class("ant-select-dropdown-menu-item-selected");
          cy.wrap($option).click();
        });

        cy.getByTestId("QueryEditor").click(); // just to close the select menu

        cy.getByTestId("ParameterApplyButton").click();

        cy.getByTestId("TableVisualization").should("contain", '"1","2","3"');
      });
    });
  });

  describe("Date Parameter", () => {
    const selectCalendarDate = date => {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .click();

      cy.get(".ant-calendar-date-panel")
        .contains(".ant-calendar-date", date)
        .click();
    };

    beforeEach(() => {
      const queryData = {
        name: "Date Parameter",
        query: "SELECT '{{test-parameter}}' AS parameter",
        options: {
          parameters: [{ name: "test-parameter", title: "Test Parameter", type: "date", value: null }],
        },
      };

      const now = new Date();
      now.setDate(1);
      cy.wrap(now.getTime()).as("now");
      cy.clock(now.getTime(), ["Date"]);

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}`));
    });

    afterEach(() => {
      cy.clock().then(clock => clock.restore());
    });

    it("updates the results after selecting a date", function() {
      selectCalendarDate("15");

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", Cypress.moment(this.now).format("15/MM/YY"));
    });

    it("allows picking a dynamic date", function() {
      cy.getByTestId("DynamicButton").click();

      cy.getByTestId("DynamicButtonMenu")
        .contains("Today/Now")
        .click();

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", Cypress.moment(this.now).format("DD/MM/YY"));
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => selectCalendarDate("15"));
    });
  });

  describe("Date and Time Parameter", () => {
    beforeEach(() => {
      const queryData = {
        name: "Date and Time Parameter",
        query: "SELECT '{{test-parameter}}' AS parameter",
        options: {
          parameters: [{ name: "test-parameter", title: "Test Parameter", type: "datetime-local", value: null }],
        },
      };

      const now = new Date();
      now.setDate(1);
      cy.wrap(now.getTime()).as("now");
      cy.clock(now.getTime(), ["Date"]);

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}`));
    });

    afterEach(() => {
      cy.clock().then(clock => clock.restore());
    });

    it("updates the results after selecting a date and clicking in ok", function() {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .as("Input")
        .click();

      cy.get(".ant-calendar-date-panel")
        .contains(".ant-calendar-date", "15")
        .click();

      cy.get(".ant-calendar-ok-btn").click();

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", Cypress.moment(this.now).format("YYYY-MM-15 HH:mm"));
    });

    it("shows the current datetime after clicking in Now", function() {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .as("Input")
        .click();

      cy.get(".ant-calendar-date-panel")
        .contains("Now")
        .click();

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", Cypress.moment(this.now).format("YYYY-MM-DD HH:mm"));
    });

    it("allows picking a dynamic date", function() {
      cy.getByTestId("DynamicButton").click();

      cy.getByTestId("DynamicButtonMenu")
        .contains("Today/Now")
        .click();

      cy.getByTestId("ParameterApplyButton").click();

      cy.getByTestId("TableVisualization").should("contain", Cypress.moment(this.now).format("YYYY-MM-DD HH:mm"));
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => {
        cy.getByTestId("ParameterName-test-parameter")
          .find("input")
          .click();

        cy.get(".ant-calendar-date-panel")
          .contains("Now")
          .click();
      });
    });
  });

  describe("Date Range Parameter", () => {
    const selectCalendarDateRange = (startDate, endDate) => {
      cy.getByTestId("ParameterName-test-parameter")
        .find("input")
        .first()
        .click();

      cy.get(".ant-calendar-date-panel")
        .contains(".ant-calendar-date", startDate)
        .click();

      cy.get(".ant-calendar-date-panel")
        .contains(".ant-calendar-date", endDate)
        .click();
    };

    beforeEach(() => {
      const queryData = {
        name: "Date Range Parameter",
        query: "SELECT '{{test-parameter.start}} - {{test-parameter.end}}' AS parameter",
        options: {
          parameters: [{ name: "test-parameter", title: "Test Parameter", type: "date-range" }],
        },
      };

      const now = new Date();
      now.setDate(1);
      cy.wrap(now.getTime()).as("now");
      cy.clock(now.getTime(), ["Date"]);

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));
    });

    afterEach(() => {
      cy.clock().then(clock => clock.restore());
    });

    it("updates the results after selecting a date range", function() {
      selectCalendarDateRange("15", "20");

      cy.getByTestId("ParameterApplyButton").click();

      const now = Cypress.moment(this.now);
      cy.getByTestId("TableVisualization").should(
        "contain",
        now.format("YYYY-MM-15") + " - " + now.format("YYYY-MM-20")
      );
    });

    it("allows picking a dynamic date range", function() {
      cy.getByTestId("DynamicButton").click();

      cy.getByTestId("DynamicButtonMenu")
        .contains("Last month")
        .click();

      cy.getByTestId("ParameterApplyButton").click();

      const lastMonth = Cypress.moment(this.now).subtract(1, "month");
      cy.getByTestId("TableVisualization").should(
        "contain",
        lastMonth.startOf("month").format("YYYY-MM-DD") + " - " + lastMonth.endOf("month").format("YYYY-MM-DD")
      );
    });

    it("sets dirty state when edited", () => {
      expectDirtyStateChange(() => selectCalendarDateRange("15", "20"));
    });
  });

  describe("Apply Changes", () => {
    const expectAppliedChanges = apply => {
      cy.getByTestId("ParameterName-test-parameter-1")
        .find("input")
        .as("Input")
        .type("Redash");

      cy.getByTestId("ParameterName-test-parameter-2")
        .find("input")
        .type("Redash");

      cy.location("search").should("not.contain", "Redash");

      cy.server();
      cy.route("POST", "api/queries/*/results").as("Results");

      apply(cy.get("@Input"));

      cy.location("search").should("contain", "Redash");
      cy.wait("@Results");
    };

    beforeEach(() => {
      const queryData = {
        name: "Testing Apply Button",
        query: "SELECT '{{test-parameter-1}} {{ test-parameter-2 }}'",
        options: {
          parameters: [
            { name: "test-parameter-1", title: "Test Parameter 1", type: "text" },
            { name: "test-parameter-2", title: "Test Parameter 2", type: "text" },
          ],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));
    });

    it("shows and hides according to parameter dirty state", () => {
      cy.getByTestId("ParameterApplyButton").should("not.be", "visible");

      cy.getByTestId("ParameterName-test-parameter-1")
        .find("input")
        .as("Param")
        .type("Redash");

      cy.getByTestId("ParameterApplyButton").should("be", "visible");

      cy.get("@Param").clear();

      cy.getByTestId("ParameterApplyButton").should("not.be", "visible");
    });

    it("updates dirty counter", () => {
      cy.getByTestId("ParameterName-test-parameter-1")
        .find("input")
        .type("Redash");

      cy.getByTestId("ParameterApplyButton")
        .find(".ant-badge-count p.current")
        .should("contain", "1");

      cy.getByTestId("ParameterName-test-parameter-2")
        .find("input")
        .type("Redash");

      cy.getByTestId("ParameterApplyButton")
        .find(".ant-badge-count p.current")
        .should("contain", "2");
    });

    it('applies changes from "Apply Changes" button', () => {
      expectAppliedChanges(() => {
        cy.getByTestId("ParameterApplyButton").click();
      });
    });

    it('applies changes from "alt+enter" keyboard shortcut', () => {
      expectAppliedChanges(input => {
        input.type("{alt}{enter}");
      });
    });

    it('disables "Execute" button', () => {
      cy.getByTestId("ParameterName-test-parameter-1")
        .find("input")
        .as("Input")
        .type("Redash");
      cy.getByTestId("ExecuteButton").should("be.disabled");

      cy.get("@Input").clear();
      cy.getByTestId("ExecuteButton").should("be.enabled");
    });
  });

  describe("Draggable", () => {
    beforeEach(() => {
      const queryData = {
        name: "Draggable",
        query: "SELECT '{{param1}}', '{{param2}}', '{{param3}}', '{{param4}}' AS parameter",
        options: {
          parameters: [
            { name: "param1", title: "Parameter 1", type: "text" },
            { name: "param2", title: "Parameter 2", type: "text" },
            { name: "param3", title: "Parameter 3", type: "text" },
            { name: "param4", title: "Parameter 4", type: "text" },
          ],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));

      cy.get(".parameter-block")
        .first()
        .invoke("width")
        .as("paramWidth");

      cy.get("body").type("{alt}D"); // hide schema browser
    });

    const dragParam = (paramName, offsetLeft, offsetTop) => {
      cy.getByTestId(`DragHandle-${paramName}`)
        .trigger("mouseover")
        .trigger("mousedown");

      cy.get(".parameter-dragged .drag-handle")
        .trigger("mousemove", offsetLeft, offsetTop, { force: true })
        .trigger("mouseup", { force: true });
    };

    it("is possible to rearrange parameters", function() {
      cy.server();
      cy.route("POST", "api/queries/*").as("QuerySave");

      dragParam("param1", this.paramWidth, 1);
      cy.wait("@QuerySave");
      dragParam("param4", -this.paramWidth, 1);
      cy.wait("@QuerySave");

      cy.reload();

      const expectedOrder = ["Parameter 2", "Parameter 1", "Parameter 4", "Parameter 3"];
      cy.get(".parameter-container label").each(($label, index) => expect($label).to.have.text(expectedOrder[index]));
    });
  });

  describe("Parameter Settings", () => {
    beforeEach(() => {
      const queryData = {
        name: "Draggable",
        query: "SELECT '{{parameter}}' AS parameter",
        options: {
          parameters: [{ name: "parameter", title: "Parameter", type: "text" }],
        },
      };

      createQuery(queryData, false).then(({ id }) => cy.visit(`/queries/${id}/source`));

      cy.getByTestId("ParameterSettings-parameter").click();
    });

    it("changes the parameter title", () => {
      cy.getByTestId("ParameterTitleInput").type("{selectall}New Parameter Name");
      cy.getByTestId("SaveParameterSettings").click();

      cy.contains("Query saved");
      cy.reload();

      cy.getByTestId("ParameterName-parameter").contains("label", "New Parameter Name");
    });
  });
});
