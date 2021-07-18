import React from 'react';
import './App.scss';
import { Home, Login, Register } from './pages/index';
import { Container } from 'react-bootstrap';
import ApolloProvider from './ApolloProvider';
import { BrowserRouter, Switch } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import { MessageProvider } from './context/message';
import DynamicRoute from './util/DynamicRoute';

function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>

          <BrowserRouter>
            <Container className='pt-5'>
              <Switch>
                <DynamicRoute path='/register' component={Register} guest />
                <DynamicRoute path='/login' component={Login} guest />
                <DynamicRoute path='/' component={Home} authenticated />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
