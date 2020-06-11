import { extend, map, filter, reduce } from "lodash";
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Icon from "antd/lib/icon";
import useMedia from "use-media";
import EditInPlace from "@/components/EditInPlace";
import FavoritesControl from "@/components/FavoritesControl";
import { QueryTagsControl } from "@/components/tags-control/TagsControl";
import getTags from "@/services/getTags";
import { clientConfig } from "@/services/auth";
import useQueryFlags from "../hooks/useQueryFlags";
import useArchiveQuery from "../hooks/useArchiveQuery";
import usePublishQuery from "../hooks/usePublishQuery";
import useUnpublishQuery from "../hooks/useUnpublishQuery";
import useUpdateQueryTags from "../hooks/useUpdateQueryTags";
import useRenameQuery from "../hooks/useRenameQuery";
import useDuplicateQuery from "../hooks/useDuplicateQuery";
import useApiKeyDialog from "../hooks/useApiKeyDialog";
import usePermissionsEditorDialog from "../hooks/usePermissionsEditorDialog";

import "./QueryPageHeader.less";

function getQueryTags() {
  return getTags("api/queries/tags").then(tags => map(tags, t => t.name));
}

function createMenu(menu) {
  const handlers = {};

  const groups = map(menu, group =>
    filter(
      map(group, (props, key) => {
        props = extend({ isAvailable: true, isEnabled: true, onClick: () => {} }, props);
        if (props.isAvailable) {
          handlers[key] = props.onClick;
          return (
            <Menu.Item key={key} disabled={!props.isEnabled}>
              {props.title}
            </Menu.Item>
          );
        }
        return null;
      })
    )
  );

  return (
    <Menu onClick={({ key }) => handlers[key]()}>
      {reduce(
        filter(groups, group => group.length > 0),
        (result, items, key) => {
          const divider = result.length > 0 ? <Menu.Divider key={`divider${key}`} /> : null;
          return [...result, divider, ...items];
        },
        []
      )}
    </Menu>
  );
}

export default function QueryPageHeader({
  query,
  dataSource,
  sourceMode,
  selectedVisualization,
  headerExtra,
  tagsExtra,
  onChange,
}) {
  const isDesktop = useMedia({ minWidth: 768 });
  const queryFlags = useQueryFlags(query, dataSource);
  const updateName = useRenameQuery(query, onChange);
  const updateTags = useUpdateQueryTags(query, onChange);
  const archiveQuery = useArchiveQuery(query, onChange);
  const publishQuery = usePublishQuery(query, onChange);
  const unpublishQuery = useUnpublishQuery(query, onChange);
  const [isDuplicating, duplicateQuery] = useDuplicateQuery(query);
  const openApiKeyDialog = useApiKeyDialog(query, onChange);
  const openPermissionsEditorDialog = usePermissionsEditorDialog(query);

  const moreActionsMenu = useMemo(
    () =>
      createMenu([
        {
          fork: {
            isEnabled: !queryFlags.isNew && queryFlags.canFork && !isDuplicating,
            title: (
              <React.Fragment>
                Fork
                <i className="fa fa-external-link m-l-5" />
              </React.Fragment>
            ),
            onClick: duplicateQuery,
          },
        },
        {
          archive: {
            isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived,
            title: "Archive",
            onClick: archiveQuery,
          },
          managePermissions: {
            isAvailable:
              !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isArchived && clientConfig.showPermissionsControl,
            title: "Manage Permissions",
            onClick: openPermissionsEditorDialog,
          },
          publish: {
            isAvailable:
              !isDesktop && queryFlags.isDraft && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit,
            title: "Publish",
            onClick: publishQuery,
          },
          unpublish: {
            isAvailable: !queryFlags.isNew && queryFlags.canEdit && !queryFlags.isDraft,
            title: "Unpublish",
            onClick: unpublishQuery,
          },
        },
        {
          showAPIKey: {
            isAvailable: !queryFlags.isNew,
            title: "Show API Key",
            onClick: openApiKeyDialog,
          },
        },
      ]),
    [
      queryFlags.isNew,
      queryFlags.canFork,
      queryFlags.canEdit,
      queryFlags.isArchived,
      queryFlags.isDraft,
      isDuplicating,
      duplicateQuery,
      archiveQuery,
      openPermissionsEditorDialog,
      isDesktop,
      publishQuery,
      unpublishQuery,
      openApiKeyDialog,
    ]
  );

  return (
    <div className="query-page-header">
      <div className="title-with-tags">
        <div className="page-title">
          <div className="d-flex align-items-center">
            {!queryFlags.isNew && <FavoritesControl item={query} />}
            <h3>
              <EditInPlace isEditable={queryFlags.canEdit} onDone={updateName} ignoreBlanks value={query.name} />
            </h3>
          </div>
        </div>
        <div className="query-tags">
          <QueryTagsControl
            tags={query.tags}
            isDraft={queryFlags.isDraft}
            isArchived={queryFlags.isArchived}
            canEdit={queryFlags.canEdit}
            getAvailableTags={getQueryTags}
            onEdit={updateTags}
            tagsExtra={tagsExtra}
          />
        </div>
      </div>
      <div className="header-actions">
        {headerExtra}
        {isDesktop && queryFlags.isDraft && !queryFlags.isArchived && !queryFlags.isNew && queryFlags.canEdit && (
          <Button className="m-r-5" onClick={publishQuery}>
            <i className="fa fa-paper-plane m-r-5" /> Publish
          </Button>
        )}

        {!queryFlags.isNew && queryFlags.canViewSource && (
          <span>
            {!sourceMode && (
              <Button className="m-r-5" href={query.getUrl(true, selectedVisualization)}>
                <i className="fa fa-pencil-square-o" aria-hidden="true" />
                <span className="m-l-5">Edit Source</span>
              </Button>
            )}
            {sourceMode && (
              <Button
                className="m-r-5"
                href={query.getUrl(false, selectedVisualization)}
                data-test="QueryPageShowDataOnly">
                <i className="fa fa-table" aria-hidden="true" />
                <span className="m-l-5">Show Data Only</span>
              </Button>
            )}
          </span>
        )}

        {!queryFlags.isNew && (
          <Dropdown overlay={moreActionsMenu} trigger={["click"]}>
            <Button>
              <Icon type="ellipsis" rotate={90} />
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

QueryPageHeader.propTypes = {
  query: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dataSource: PropTypes.object,
  sourceMode: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  headerExtra: PropTypes.node,
  tagsExtra: PropTypes.node,
  onChange: PropTypes.func,
};

QueryPageHeader.defaultProps = {
  dataSource: null,
  sourceMode: false,
  selectedVisualization: null,
  headerExtra: null,
  tagsExtra: null,
  onChange: () => {},
};
