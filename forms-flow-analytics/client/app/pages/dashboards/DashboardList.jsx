import React from "react";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import { DashboardTagsControl } from "@/components/tags-control/TagsControl";

import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { UrlStateStorage } from "@/components/items-list/classes/StateStorage";
import LoadingState from "@/components/items-list/components/LoadingState";
import * as Sidebar from "@/components/items-list/components/Sidebar";
import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Layout from "@/components/layouts/ContentWithSidebar";

import { Dashboard } from "@/services/dashboard";

import DashboardListEmptyState from "./components/DashboardListEmptyState";

import "./dashboard-list.css";

class DashboardList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  sidebarMenu = [
    {
      key: "all",
      href: "dashboards",
      title: "All Dashboards",
    },
    {
      key: "favorites",
      href: "dashboards/favorites",
      title: "Favorites",
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />,
    },
  ];

  listColumns = [
    Columns.favorites({ className: "p-r-0" }),
    Columns.custom.sortable(
      (text, item) => (
        <React.Fragment>
          <a className="table-main-title" href={"dashboard/" + item.slug} data-test={item.slug}>
            {item.name}
          </a>
          <DashboardTagsControl
            className="d-block"
            tags={item.tags}
            isDraft={item.is_draft}
            isArchived={item.is_archived}
          />
        </React.Fragment>
      ),
      {
        title: "Name",
        field: "name",
        width: null,
      }
    ),
    Columns.custom((text, item) => item.user.name, { title: "Created By" }),
    Columns.dateTime.sortable({
      title: "Created At",
      field: "created_at",
      className: "text-nowrap",
      width: "1%",
    }),
  ];

  render() {
    const { controller } = this.props;
    return (
      <div className="page-dashboard-list">
        <div className="container">
          <PageHeader title={controller.params.pageTitle} />
          <Layout className="m-l-15 m-r-15">
            <Layout.Sidebar className="m-b-0">
              <Sidebar.SearchInput
                placeholder="Search Dashboards..."
                value={controller.searchTerm}
                onChange={controller.updateSearch}
              />
              <Sidebar.Menu items={this.sidebarMenu} selected={controller.params.currentPage} />
              <Sidebar.Tags url="api/dashboards/tags" onChange={controller.updateSelectedTags} />
              <Sidebar.PageSizeSelect
                className="m-b-10"
                options={controller.pageSizeOptions}
                value={controller.itemsPerPage}
                onChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
              />
            </Layout.Sidebar>
            <Layout.Content>
              {controller.isLoaded ? (
                <div data-test="DashboardLayoutContent">
                  {controller.isEmpty ? (
                    <DashboardListEmptyState
                      page={controller.params.currentPage}
                      searchTerm={controller.searchTerm}
                      selectedTags={controller.selectedTags}
                    />
                  ) : (
                    <div className="bg-white tiled table-responsive">
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
              ) : (
                <LoadingState />
              )}
            </Layout.Content>
          </Layout>
        </div>
      </div>
    );
  }
}

const DashboardListPage = itemsList(
  DashboardList,
  () =>
    new ResourceItemsSource({
      getResource({ params: { currentPage } }) {
        return {
          all: Dashboard.query.bind(Dashboard),
          favorites: Dashboard.favorites.bind(Dashboard),
        }[currentPage];
      },
      getItemProcessor() {
        return item => new Dashboard(item);
      },
    }),
  () => new UrlStateStorage({ orderByField: "created_at", orderByReverse: true })
);

export default [
  routeWithUserSession({
    path: "/dashboards",
    title: "Dashboards",
    render: pageProps => <DashboardListPage {...pageProps} currentPage="all" />,
  }),
  routeWithUserSession({
    path: "/dashboards/favorites",
    title: "Favorite Dashboards",
    render: pageProps => <DashboardListPage {...pageProps} currentPage="favorites" />,
  }),
];
