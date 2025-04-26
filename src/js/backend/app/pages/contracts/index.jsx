
import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';

export default function Contracts({ filters = 'any' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header">
                <h5 className="card-title mb-0">{filters == 'inactive' ? __('Inactive contracts') : (
                    filters == 'active' ? __('Active contracts') : __('All contracts')
                )}</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table basic-border-table mb-0">
                        <thead>
                            <tr>
                                <th>Invoice </th>
                                <th>Name</th>
                                <th>Issued Date</th>
                                <th>Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Link to={ '#' } className="text-primary-600">#526534</Link>
                                </td>
                                <td>Kathryn Murphy</td>
                                <td>25 Jan 2024</td>
                                <td>$200.00</td>
                                <td>
                                    <Link to={ '#' } className="text-primary-600">{__('View More >')} </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

