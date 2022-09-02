import React from "react";
import { render, screen } from "@testing-library/react";
import TaskSort from "../../../../../components/ServiceFlow/list/sort/TaskSort";
import { sortOptions } from "../sort/constants";

test("render NoData", () => {
  render(<TaskSort options={sortOptions} />);
  expect(screen.getByText("priority"));
  expect(screen.getByText("dueDate"));
  expect(screen.getByText("assignee"));
  expect(screen.getByText("name"));
  expect(screen.getByText("followUpDate"));
});
