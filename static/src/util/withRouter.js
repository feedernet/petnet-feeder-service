import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return (
      <Component
        {...props}
        history={{
          push: navigate,
          replace: (path) => navigate(path, { replace: true }),
          goBack: () => navigate(-1),
        }}
        location={location}
        match={{ params }}
      />
    );
  }
  ComponentWithRouterProp.displayName = `withRouter(${
    Component.displayName || Component.name || "Component"
  })`;
  return ComponentWithRouterProp;
}
