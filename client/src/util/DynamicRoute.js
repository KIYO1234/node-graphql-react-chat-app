import React from 'react';
import { useAuthState } from '../context/auth';
import { Route, Redirect } from 'react-router-dom';

const DynamicRoute = (props) => {
    const { user } = useAuthState()
    if (props.authenticated && !user) {
        return <Redirect to='/login' />
    } else if (props.guest && user) {
        return <Redirect to='/' />
    } else {
        return <Route component={props.component} {...props} />
    }
}

export default DynamicRoute
