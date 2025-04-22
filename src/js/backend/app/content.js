import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { home_route } from '@components/common/functions';


// Lazy-loaded components
const Home = lazy(() => import('./home'));
const ErrorPage = lazy(() => import('./pages/error'));
const ReferralsScreen = lazy(() => import('./pages/referrals'));
const Active_Referrals = lazy(() => import('./pages/referrals/active'));
const Inactive_Referrals = lazy(() => import('./pages/referrals/inactive'));

const UsersList = lazy(() => import('./pages/users/list'));
const UsersGrid = lazy(() => import('./pages/users/grid'));
const UsersView = lazy(() => import('./pages/users/view'));
const UsersEdit = lazy(() => import('./pages/users/edit'));

const PayoutsScreen = lazy(() => import('./pages/payouts/screen'));
const Settings = lazy(() => import('./pages/settings'));

const PartnerDocs = lazy(() => import('./pages/resources/partner-docs'));
const Supports = lazy(() => import('./pages/support/supports'));

export default function Content() {
    return (
        <div className="xpo_w-full">
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <Routes>
                    <Route path={home_route('/')} element={<Home />} />
                    <Route path={home_route('/sales')} element={<Home />} />
                    <Route path={home_route('/analytics')} element={<Home />} />

                    <Route path={home_route('/users')} element={<UsersList />} />
                    <Route path={home_route('/users-grid')} element={<UsersGrid />} />
                    <Route path={home_route('/:userprofile/:userId/view')} element={<UsersView />} />
                    <Route path={home_route('/:userprofile/:userId/edit')} element={<UsersEdit />} />

                    <Route path={home_route('/resources/partner-docs')} element={<PartnerDocs />} />
                    <Route path={home_route('/resources/service-docs')} element={<PartnerDocs />} />
                    <Route path={home_route('/support/supports')} element={<Supports />} />
                    <Route path={home_route('/support/open-ticket')} element={<Supports />} />

                    <Route path={home_route('/referrals')} element={<ReferralsScreen />} />
                    <Route path={home_route('/referrals/active')} element={<Active_Referrals />} />
                    <Route path={home_route('/referrals/inactive')} element={<Inactive_Referrals />} />

                    <Route path={home_route('/payouts')} element={<PayoutsScreen />} />
                    <Route path={home_route('/settings')} element={<Settings />} />
                    <Route path={home_route('/team')} element={<UsersGrid />} />

                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </div>
    );
}
