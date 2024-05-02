import React from 'react';
import { useParams } from 'react-router-dom-v6';

const withRouteParams = (WrappedComponent) => {
  return (props) => {
    const params = useParams(); // Moved useParams inside the component
    const newProps = {...props,params };
    return <WrappedComponent {...newProps} />;
  };
};

export default withRouteParams;
