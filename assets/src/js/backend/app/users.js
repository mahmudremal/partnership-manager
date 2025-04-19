
import React, { useEffect, useState, useRef } from "react";
import { Link } from './components/common/link';
import request from "./components/common/request";
import { app_url, home_url, rest_url } from "./components/common/functions";
import { usePopup } from './components/context/PopupProvider';
import { useTranslation } from './components/context/LanguageProvider';
import { Trash2, SquarePen, Eye, Plus, Search, ChevronsLeft, ChevronsRight, Camera } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { sprintf } from 'sprintf-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserCard } from "./components/element/usercard";
import { useLoading } from "./components/context/LoadingProvider";
dayjs.extend(utc);

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

export const UsersList = ({ viewType = 'list' }) => {
    const {__ } = useTranslation();
    const { setPopup } = usePopup();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('any');
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [gridView, setGridView] = useState(viewType == 'grid');

    const fetchUsers = async () => {
        setLoading(true);
        const url = rest_url(`/partnership/v1/users?page=${page}&s=${search}&status=${status}&per_page=${perPage}`);
        try {
            const res = await request(url);
            const sortedUsers = res.map(r => ({
                id: r.id,
                email: r.email,
                name: `${r.first_name} ${r.last_name}`,
                join_date: parseInt(r.meta['wp_user-settings-time'].join('')),
                department: 'N/A',
                designation: 'N/A',
                status: 'active',
                avatar: `https://randomuser.me/api/portraits/women/${r.id}.jpg`
            }))
            setUsers(sortedUsers || []);
            setTotalPages(res.total_pages || 1);
            setTotalEntries(res.total || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
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
                        defaultValue={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                        {PER_PAGE_OPTIONS.map(opt => (
                            <option key={opt} defaultValue={opt}>{opt}</option>
                        ))}
                    </select>

                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="bg-base h-40-px w-auto"
                            name="search"
                            placeholder={__('Search')}
                            defaultValue={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit"><Search className="icon" /></button>
                    </form>

                    <select
                        className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px"
                        defaultValue={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} defaultValue={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <Link to={ home_url('/users/0/edit') } className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2">
                    <Plus className="icon text-xl line-height-1" />
                    {__('Add New User')}
                </Link>
            </div>

            <div className="card-body p-24">
                <div className="table-responsive scroll-sm">
                    {loading ? (
                        <div className="text-center py-20">{__('Loading...')}</div>
                    ) : (
                        gridView ? (
                            <div className="row">
                                {users.length > 0 ? users.map((user, index) => (
                                    <div key={index} className="col-xxl-3 col-md-6 user-grid-card">
                                        <UserCard user={user} index={index} />
                                    </div>
                                )) : (
                                    <p>{__('No users found')}</p>
                                )}
                            </div>
                        ) : (
                            <table className="table bordered-table sm-table mb-0">
                                <thead>
                                    <tr>
                                        <th>{__('S.L')}</th>
                                        <th>{__('Join Date')}</th>
                                        <th>{__('Name')}</th>
                                        <th>{__('Email')}</th>
                                        <th>{__('Department')}</th>
                                        <th>{__('Designation')}</th>
                                        <th className="text-center">{__('Status')}</th>
                                        <th className="text-center">{__('Action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{(page - 1) * perPage + index + 1}</td>
                                            <td>{dayjs.unix(user.join_date).utc().format('DD MMM YYYY')}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img src={user.avatar} alt="" className="w-40-px h-40-px rounded-circle me-12" />
                                                    <span>{user.name}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.department}</td>
                                            <td>{user.designation}</td>
                                            <td className="text-center">
                                                {user.status === 'active' ? (
                                                    <span className="bg-success-focus text-success-600 border border-success-main px-24 py-4 radius-4 fw-medium text-sm">{__('Active')}</span>
                                                ) : (
                                                    <span className="bg-neutral-200 text-neutral-600 border border-neutral-400 px-24 py-4 radius-4 fw-medium text-sm">{__('Inactive')}</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center gap-10 justify-content-center">
                                                    <Link to={ home_url(`/users/${user.id}/view`) } className="bg-info-focus text-info-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center" ><Eye className="icon text-xl" /></Link>
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
                                        <tr><td colSpan="8" className="text-center">{__('No users found')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )
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
export const UsersGrid = () => {
    return (
        <UsersList viewType="grid" />
    )
}

export const UsersView = () => {
    const {__ } = useTranslation();
    const { setLoading } = useLoading();
    const { userId } = useParams();
    const [user, setUser] = useState({});
    const [activeTab, setActiveTab] = useState('edit');

    
    const fetchUsers = async () => {
        setLoading(true);
        const url = rest_url(`/partnership/v1/users/${userId}`);
        try {
            const res = await request(url);
            setUser(res);
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const isActiveTab = (tab) => {
        return activeTab == tab;
    }

    const handleInputChange = (key, event) => {
        setUser(prev => ({
            ...prev, [key]: event.target.value
        }));
    }

    useEffect(() => {
        fetchUsers();
    }, [userId]);

    return (
        <div>
            <div className="row gy-4">
                <div className="col-lg-4">
                    <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
                        <img src={ app_url('/src/img/cover-photo.png') } alt={__('Cover photo')} className="w-100 object-fit-cover" />
                        <div className="pb-24 ms-16 mb-24 me-16  mt--100">
                            <div className="text-center border border-top-0 border-start-0 border-end-0">
                                <img src={ user?.avater??'' } alt="" className="border br-white border-width-2-px w-200-px h-200-px rounded-circle object-fit-cover" />
                                <h6 className="mb-0 mt-16">{[user?.firstName??'', user?.lastName??''].join(' ')}</h6>
                                <span className="text-secondary-light mb-16">{user?.email??'N/A'}</span>
                            </div>
                            <div className="mt-24">
                                <h6 className="text-xl mb-16">{__('Personal Info')}</h6>
                                <ul>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light">{__('Full Name')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {[user?.firstName??'', user?.lastName??''].join(' ')}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Email')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.email??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Phone Number')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.phone??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Department')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.department??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Designation')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.designation??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Languages')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.locale??'English'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Bio')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.bio??''}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="card h-100">
                        <div className="card-body p-24">
                            <ul className="nav border-gradient-tab nav-pills mb-20 d-inline-flex" id="pills-tab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link d-flex align-items-center px-24 ${isActiveTab('edit') && 'active'}` }
                                        id="pills-edit-profile-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-edit-profile"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-edit-profile"
                                        aria-selected={isActiveTab('edit')}
                                        onClick={() => setActiveTab('edit')}
                                    >
                                        {__('Edit Profile')} 
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link d-flex align-items-center px-24 ${isActiveTab('password') && 'active'}` }
                                        id="pills-change-password-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-change-password"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-change-password"
                                        aria-selected={isActiveTab('password')}
                                        onClick={() => setActiveTab('password')}
                                        tabIndex="-1"
                                    >
                                        {__('Change Password')} 
                                    </button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button
                                        className={ `nav-link d-flex align-items-center px-24 ${isActiveTab('notification') && 'active'}` }
                                        id="pills-notification-tab"
                                        data-bs-toggle="pill"
                                        data-bs-target="#pills-notification"
                                        type="button"
                                        role="tab"
                                        aria-controls="pills-notification"
                                        aria-selected={isActiveTab('notification')}
                                        onClick={() => setActiveTab('notification')}
                                        tabIndex="-1"
                                    >
                                        {__('Notification Settings')}
                                    </button>
                                </li>
                            </ul>

                            <div className="tab-content" id="pills-tabContent">   
                                <div className={ `tab-pane fade ${isActiveTab('edit') && 'show active'}` } id="pills-edit-profile" role="tabpanel" aria-labelledby="pills-edit-profile-tab" tabIndex="0">
                                    <h6 className="text-md text-primary-light mb-16">{__('Profile Image')}</h6>
                                    <div className="mb-24 mt-16">
                                        <div className="avatar-upload">
                                            <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                                <input type="file" id="imageUpload" accept=".png, .jpg, .jpeg" hidden />
                                                <label htmlFor="imageUpload" className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle">
                                                    <Camera className="icon" />
                                                </label>
                                            </div>
                                            <div className="avatar-preview">
                                                <div id="imagePreview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <form action="#">
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Full Name')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control radius-8"
                                                        id="name"
                                                        placeholder={__('Enter Full Name')}
                                                        defaultValue={[user?.firstName??'', user?.lastName??''].join(' ')}
                                                        onChange={(event) => handleInputChange('firstName, lastName', event)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Email')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="email"
                                                        className="form-control radius-8"
                                                        id="email"
                                                        placeholder={__('Enter email address')}
                                                        defaultValue={user?.email??''}
                                                        onChange={(event) => handleInputChange('email', event)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="number" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Phone')}</label>
                                                    <input
                                                        type="phone"
                                                        className="form-control radius-8"
                                                        id="number"
                                                        placeholder={__('Enter phone number')}
                                                        defaultValue={user?.phone??''}
                                                        onChange={(event) => handleInputChange('phone', event)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="depart" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Department')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="depart"
                                                        defaultValue={user?.department??''}
                                                        onChange={(event) => handleInputChange('department', event)}
                                                    >
                                                        <option>Enter Event Title </option>
                                                        <option>Enter Event Title One </option>
                                                        <option>Enter Event Title Two</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="desig" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Designation')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="desig"
                                                        defaultValue={user?.designation??''}
                                                        onChange={(event) => handleInputChange('designation', event)}
                                                    >
                                                        <option>Enter Designation Title </option>
                                                        <option>Enter Designation Title One </option>
                                                        <option>Enter Designation Title Two</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="Language" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Language')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="Language"
                                                        defaultValue={user?.locale??''}
                                                        onChange={(event) => handleInputChange('', event)}
                                                    >
                                                        <option value="en"> English</option>
                                                        <option value="bn"> Bangla </option>
                                                        <option value="hi"> Hindi</option>
                                                        <option value="ar"> Arabic</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="mb-20">
                                                    <label htmlFor="desc" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Description')}</label>
                                                    <textarea
                                                        name="#0"
                                                        className="form-control radius-8"
                                                        id="desc"
                                                        placeholder={__('Write description...')}
                                                        defaultValue={user?.bio??''}
                                                        onChange={(event) => handleInputChange('bio', event)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"> 
                                                {__('Cancel')}
                                            </button>
                                            <button type="button" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"> 
                                                {__('Save')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className={ `tab-pane fade ${isActiveTab('password') && 'show active'}` } id="pills-change-password" role="tabpanel" aria-labelledby="pills-change-password-tab" tabIndex="0">
                                    <div className="mb-20">
                                        <label htmlFor="your-password" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('New Password')} <span className="text-danger-600">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control radius-8" id="your-password" placeholder={__('Enter New Password*')} />
                                            <span className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light" data-toggle="#your-password"></span>
                                        </div>
                                    </div>
                                    <div className="mb-20">
                                        <label htmlFor="confirm-password" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Confirmed Password')} <span className="text-danger-600">*</span></label>
                                        <div className="position-relative">
                                            <input type="password" className="form-control radius-8" id="confirm-password" placeholder={__('Confirm Password*')} />
                                            <span className="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light" data-toggle="#confirm-password"></span>
                                        </div>
                                    </div>
                                </div>

                                <div className={ `tab-pane fade ${isActiveTab('notification') && 'show active'}` } id="pills-notification" role="tabpanel" aria-labelledby="pills-notification-tab" tabIndex="0">
                                    <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                        <label htmlFor="companzNew" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                        <div className="d-flex align-items-center gap-3 justify-content-between">
                                            <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Company News')}</span>
                                            <input className="form-check-input" type="checkbox" role="switch" id="companzNew" />
                                        </div>
                                    </div>
                                    <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                        <label htmlFor="pushNotifcation" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                        <div className="d-flex align-items-center gap-3 justify-content-between">
                                            <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Push Notification')}</span>
                                            <input className="form-check-input" type="checkbox" role="switch" id="pushNotifcation" defaultChecked />
                                        </div>
                                    </div>
                                    <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                        <label htmlFor="weeklyLetters" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                        <div className="d-flex align-items-center gap-3 justify-content-between">
                                            <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Weekly News Letters')}</span>
                                            <input className="form-check-input" type="checkbox" role="switch" id="weeklyLetters" defaultChecked />
                                        </div>
                                    </div>
                                    <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                        <label htmlFor="meetUp" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                        <div className="d-flex align-items-center gap-3 justify-content-between">
                                            <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Meetups Near you')}</span>
                                            <input className="form-check-input" type="checkbox" role="switch" id="meetUp" />
                                        </div>
                                    </div>
                                    <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                        <label htmlFor="orderNotification" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                        <div className="d-flex align-items-center gap-3 justify-content-between">
                                            <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Orders Notifications')}</span>
                                            <input className="form-check-input" type="checkbox" role="switch" id="orderNotification" defaultChecked />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const UsersEdit = ({ viewType = 'list' }) => {
    const { userId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        description: '',
    });

    const [previewImage, setPreviewImage] = useState(null);
    const imageInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        // Reset form or redirect
        console.log('Cancelled');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted data:', formData);
        // Add submit logic here
    };

    return (
        <div>
            <div className="card h-100 p-0 radius-12">
                <div className="card-body p-24">
                    <div className="row justify-content-center">
                        <div className="col-xxl-6 col-xl-8 col-lg-10">
                            <div className="card border">
                                <div className="card-body">
                                    <h6 className="text-md text-primary-light mb-16">Profile Image</h6>
                                    <div className="mb-24 mt-16">
                                        <div className="avatar-upload position-relative">
                                            <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    id="imageUpload"
                                                    accept=".png, .jpg, .jpeg"
                                                    hidden
                                                    ref={imageInputRef}
                                                    onChange={handleImageChange}
                                                />
                                                <label
                                                    htmlFor="imageUpload"
                                                    className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                                                >
                                                    <Camera className="icon" />
                                                </label>
                                            </div>
                                            <div className="avatar-preview">
                                                <div id="imagePreview" className="w-100-px h-100-px rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                    {previewImage ? (
                                                        <img src={previewImage} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <span className="text-sm text-muted">No image</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-20">
                                            <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Full Name <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="name"
                                                placeholder="Enter Full Name"
                                                defaultValue={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Email <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control radius-8"
                                                id="email"
                                                placeholder="Enter email address"
                                                defaultValue={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="phone"
                                                placeholder="Enter phone number"
                                                defaultValue={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="department" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Department <span className="text-danger-600">*</span>
                                            </label>
                                            <select
                                                id="department"
                                                className="form-control radius-8 form-select"
                                                defaultValue={formData.department}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Department</option>
                                                <option value="HR">HR</option>
                                                <option value="Design">Design</option>
                                                <option value="Engineering">Engineering</option>
                                            </select>
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="designation" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Designation <span className="text-danger-600">*</span>
                                            </label>
                                            <select
                                                id="designation"
                                                className="form-control radius-8 form-select"
                                                defaultValue={formData.designation}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Designation</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Designer">Designer</option>
                                                <option value="Developer">Developer</option>
                                            </select>
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="description" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                className="form-control radius-8"
                                                placeholder="Write description..."
                                                defaultValue={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
