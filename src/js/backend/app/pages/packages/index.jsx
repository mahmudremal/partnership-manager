import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Check } from "lucide-react";
import { useCurrency } from "@context/CurrencyProvider";

export default function Packages({ viewType = 'list' }) {
    const { print_money } = useCurrency();
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { setPopup } = usePopup();
    
    const [plans, setPlans] = useState([]);
    const [plan, setPlan] = useState(null);
    const [packages, setPackages] = useState([]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await request(rest_url(`/partnership/v1/contracts/packages`));
            setPackages(res);
            const sorted_plans = [...new Set(res.flatMap(item => Object.keys(item.pricing)))];
            setPlans(sorted_plans);
            setPlan(sorted_plans[0]);
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    return (
        <div className="card h-100 p-0 radius-12 overflow-hidden">
            <div className="card-header border-bottom bg-base py-16 px-24 xpo_flex xpo_justify-between xpo_gap-5">
                <div>
                    <h6 className="mb-0 text-lg">{__('Pricing Plan')}</h6>
                </div>
                <div>
                    <ul className="nav nav-pills button-tab pricing-tab justify-content-center xpo_m-0">
                        {plans.map((p, index) => 
                        <li className="nav-item" key={index}>
                            <button
                                onClick={() => setPlan(p)}
                                className={ `nav-link text-md rounded-pill text-secondary-light fw-medium ${plan == p && 'active'}` }
                            >
                                {__(p)}
                            </button>
                        </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="card-body xpo_px-4 xpo_py-2">
                <div className="justify-content-center">
                    <div className="xpo_w-full">
                        <div className="xpo_grid xpo_gap-4 xpo_grid-cols-3">
                            {packages.map((pack, index) => 
                                <div className="pricing-plan-wrapper" key={index}>
                                    {/* scale-item */}
                                    <div className="pricing-plan position-relative radius-24 overflow-hidden border bg-lilac-100">
                                        <div className="d-flex align-items-center gap-16">
                                            <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-base">
                                                <img src={ 'https://wowdash.wowtheme7.com/bundlelive/demo/assets/images/pricing/price-icon1.png' } alt="" />
                                            </span>
                                            <div className="">
                                                <span className="fw-medium text-md text-secondary-light">{__(pack?.packagefor??'For individuals')}</span>
                                                <h6 className="mb-0">{__(pack?.name??'BASIC')}</h6>
                                            </div>
                                        </div>
                                        <p className="mt-16 mb-0 text-secondary-light mb-28">{__(pack?.shortdesc??'')}</p>
                                        {pack?.pricing?.[plan] && <h3 className="mb-24">{print_money(pack?.pricing?.[plan]??0)} <span className="fw-medium text-md text-secondary-light xpo_lowercase">/{plan}</span></h3>}
                                        <span className="mb-20 fw-medium">{__(pack?.list_title??'What’s included')}</span>
                                        <ul>
                                            {pack.list.map((itemTitle, itemIndex) => 
                                                <li className="d-flex align-items-center gap-16 mb-16" key={itemIndex}>
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-lilac-600 rounded-circle">
                                                        <Check className="text-white text-lg" />
                                                    </span>
                                                    <span className="text-secondary-light text-lg">{itemTitle}</span>
                                                </li>
                                            )}
                                        </ul>
                                        <Link
                                            to={ home_url( `/packages/${pack?.id}/${plan}/checkout` ) }
                                            className="bg-lilac-600 bg-hover-lilac-700 text-white text-center border border-lilac-600 text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28"
                                        >Get started</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
