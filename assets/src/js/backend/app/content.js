import React from 'react';
import Home from './home';
import ErrorPage from './error';
import { Active_Referrals, Inactive_Referrals, Referrals } from './referrals';
import { Routes, Route } from 'react-router-dom';
import { home_route } from './components/common/functions';
import { UsersEdit, UsersGrid, UsersList, UsersView } from './users';
import { PayoutsScreen } from './payouts';
import { Settings } from './settings';
import PartnerDocs from './resources/partner-docs';
import Supports from './support/supports';

export default function Content() {
    return (
        <div className="xpo_w-full">
            <Routes>
                <Route path={home_route('/')} element={<Home />} />
                <Route path={home_route('/sales')} element={<Home />} />
                <Route path={home_route('/analytics')} element={<Home />} />
                <Route path={home_route('/users')} element={<UsersList />} />
                <Route path={home_route('/users-grid')} element={<UsersGrid />} />
                <Route path={home_route('/:userprofile/:userId/view')} element={<UsersView />} />
                <Route path={home_route('/:userprofile/:userId/edit')} element={<UsersEdit />} />
                {/* :userprofile(users|users-grid) */}

                <Route path={home_route('/resources/partner-docs')} element={<PartnerDocs />} />
                <Route path={home_route('/resources/service-docs')} element={<PartnerDocs />} />
                <Route path={home_route('/support/supports')} element={<Supports />} />
                <Route path={home_route('/support/open-ticket')} element={<Supports />} />
                
                <Route path={home_route('/referrals')} element={<Referrals />} />
                <Route path={home_route('/referrals/active')} element={<Active_Referrals />} />
                <Route path={home_route('/referrals/inactive')} element={<Inactive_Referrals />} />
                {/* <Route path={home_route('/referrals/:filters')} element={<Referrals />} /> */}
                {/* :filters(retargetting|inactive|active) */}

                <Route path={home_route('/payouts')} element={<PayoutsScreen />} />
                <Route path={home_route('/settings')} element={<Settings />} />
                <Route path={home_route('/team')} element={<UsersGrid />} />
                {/* <Route path={home_route('/settings/*')} element={<Settings />} /> */}

                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </div>
    );
}
