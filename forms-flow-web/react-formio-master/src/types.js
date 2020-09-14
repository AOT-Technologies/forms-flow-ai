import PropTypes from 'prop-types';

export const AllItemsPerPage = 'all';

export const Column = PropTypes.shape({
  key: PropTypes.string.isRequired,
  sort: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
    PropTypes.func,
  ]),
  title: PropTypes.string,
  value: PropTypes.func,
  width: PropTypes.number,
});

export const Columns = PropTypes.arrayOf(Column);

export const Operation = PropTypes.shape({
  action: PropTypes.string.isRequired,
  buttonType: PropTypes.string,
  icon: PropTypes.string,
  permissionsResolver: PropTypes.func,
  title: PropTypes.string,
});

export const Operations = PropTypes.arrayOf(Operation);

export const PageSize = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
  }),
  PropTypes.oneOf([AllItemsPerPage]),
]);

export const PageSizes = PropTypes.arrayOf(PageSize);
