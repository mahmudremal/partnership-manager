import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { home_route } from '@functions';

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
const PartnerDocsCategory = lazy(() => import('./pages/resources/partner-docs-category'));
const PartnerDocsSingle = lazy(() => import('./pages/resources/partner-docs-single'));

const ServiceDocs = lazy(() => import('./pages/resources/service-docs'));
const ServiceDocsCategory = lazy(() => import('./pages/resources/service-docs-category'));
const ServiceDocsSingle = lazy(() => import('./pages/resources/service-docs-single'));

const Supports = lazy(() => import('./pages/support/supports'));
const OpenTicket = lazy(() => import('./pages/support/open-ticket'));

const Contracts_Actives = lazy(() => import('./pages/contracts/active'));
const Contracts_Inactives = lazy(() => import('./pages/contracts/inactive'));
const Contract_Board = lazy(() => import('./pages/contracts/board'));

const Packages = lazy(() => import('./pages/packages'));
const Checkout = lazy(() => import('./pages/packages/checkout'));

const Invoices = lazy(() => import('./pages/invoices'));
const InvoiceEdit = lazy(() => import('./pages/invoices/edit'));
const InvoiceCheckout = lazy(() => import('./pages/invoices/checkout'));

const Stores = lazy(() => import('./pages/stores'));


export default function Content() {
    return (
        <div className="xpo_w-full">
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <Routes>
                    <Route path={home_route('/')} element={<Home />} />
                    <Route path={home_route('/insights')} element={<Home />} />
                    <Route path={home_route('/sales')} element={<Home />} />
                    <Route path={home_route('/analytics')} element={<Home />} />

                    <Route path={home_route('/users')} element={<UsersList />} />
                    <Route path={home_route('/users/:userid/view')} element={<UsersView />} />
                    <Route path={home_route('/users/:userid/edit')} element={<UsersEdit />} />

                    <Route path={home_route('/stores')} element={<Stores />} />

                    <Route path={home_route('/resources/partner-docs')} element={<PartnerDocs/>} />
                    <Route path={home_route('/resources/partner-docs/:category_slug')} element={<PartnerDocsCategory/>} />
                    <Route path={home_route('/resources/partner-docs/:category_slug/:doc_slug')} element={<PartnerDocsSingle/>} />
                    
                    <Route path={home_route('/resources/service-docs')} element={<ServiceDocs />} handle={{ breadcrumb: 'Service Documentations' }} />
                    <Route path={home_route('/resources/service-docs/:category_slug')} element={<ServiceDocsCategory />} />
                    <Route path={home_route('/resources/service-docs/:category_slug/:doc_slug')} element={<ServiceDocsSingle />} />

                    <Route path={home_route('/support/supports')} element={<Supports />} />
                    <Route path={home_route('/support/open-ticket')} element={<OpenTicket />} />

                    <Route path={home_route('/referrals')} element={<ReferralsScreen />} />
                    <Route path={home_route('/referrals/active')} element={<Active_Referrals />} />
                    <Route path={home_route('/referrals/inactive')} element={<Inactive_Referrals />} />
                    
                    <Route path={home_route('/packages')} element={<Packages />} />
                    <Route path={home_route('/packages/:package_id/:pricing_plan/checkout')} element={<Checkout />} />
                    
                    <Route path={home_route('/contracts/active')} element={<Contracts_Actives />} />
                    <Route path={home_route('/contracts/archive')} element={<Contracts_Inactives />} />
                    <Route path={home_route('/contracts/:contract_id/board')} element={<Contract_Board />} />

                    <Route path={home_route('/payouts')} element={<PayoutsScreen />} />
                    <Route path={home_route('/settings')} element={<Settings />} />
                    <Route path={home_route('/team')} element={<UsersGrid />} />


                    <Route path={home_route('/invoices')} element={<Invoices />} />
                    <Route path={home_route('/invoices/:invoice_id/view')} element={<InvoiceEdit />} />
                    <Route path={home_route('/invoices/:invoice_id/checkout')} element={<InvoiceCheckout />} />

                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Suspense>
        </div>
    );
}
