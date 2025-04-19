import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { notify, request_headers, rest_url } from './functions';
import { X } from 'lucide-react';
import Pagination from './pagination';
import MarkSubscription from './MarkSubscription';


export default function Subscriptions({ setLoading }) {
    const [subscriptions, setSubscriptions] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            setLoading(true);
            try {
                await axios.post(rest_url('/proadmin/v1/subscriptions/list'), { page: currentPage }, request_headers()).then(response => {
                    const { list, pagination } = response.data;
                    setSubscriptions(list);
                    setTotalPages(pagination.totalPage);
                }).catch(err => notify.error(err?.message??"Failed to load packages list!"))
                
            } catch (error) {
                // console.error('Failed to fetch subscriptions:', error);
                notify.error(error?.message??'Failed to fetch subscriptions');
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleSubscriptionClick = (subscription) => {
        setSelectedSubscription(subscription);
    };

    const closePopup = () => {
        setSelectedSubscription(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return date.toLocaleDateString('en-US', options).replace(',', '').replace(',', '');
    };

    return (
        <div className="xpo_w-full xpo_p-6 xpo_rounded-lg xpo_shadow-lg xpo_bg-white">
            <h1 className="xpo_text-2xl xpo_font-semibold xpo_mb-6">Subscription List</h1>
            <table className="xpo_w-full xpo_table-auto xpo_border-collapse xpo_mb-6">
                <thead>
                    <tr className="xpo_bg-gray-100">
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">ID</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">User</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Service</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Package</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Started At</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Ended At</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Status</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Payment</th>
                        {/* <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Payment Details</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Payment Method</th> */}
                        {/* <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Payment Amount</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Access Key</th> */}
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">View</th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map(subscription => (
                        <tr key={subscription.id} className="xpo_cursor-pointer hover:xpo_bg-gray-100">
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.id}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.user_name}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.service_title}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.package}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{formatDate(subscription.started_at)}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{formatDate(subscription.ended_at)}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.status === '1' ? 'Active' : 'Inactive'}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{
                                subscription.payment_status != '' ? subscription.payment_status : 'Pending'
                            }</td>
                            {/* <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.payment_details}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.payment_method}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.payment_amount}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{subscription.access_key}</td> */}
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">
                                <button 
                                    className="xpo_px-4 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded hover:xpo_bg-primary-700"
                                    onClick={() => handleSubscriptionClick(subscription)}
                                >
                                    Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Paginaton */}
            <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
            {/* End Paginaton */}
            {selectedSubscription && 
                <div className="xpo_fixed xpo_inset-0 xpo_bg-gray-800 xpo_bg-opacity-50 xpo_flex xpo_justify-center xpo_items-center">
                    <div className="xpo_w-full md:xpo_max-w-3xl xpo_bg-white xpo_rounded-lg xpo_p-6 xpo_relative xpo_max-h-screen md:xpo_max-h-[90vh] xpo_overflow-y-auto">
                        <button 
                            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_text-gray-500 hover:xpo_text-gray-700"
                            onClick={closePopup}
                        >
                            <X size={16} />
                        </button>
                        <SubscriptionDetail subscription={selectedSubscription} />
                    </div>
                </div>
            }
        </div>
    );
}

export const SubscriptionDetail = ({ subscription }) => {
    const [editField, setEditField] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleDoubleClick = (field, value) => {
        setEditField(field);
        setEditValue(value);
    };

    const handleChange = (e) => {
        setEditValue(e.target.value);
    };

    const handleBlur = (field) => {
        if (field !== 'id' && field !== 'user_id' && field !== 'user_name' && field !== 'service_id' && field !== 'service_title') {
            if (editValue !== subscription[field]) {
                subscription[field] = editValue;
                // Submit updated subscription object here
                axios.post(rest_url(`/proadmin/v1/subscription/${subscription.id}`), {
                    action: 'update',
                    field: editField,
                    [field]: editValue
                }, request_headers()).then(res => notify.success('Updated!')).catch(err => notify.error(err?.message??'Failed!'));
            }
        }
        setEditField(null);
        setEditValue('');
    };

    const renderField = (field, value) => {
        if (editField === field) {
            switch (field) {
                case 'status':
                    return (
                        <select 
                            value={editValue}
                            onChange={handleChange} 
                            onBlur={() => handleBlur(field)} 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            className="xpo_input"
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    );
                case 'payment_status':
                    return (
                        <select 
                            value={editValue}
                            onChange={handleChange} 
                            onBlur={() => handleBlur(field)} 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            className="xpo_input"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="due">Due</option>
                        </select>
                    );
                case 'payment_amount':
                    return (
                        <input 
                            type="number" 
                            step="any"
                            value={editValue} 
                            onChange={handleChange} 
                            onBlur={() => handleBlur(field)} 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            className="xpo_input"
                        />
                    );
                case 'started_at':
                case 'ended_at':
                    return (
                        <input 
                            type="datetime-local" 
                            value={editValue} 
                            onChange={handleChange} 
                            onBlur={() => handleBlur(field)} 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            className="xpo_input"
                        />
                    );
                default:
                    return (
                        <input 
                            type="text" 
                            value={editValue} 
                            onChange={handleChange} 
                            onBlur={() => handleBlur(field)} 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                            className="xpo_input"
                        />
                    );
            }
        }
        return (
            <span onDoubleClick={() => handleDoubleClick(field, value)}>{value || 'N/A'}</span>
        );
    };

    return (
        <div className="xpo_subscription-detail xpo_w-full xpo_p-4">
            <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-6">Subscription Detail</h2>
            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                <p><strong>ID:</strong> {subscription.id}</p>
                <p><strong>User:</strong> {subscription.user_name} #{subscription.user_id}</p>
                <p><strong>Service:</strong> {subscription.service_title} #{subscription.service_id}</p>
                <p><strong>Package:</strong> {renderField('package', subscription.package)}</p>
                <p><strong>Started At:</strong> {renderField('started_at', subscription.started_at)}</p>
                <p><strong>Ended At:</strong> {renderField('ended_at', subscription.ended_at)}</p>
                <p><strong>Status:</strong> {renderField('status', subscription.status === '1' ? 'Active' : 'Inactive')}</p>
                <p><strong>Payment Details:</strong> {renderField('payment_details', subscription.payment_details)}</p>
                <p><strong>Payment Method:</strong> {renderField('payment_method', subscription.payment_method)}</p>
                <p><strong>Payment Amount:</strong> {renderField('payment_amount', subscription.payment_amount)}</p>
                <p><strong>Payment Status:</strong> {renderField('payment_status', subscription.payment_status)}</p>
                <p><strong>Access Key:</strong> {renderField('access_key', subscription.access_key)}</p>
            </div>
            <MarkSubscription subscription={subscription} />
        </div>
    );
};


