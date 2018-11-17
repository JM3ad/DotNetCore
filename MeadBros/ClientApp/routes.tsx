import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import Deception from './components/Deception';

export const routes = <Layout>
    <Route exact path='/' component={ Home } />
    <Route path='/deception' component={ Deception } />
</Layout>;
