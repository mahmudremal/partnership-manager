
import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Trash2, SquarePen, Eye, Plus, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { sprintf } from 'sprintf-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useSettings } from "@context/SettingsProvider";
dayjs.extend(utc);

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

export default function Payouts({ maxAmount = 0, viewType = 'list' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { settings } = useSettings();
    
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [status, setStatus] = useState('any');
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [userId, setUserId] = useState(settings?.user_id);

    const fetchUsers = async () => {
        setLoading(true);
        const url = rest_url(`/partnership/v1/finance/transactions?user_id=${userId}&page=${page}&s=${search}&status=${status}&per_page=${perPage}`);
        try {
            const res = await request(url);
            setTransactions(res?.list??[]);
            setTotalPages(res.total_pages || 1);
            setTotalEntries(res.total || 0);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, perPage, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center flex-wrap gap-3">
                    <span className="text-md fw-medium text-secondary-light mb-0">{__('Show')}</span>
                    <select
                        className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                        {PER_PAGE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="bg-base h-40-px w-auto"
                            name="search"
                            placeholder={__('Search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit"><Search className="icon" /></button>
                    </form>

                    <select
                        className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    onClick={() => setPopup(<PayoutRequestForm maxAmount={maxAmount} />)}
                >
                    <Plus className="icon text-xl line-height-1" />
                    {__('Request a Payout')}
                </button>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    {loading ? (
                        <div className="text-center py-20">{__('Loading...')}</div>
                    ) : (
                        <table className="table bordered-table sm-table mb-0">
                            <thead>
                                <tr>
                                    <th>{__('S.L')}</th>
                                    <th>{__('Transection Date')}</th>
                                    <th>{__('Amount')}</th>
                                    <th>{__('Type')}</th>
                                    <th>{__('Reference')}</th>
                                    <th className="text-center">{__('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? transactions.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{(page - 1) * perPage + index + 1}</td>
                                        <td>{dayjs.unix(item.created_at).utc().format('DD MMM YYYY')}</td>
                                        <td>{item.amount}</td>
                                        <td>{item.type}</td>
                                        <td>{item.reference}</td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center gap-10 justify-content-center">
                                                <Link to={ home_url(`/transactions/${item.id}/view`) } className="bg-info-focus text-info-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center" ><Eye className="icon text-xl" /></Link>
                                                <button
                                                    className="bg-success-focus text-success-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<div>Hello from popup!</div>)}
                                                ><SquarePen className="icon" /></button>
                                                <button
                                                    className="bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<div>Hello from popup!</div>)}
                                                ><Trash2 className="icon" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="8" className="text-center">{__('No payment history found')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                    <span>{sprintf(
                        __('Showing %d to %d of %d entries'),
                        (page - 1) * perPage + 1,
                        Math.min(page * perPage, totalEntries),
                        totalEntries
                    )}</span>
                    <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                        <li className="page-item">
                            <button onClick={() => handlePageChange(page - 1)} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className="page-item">
                                <button
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`page-link ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button onClick={() => handlePageChange(page + 1)} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function PayoutRequestForm({ maxAmount }) {
    const { __ } = useTranslation();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [note, setNote] = useState('');

    return (
        <div className="xpo_p-6 xpo_space-y-6 xpo_mx-auto">
            <h2 className="xpo_font-semibold">{__('Request a Payout')}</h2>

            <div className="xpo_space-y-1">
                <label className="xpo_block xpo_text-sm xpo_font-medium">
                    {__('Amount')} {maxAmount ? <span className="xpo_text-xs">({__('Max')}: {maxAmount})</span> : null}
                </label>
                <input
                    type="number"
                    className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-primary-500"
                    placeholder={__('Enter amount')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={maxAmount}
                />
            </div>

            <div className="xpo_space-y-1">
                <label className="xpo_block xpo_text-sm xpo_font-medium">{__('Payout Method')}</label>
                <select
                    className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-primary-500"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="">{__('Select method')}</option>
                    <option value="bank">{__('Bank Transfer')}</option>
                    <option value="paypal">{__('PayPal')}</option>
                    <option value="crypto">{__('Crypto')}</option>
                </select>
            </div>

            <div className="xpo_space-y-1">
                <label className="xpo_block xpo_text-sm xpo_font-medium">{__('Note')}</label>
                <textarea
                    className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-primary-500"
                    rows="3"
                    placeholder={__('Optional message')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <div className="xpo_flex xpo_justify-end xpo_gap-2">
                <button className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_rounded-lg xpo_border xpo_border-gray-300 hover:xpo_bg-gray-50">
                    {__('Cancel')}
                </button>
                <button className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_rounded-lg xpo_bg-primary-600 hover:xpo_bg-primary-700">
                    {__('Submit Request')}
                </button>
            </div>
        </div>
    );
}

