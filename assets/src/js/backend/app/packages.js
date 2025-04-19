import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { notify, request_headers, rest_url } from './components/common/functions';
import { X } from 'lucide-react';
import Pagination from './pagination';
import PackageDetail from './PackageDetail';

export default function Packages({ setLoading }) {
    const [packages, setPackages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const response = await axios.post(rest_url('/proadmin/v1/packages/list'), { page: currentPage }, request_headers());
                const { list, pagination } = response.data;
                setPackages(list);
                setTotalPages(pagination.totalPage);
            } catch (error) {
                notify.error(error?.message ?? 'Failed to fetch packages list.');
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handlePackageClick = (pkg) => {
        setSelectedPackage(pkg);
    };

    const closePopup = () => {
        setSelectedPackage(null);
    };

    return (
        <div className="xpo_w-full xpo_p-6 xpo_rounded-lg">
            <h1 className="xpo_text-2xl xpo_font-semibold xpo_mb-6">Packages List</h1>
            <table className="xpo_w-full xpo_table-auto xpo_border-collapse xpo_mb-6">
                <thead>
                    <tr className="xpo_bg-gray-100">
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">#id</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Title</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Price</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">Currency</th>
                        <th className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_text-left">View</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map(pkg => (
                        <tr key={pkg.id} className="xpo_cursor-pointer hover:xpo_bg-gray-100">
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{pkg.id}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{pkg.title}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">{pkg.price}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4 xpo_uppercase">{pkg.currency}</td>
                            <td className="xpo_border xpo_border-gray-300 xpo_p-4">
                                <button 
                                    className="xpo_px-4 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded hover:xpo_bg-primary-700"
                                    onClick={() => handlePackageClick(pkg)}
                                >
                                    Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
            {selectedPackage && 
                <div className="xpo_fixed xpo_inset-0 xpo_bg-gray-800 xpo_bg-opacity-50 xpo_flex xpo_justify-center xpo_items-center">
                    <div className="xpo_w-full md:xpo_max-w-3xl xpo_bg-white xpo_rounded-lg xpo_p-6 xpo_relative xpo_max-h-screen md:xpo_max-h-[90vh] xpo_overflow-y-auto">
                        <button 
                            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_text-gray-500 hover:xpo_text-gray-700"
                            onClick={closePopup}
                        >
                            <X size={16} />
                        </button>
                        <PackageDetail pkg={selectedPackage} />
                    </div>
                </div>
            }
        </div>
    );
}
