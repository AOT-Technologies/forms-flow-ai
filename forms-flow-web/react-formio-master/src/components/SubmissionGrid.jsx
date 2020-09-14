import FormioUtils from 'formiojs/utils';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isObject from 'lodash/isObject';
import _isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';

import {defaultPageSizes} from '../constants';
import {
  Columns,
  Operations,
  PageSizes,
} from '../types';
import {
  getComponentDefaultColumn,
  setColumnsWidth,
  stopPropagationWrapper,
} from '../utils';

import Grid from './Grid';

export default class SubmissionGrid extends React.Component {
  static propTypes = {
    columns: Columns,
    form: PropTypes.object.isRequired,
    getSubmissions: PropTypes.func,
    onAction: PropTypes.func,
    onPageSizeChanged: PropTypes.func,
    operations: Operations,
    pageSizes: PageSizes,
    submissions: PropTypes.object.isRequired,
  };

  static defaultProps = {
    columns: [],
    getSubmissions: () => {},
    onAction: () => {},
    onPageSizeChanged: () => {},
    operations: [
      {
        action: 'view',
        buttonType: 'warning',
        icon: 'list-alt',
        permissionsResolver() {
          return true;
        },
        title: 'View',
      },
      {
        action: 'edit',
        buttonType: 'secondary',
        icon: 'edit',
        permissionsResolver() {
          return true;
        },
        title: 'Edit',
      },
      {
        action: 'delete',
        buttonType: 'danger',
        icon: 'trash',
        permissionsResolver() {
          return true;
        },
      },
    ],
    pageSizes: defaultPageSizes,
  };

  onSort = ({
    key,
    sort,
  }) => {
    if (_isFunction(sort)) {
      return sort();
    }

    const {
      getSubmissions,
      submissions: {
        sort: currentSort,
      },
    } = this.props;

    const sortKey = _isString(sort) ? sort : key;
    const ascSort = sortKey;
    const descSort = `-${sortKey}`;
    const noSort = '';

    let nextSort = noSort;
    if (currentSort === ascSort) {
      nextSort = descSort;
    }
    else if (currentSort === descSort) {
      nextSort = noSort;
    }
    else {
      nextSort = ascSort;
    }

    getSubmissions(1, {
      sort: nextSort,
    });
  };

  getColumns = (form) => {
    const columns = [];

    FormioUtils.eachComponent(form.components, (component) => {
      if (component.input && component.tableView && component.key) {
        columns.push(getComponentDefaultColumn(component));
      }
    });

    columns.push({
      key: 'operations',
      title: 'Operations',
    });

    setColumnsWidth(columns);

    return columns;
  };

  Cell = ({
    row: submission,
    column,
  }) => {
    const {
      form,
      onAction,
      operations,
    } = this.props;

    if (column.key === 'operations') {
      return (
        <div>
          {
            operations.map(({
              action,
              buttonType = 'primary',
              icon = '',
              permissionsResolver = () => true,
              title = '',
            }) =>
              permissionsResolver(form, submission)
                ? (
                  <span
                    className={`btn btn-${buttonType} btn-sm form-btn`}
                    onClick={stopPropagationWrapper(() => onAction(submission, action))}
                    key={action}
                  >
                    {
                      icon
                        ? (
                          <span>
                            <i className={`fa fa-${icon}`} />&nbsp;
                          </span>
                        )
                        : null
                    }
                    {title}
                  </span>
                )
                : null
            )
          }
        </div>
      );
    }

    const value = _isFunction(column.value)
      ? column.value(submission)
      : _get(submission, column.key, '');

    return (_isObject(value) && value.content)
      ? value.isHtml
        ? <div dangerouslySetInnerHTML={{__html: value.content}} />
        : <span>{String(value.content)}</span>
      : <span>{String(value)}</span>;
  };

  render = () => {
    const {
      columns: propColumns,
      form,
      getSubmissions,
      onAction,
      onPageSizeChanged,
      pageSizes,
      submissions: {
        limit,
        pagination: {
          page,
          numPages,
          total,
        },
        sort,
        submissions,
      },
    } = this.props;

    const columns = propColumns.length ? propColumns : this.getColumns(form);
    const skip = (page - 1) * limit;
    const last = Math.min(skip + limit, total);

    return (
      <Grid
        Cell={this.Cell}
        activePage={page}
        columns={columns}
        emptyText="No data found"
        firstItem={skip + 1}
        items={submissions}
        lastItem={last}
        onAction={onAction}
        onPage={getSubmissions}
        onPageSizeChanged={onPageSizeChanged}
        onSort={this.onSort}
        pageSize={limit}
        pageSizes={pageSizes}
        pages={numPages}
        sortOrder={sort}
        total={total}
      />
    );
  };
}
