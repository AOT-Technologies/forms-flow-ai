import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isString from 'lodash/isString';
import _map from 'lodash/map';
import PropTypes from 'prop-types';
import React from 'react';

import {defaultPageSizes} from '../constants';
import {
  Columns,
  Operations,
  PageSizes,
} from '../types';
import {stopPropagationWrapper} from '../utils';

import Grid from './Grid';

export default class FormGrid extends React.Component {
  static propTypes = {
    columns: Columns,
    formAccess: PropTypes.func,
    forms: PropTypes.object.isRequired,
    getForms: PropTypes.func,
    onAction: PropTypes.func,
    onPageSizeChanged: PropTypes.func,
    operations: Operations,
    pageSizes: PageSizes,
  }

  static defaultProps = {
    columns: [
      {
        key: 'title',
        sort: true,
        title: 'Form',
        width: 8,
      },
      {
        key: 'operations',
        title: 'Operations',
        width: 4,
      },
    ],
    formAccess: () => ({
      form: {
        create: true,
        view: true,
        edit: true,
        delete: true,
      },
      submission: {
        create: true,
        view: true,
        edit: true,
        delete: true,
      },
    }),
    getForms: () => {},
    onPageSizeChanged: () => {},
    operations: [
      {
        action: 'view',
        buttonType: 'primary',
        icon: 'pencil',
        permissionsResolver() {
          return true;
        },
        title: 'Enter Data',
      },
      {
        action: 'submission',
        buttonType: 'warning',
        icon: 'list-alt',
        permissionsResolver() {
          return true;
        },
        title: 'View Data',
      },
      {
        action: 'edit',
        buttonType: 'secondary',
        icon: 'edit',
        permissionsResolver() {
          return true;
        },
        title: 'Edit Form',
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
      forms: {
        sort: currentSort,
      },
      getForms,
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

    getForms(1, {
      sort: nextSort,
    });
  };

  Cell = ({
    row: form,
    column,
  }) => {
    const {
      formAccess,
      onAction,
      operations = [],
    } = this.props;

    const access = formAccess(form);

    if (column.key === 'title') {
      return (
        <span
          style={{cursor: 'pointer'}}
          onClick={stopPropagationWrapper(() => {
            if (access.submission.create) {
              onAction(form, 'view');
            }
          })}
        >
          <h5>{form.title}</h5>
        </span>
      );
    }
    else if (column.key === 'operations') {
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
              permissionsResolver(form)
                ? (
                  <span
                    className={`btn btn-${buttonType} btn-sm form-btn`}
                    onClick={stopPropagationWrapper(() => onAction(form, action))}
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

    return (
      <span>
        {
          _isFunction(column.value)
            ? column.value(form)
            : _get(form, column.key, '')
        }
      </span>
    );
  };

  render() {
    const {
      columns,
      forms: {
        forms,
        limit,
        pagination: {
          page,
          numPages,
          total,
        },
        sort,
      },
      getForms,
      onAction,
      onPageSizeChanged,
      pageSizes,
    } = this.props;

    const skip = (page - 1) * limit;
    const last = Math.min(skip + limit, total);

    return (
      <Grid
        Cell={this.Cell}
        activePage={page}
        columns={columns}
        emptyText="No forms found"
        firstItem={skip + 1}
        items={forms}
        lastItem={last}
        onAction={onAction}
        onPage={getForms}
        onPageSizeChanged={onPageSizeChanged}
        onSort={this.onSort}
        pageSize={limit}
        pageSizes={pageSizes}
        pages={numPages}
        sortOrder={sort}
        total={total}
      />
    );
  }
}
