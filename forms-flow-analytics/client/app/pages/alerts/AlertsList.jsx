import { toUpper } from "lodash";
import React from "react";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import EmptyState from "@/components/empty-state/EmptyState";
import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { StateStorage } from "@/components/items-list/classes/StateStorage";

import LoadingState from "@/components/items-list/components/LoadingState";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Alert from "@/services/alert";

export const STATE_CLASS = {
  unknown: "label-warning",
  ok: "label-success",
  triggered: "label-danger",
};

class AlertsList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  listColumns = [
    Columns.custom.sortable(
      (text, alert) => <i className={`fa fa-bell-${alert.options.muted ? "slash" : "o"} p-r-0`} />,
      {
        title: <i className="fa fa-bell p-r-0" />,
        field: "muted",
        width: "1%",
      }
    ),
    Columns.custom.sortable(
      (text, alert) => (
        <div>
          <a className="table-main-title" href={"alerts/" + alert.id}>
            {alert.name}
          </a>
        </div>
      ),
      {
        title: "Name",
        field: "name",
      }
    ),
    Columns.custom((text, item) => item.user.name, { title: "Created By" }),
    Columns.custom.sortable(
      (text, alert) => (
        <div>
          <span className={`label ${STATE_CLASS[alert.state]}`}>{toUpper(alert.state)}</span>
        </div>
      ),
      {
        title: "State",
        field: "state",
        width: "1%",
      }
    ),
    Columns.timeAgo.sortable({ title: "Last Updated At", field: "updated_at", className: "text-nowrap", width: "1%" }),
    Columns.dateTime.sortable({ title: "Created At", field: "created_at", className: "text-nowrap", width: "1%" }),
  ];

  render() {
    const { controller } = this.props;

    return (
      <div className="page-alerts-list">
        <div className="container">
          <PageHeader title={controller.params.pageTitle} />
          <div className="m-l-15 m-r-15">
            {!controller.isLoaded && <LoadingState className="" />}
            {controller.isLoaded && controller.isEmpty && (
              <EmptyState
                icon="fa fa-bell-o"
                illustration="alert"
                description="Get notified on certain events"
                helpLink="https://redash.io/help/user-guide/alerts/"
                showAlertStep
              />
            )}
            {controller.isLoaded && !controller.isEmpty && (
              <div className="table-responsive bg-white tiled">
                <ItemsTable
                  items={controller.pageItems}
                  columns={this.listColumns}
                  orderByField={controller.orderByField}
                  orderByReverse={controller.orderByReverse}
                  toggleSorting={controller.toggleSorting}
                />
                <Paginator
                  totalCount={controller.totalItemsCount}
                  itemsPerPage={controller.itemsPerPage}
                  page={controller.page}
                  onChange={page => controller.updatePagination({ page })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const AlertsListPage = itemsList(
  AlertsList,
  () =>
    new ResourceItemsSource({
      isPlainList: true,
      getRequest() {
        return {};
      },
      getResource() {
        return Alert.query.bind(Alert);
      },
    }),
  () => new StateStorage({ orderByField: "created_at", orderByReverse: true, itemsPerPage: 20 })
);

export default routeWithUserSession({
  path: "/alerts",
  title: "Alerts",
  render: pageProps => <AlertsListPage {...pageProps} currentPage="alerts" />,
});
