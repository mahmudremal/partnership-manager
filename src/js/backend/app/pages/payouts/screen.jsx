import React, { useEffect, useState } from "react";
import Payouts from ".";
import { useLoading } from "@context/LoadingProvider";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { HandCoins, Wallet, BanknoteArrowDown, UsersRound } from "lucide-react";

export default function PayoutsScreen({ filters = 'any' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { setLoading } = useLoading();
    
    const [balance, setBalance] = useState(0);
    const [refBalance, setRefBalance] = useState(0);
    const [withdrawable, setWithdrawable] = useState(0);
    const [paymentsToDate, setPaymentsToDate] = useState(2500000);

    useEffect(() => {
        try {
            setLoading(true);
            setTimeout(() => {
                // 
            }, 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
                        <p className="text-sm mb-0">Increase by  <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">+200</span> this week</p>
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
                        <p className="text-sm mb-0">Increase by  <span className="bg-danger-focus px-1 rounded-2 fw-medium text-danger-main text-sm">-5k</span> this week</p>
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
                        <p className="text-sm mb-0">Increase by  <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">+1k</span> this week</p>
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
                        <p className="text-sm mb-0">Increase by  <span className="bg-success-focus px-1 rounded-2 fw-medium text-success-main text-sm">+$10k</span> this week</p>
                    </div>
                </div>
            </div>
            <div className="xpo_block">
                <Payouts filters={filters} maxAmount={withdrawable} />
            </div>
        </div>
    );
}