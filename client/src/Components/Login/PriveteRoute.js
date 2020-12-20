import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import useAuth from "../../Hooks/useAuth";

const PrivateRoute = ({ component: Component, ...rest }) => {

    const {isLoggedIn} = useAuth();

    return (
        <Route
            {...rest}
            render={props =>
                isLoggedIn ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    )
}

export default PrivateRoute