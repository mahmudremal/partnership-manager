import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';

export default function Packages({ viewType = 'list' }) {
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { setPopup } = usePopup();
    
    const [packages, setPackages] = useState([]);

    const fetchPackages = async () => {
        setLoading(true);
        const url = rest_url(`/partnership/v1/contracts/packages`);
        try {
            const res = await request(url);
            const data = res?.data;
            setPackages(data);
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
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="mb-0 text-lg">{__('Pricing Plan')}</h6>
            </div>
            <div className="card-body p-40">
                <div className="row justify-content-center">
                    <div className="col-xxl-10">
                        {/* <div className="text-center">   
                            <h4 className="mb-16">Pricing Plan</h4>
                            <p className="mb-0 text-lg text-secondary-light">{__('No contracts. No surprise fees.')}</p>
                        </div> */}
                        <ul className="nav nav-pills button-tab mt-32 pricing-tab justify-content-center" id="pills-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link px-24 py-10 text-md rounded-pill text-secondary-light fw-medium active">
                                    {__('Monthly')}
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link px-24 py-10 text-md rounded-pill text-secondary-light fw-medium">
                                    {__('Yearly')}
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content" id="pills-tabContent">
                            <div className="tab-pane fade show active" role="tabpanel">
                                <div className="xpo_grid xpo_gap-4 xpo_grid-cols-3">
                                    <div className="pricing-plan-wrapper">
                                        <div className="pricing-plan position-relative radius-24 overflow-hidden border bg-lilac-100">
                                            <div className="d-flex align-items-center gap-16">
                                                <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-base">
                                                    <img src={ 'https://wowdash.wowtheme7.com/bundlelive/demo/assets/images/pricing/price-icon1.png' } alt="" />
                                                </span>
                                                <div className="">
                                                    <span className="fw-medium text-md text-secondary-light">For individuals</span>
                                                    <h6 className="mb-0">Basic</h6>
                                                </div>
                                            </div>
                                            <p className="mt-16 mb-0 text-secondary-light mb-28">Lorem ipsum dolor sit amet doloroli sitiol conse ctetur adipiscing elit. </p>
                                            <h3 className="mb-24">$99 <span className="fw-medium text-md text-secondary-light">/monthly</span> </h3>
                                            <span className="mb-20 fw-medium">What’s included</span>
                                            <ul>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-lilac-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">All analytics features</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-lilac-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Up to 250,000 tracked visits</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-lilac-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Normal support</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-lilac-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Up to 3 team members</span>
                                                </li>
                                            </ul>
                                            <button
                                                type="button"
                                                onClick={() => setPopup(<></>)}
                                                className="bg-lilac-600 bg-hover-lilac-700 text-white text-center border border-lilac-600 text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28"
                                            >Get started</button>
                                        </div>
                                    </div>
                                    <div className="pricing-plan-wrapper">
                                        <div className="pricing-plan scale-item position-relative radius-24 overflow-hidden border bg-primary-600 text-white">
                                            <span className="bg-white bg-opacity-25 text-white radius-24 py-8 px-24 text-sm position-absolute end-0 top-0 z-1 rounded-start-top-0 rounded-end-bottom-0">Popular</span>
                                            <div className="d-flex align-items-center gap-16">
                                                <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-base">
                                                    <img src={ 'https://wowdash.wowtheme7.com/bundlelive/demo/assets/images/pricing/price-icon2.png' } alt="" />
                                                </span>
                                                <div className="">
                                                    <span className="fw-medium text-md text-white">For startups</span>
                                                    <h6 className="mb-0 text-white">Pro</h6>
                                                </div>
                                            </div>
                                            <p className="mt-16 mb-0 text-white mb-28">Lorem ipsum dolor sit amet doloroli sitiol conse ctetur adipiscing elit. </p>
                                            <h3 className="mb-24 text-white">$199 <span className="fw-medium text-md text-white">/monthly</span> </h3>
                                            <span className="mb-20 fw-medium">What’s included</span>
                                            <ul>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-white rounded-circle text-primary-600"><iconify-icon icon="iconamoon:check-light" className="text-lg   "></iconify-icon></span>
                                                    <span className="text-white text-lg">All analytics features</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-white rounded-circle text-primary-600"><iconify-icon icon="iconamoon:check-light" className="text-lg   "></iconify-icon></span>
                                                    <span className="text-white text-lg">Up to 250,000 tracked visits</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-white rounded-circle text-primary-600"><iconify-icon icon="iconamoon:check-light" className="text-lg   "></iconify-icon></span>
                                                    <span className="text-white text-lg">Normal support</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-white rounded-circle text-primary-600"><iconify-icon icon="iconamoon:check-light" className="text-lg   "></iconify-icon></span>
                                                    <span className="text-white text-lg">Up to 3 team members</span>
                                                </li>
                                            </ul>
                                            <button type="button" className="bg-white text-primary-600 text-white text-center border border-white text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28" data-bs-toggle="modal" data-bs-target="#exampleModal">Get started</button>
                                            
                                        </div>
                                    </div>
                                    <div className="pricing-plan-wrapper">
                                        <div className="pricing-plan position-relative radius-24 overflow-hidden border bg-success-100">
                                            <div className="d-flex align-items-center gap-16">
                                                <span className="w-72-px h-72-px d-flex justify-content-center align-items-center radius-16 bg-base">
                                                    <img src={ 'https://wowdash.wowtheme7.com/bundlelive/demo/assets/images/pricing/price-icon3.png' } alt="" />
                                                </span>
                                                <div className="">
                                                    <span className="fw-medium text-md text-secondary-light">For big companies</span>
                                                    <h6 className="mb-0">Enterprise</h6>
                                                </div>
                                            </div>
                                            <p className="mt-16 mb-0 text-secondary-light mb-28">Lorem ipsum dolor sit amet doloroli sitiol conse ctetur adipiscing elit. </p>
                                            <h3 className="mb-24">$399 <span className="fw-medium text-md text-secondary-light">/monthly</span> </h3>
                                            <span className="mb-20 fw-medium">What’s included</span>
                                            <ul>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-success-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg   "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">All analytics features</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-success-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg   "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Up to 250,000 tracked visits</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16 mb-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-success-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg   "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Normal support</span>
                                                </li>
                                                <li className="d-flex align-items-center gap-16">
                                                    <span className="w-24-px h-24-px d-flex justify-content-center align-items-center bg-success-600 rounded-circle"><iconify-icon icon="iconamoon:check-light" className="text-white text-lg   "></iconify-icon></span>
                                                    <span className="text-secondary-light text-lg">Up to 3 team members</span>
                                                </li>
                                            </ul>
                                            <button type="button" className="bg-success-600 bg-hover-success-700 text-white text-center border border-success-600 text-sm btn-sm px-12 py-10 w-100 radius-8 mt-28" data-bs-toggle="modal" data-bs-target="#exampleModal">Get started</button>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
