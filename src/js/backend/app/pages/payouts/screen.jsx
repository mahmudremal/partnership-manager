import React, { useEffect, useState } from "react";
import Payouts from ".";
import request from "@common/request";
import { rest_url } from "@functions";
import { useLoading } from "@context/LoadingProvider";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { HandCoins, Wallet, BanknoteArrowDown, UsersRound } from "lucide-react";
import { sprintf } from "sprintf-js";

export default function PayoutsScreen({ filters = 'any' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { setLoading } = useLoading();
    
    const [balance, setBalance] = useState(0);
    const [refBalance, setRefBalance] = useState(0);
    const [withdrawable, setWithdrawable] = useState(0);
    const [paymentsToDate, setPaymentsToDate] = useState(0);

    useEffect(() => {
        setLoading(true);
        request(rest_url(`/partnership/v1/finance/account`))
        .then(account => {
            if (account?.balance) {setBalance(account.balance);}
            if (account?.withdrawable) {setWithdrawable(account.withdrawable);}
            if (account?.referral_earn) {setRefBalance(account.referral_earn);}
            if (account?.payments_to_date) {setPaymentsToDate(account.payments_to_date);}
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, []);
    // 
    return (
        <div className="xpo_flex xpo_flex-col xpo_gap-4">
            <div className="xpo_grid xpo_gap-4 xpo_grid-cols-2 md:xpo_grid-cols-4">
                <div>
                    <div className="card-body xpo_p-5 bg-base border h-100 d-flex flex-column justify-content-center border-end-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div>
                                <span className="mb-12 w-44-px h-44-px text-primary-600 bg-primary-light border border-primary-light-white flex-shrink-0 d-flex justify-content-center align-items-center radius-8 h6 mb-12">
                                    <Wallet className="icon" />
                                </span>
                                <span className="mb-1 fw-medium text-secondary-light text-md">{__('Balance')}</span>
                                <h6 className="fw-semibold text-primary-light mb-1">{balance.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+200</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border h-100 d-flex flex-column justify-content-center border-end-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div>
                                <span className="mb-12 w-44-px h-44-px text-yellow bg-yellow-light border border-yellow-light-white flex-shrink-0 d-flex justify-content-center align-items-center radius-8 h6 mb-12">
                                    <UsersRound absoluteStrokeWidth className="icon" />
                                </span>
                                <span className="mb-1 fw-medium text-secondary-light text-md">{__('Refferrals')}</span>
                                <h6 className="fw-semibold text-primary-light mb-1">{refBalance.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={false}>+$0</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border h-100 d-flex flex-column justify-content-center border-end-0">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div>
                                <span className="mb-12 w-44-px h-44-px text-lilac bg-lilac-light border border-lilac-light-white flex-shrink-0 d-flex justify-content-center align-items-center radius-8 h6 mb-12">
                                    <BanknoteArrowDown className="icon" />  
                                </span>
                                <span className="mb-1 fw-medium text-secondary-light text-md">{__('Withdrawable')}</span>
                                <h6 className="fw-semibold text-primary-light mb-1">{withdrawable.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+$1k</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border h-100 d-flex flex-column justify-content-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                            <div>
                                <span className="mb-12 w-44-px h-44-px text-pink bg-pink-light border border-pink-light-white flex-shrink-0 d-flex justify-content-center align-items-center radius-8 h6 mb-12">
                                    <HandCoins className="icon" />  
                                </span>
                                <span className="mb-1 fw-medium text-secondary-light text-md">{__('Payments to date')}</span>
                                <h6 className="fw-semibold text-primary-light mb-1">{paymentsToDate.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+$10k</Badge>
                    </div>
                </div>
            </div>
            <div className="xpo_block">
                <Payouts filters={filters} maxAmount={withdrawable} />
            </div>
        </div>
    );
}

const Badge = ({children, before = '', after = '', positive = true}) => {
    return (
        <p className="text-sm mb-0">
            {before}
            <span className={ `${positive ? 'bg-success-focus text-success-main' : 'bg-danger-focus text-danger-main'} px-1 rounded-2 fw-medium text-sm` }>{children}</span>
            {after}
        </p>
    )
}