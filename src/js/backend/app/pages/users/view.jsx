import React, { useEffect, useRef, useState } from "react";
import CoverPhoto from '@img/cover-photo.png';
import { useTranslation } from "@context/LanguageProvider";
import { useLoading } from "@context/LoadingProvider";
import { useParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { notify, rest_url } from "@functions";
import request from "@common/request";
import { sprintf } from "sprintf-js";

export default function UsersView() {
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { userid } = useParams();
    const [user, setUser] = useState({});
    const [activeTab, setActiveTab] = useState('edit');
    const [notifConfig, setNotifConfig] = useState(null);

    const [previewImage, setPreviewImage] = useState(null);
    const imageInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
                const formData = new FormData();
                formData.append('avatar', file, file.name);
                fetch(rest_url(`/partnership/v1/users/${userid}/avater`), {
                    method: 'POST', body: formData
                })
                .then(res => {
                    notify.success(__('Avater Uploading successed!'));
                    if (res?.avatar_url) {
                        setUser(prev => ({...prev, metadata: {...prev.metadata, avater: res.avatar_url}}));
                    }
                })
                .catch(async err => {
                    notify.error(sprintf(__('Error updating avater for #%d'), userid));
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const fetch_user = async () => {
        setLoading(true);
        request(rest_url(`/partnership/v1/users/${userid}`))
        .then(res => {
            setUser(res);
            request(rest_url(`/partnership/v1/notifications/config`))
            .then(configs => {
                Object.keys(configs).forEach(key => configs[key] = configs[key] === true);
                setNotifConfig(configs);
            });
        })
        .catch(err => console.error(`Error fetching user ${userid}:`, err))
        .finally(() => setLoading(false));
    };

    const isActiveTab = (tab) => {
        return activeTab == tab;
    }

    const handle_submit = (e) => {
        e.preventDefault();
        setLoading(true);
        request(rest_url(`/partnership/v1/users/${userid}`), {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(user)
        })
        .then(res => {
            console.log(res)
            notify.success(__('User information updated successfully!'));
        })
        .catch(async err => {
            notify.error(sprintf(__('Error updating user #%d'), userid));
        })
        .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetch_user();
    }, [userid]);

    const update_notif_config = (key, status) => {
        setNotifConfig(prev => ({...prev, [key]: status}));
        request(rest_url(`/partnership/v1/notifications/config`), {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({key, status})
        })
        .then(res => notify.success(__('Changes saved!')))
        .catch(err => notify.error(__('Error storing changes!')))
        // .finally(() => setLoading(false));
    };

    return (
        <div>
            <div className="row gy-4">
                <div className="col-lg-4">
                    <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
                        <img src={ CoverPhoto } alt={__('Cover photo')} className="w-100 object-fit-cover" />
                        <div className="xpo_relative xpo_-mt-28 xpo_p-4">
                            <div className="text-center border border-top-0 border-start-0 border-end-0">
                                
                                <div className="xpo_relative xpo_grid xpo_grid-cols-[200px_1fr] xpo_items-end xpo_mb-4">
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
                                        <div className="avatar-preview !xpo_w-52 !xpo_h-auto xpo_aspect-square">
                                            <div className="xpo_w-52 xpo_h-52 rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                {(previewImage || user.metadata?.avater) ? (
                                                    <img
                                                        alt={__('Avater')}
                                                        src={previewImage ? previewImage : user.metadata?.avater}
                                                        className=" xpo_w-52 xpo_h-52 xpo_object-fit-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-muted">{__('No image')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="xpo_relative xpo_text-left xpo_p-3 xpo_mt-12 xpo_flex xpo_flex-col xpo_gap-3">
                                        <h6>{[user.metadata?.first_name??'', user.metadata?.last_name??''].join(' ')}</h6>
                                        <span className="text-secondary-light">{user?.email??''}</span>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="mt-24">
                                <h6 className="text-xl mb-16">{__('Personal Info')}</h6>
                                <ul>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light">{__('Full Name')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {[user.metadata?.first_name??'', user.metadata?.last_name??''].join(' ')}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Email')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user?.email??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Phone Number')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user.metadata?.phone??'N/A'}</span>
                                    </li>
                                    {/* <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Department')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user.metadata?.department??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Designation')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user.metadata?.designation??'N/A'}</span>
                                    </li>
                                    <li className="d-flex align-items-center gap-1 mb-12">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Languages')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user.metadata?.partnership_dashboard_locale??'English'}</span>
                                    </li> */}
                                    <li className="d-flex align-items-center gap-1">
                                        <span className="w-30 text-md fw-semibold text-primary-light"> {__('Bio')}</span>
                                        <span className="w-70 text-secondary-light fw-medium">: {user.metadata?.description??''}</span>
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
                                    
                                    <form onSubmit={handle_submit}>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="fname" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('First Name')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control radius-8"
                                                        id="fname"
                                                        placeholder={__('Enter First Name')}
                                                        defaultValue={user.metadata?.first_name}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, first_name: event.target.value}}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="lname" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Last Name')} <span className="text-danger-600">*</span></label>
                                                    <input
                                                        type="text"
                                                        className="form-control radius-8"
                                                        id="lname"
                                                        placeholder={__('Enter Last Name')}
                                                        defaultValue={user.metadata?.last_name}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, last_name: event.target.value}}))}
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
                                                        defaultValue={user?.email}
                                                        onChange={(event) => setUser(prev => ({...prev, email: event.target.value}))}
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
                                                        defaultValue={user.metadata?.phone??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, phone: event.target.value}}))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="mb-20">
                                                    <label htmlFor="depart" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Department')} <span className="text-danger-600">*</span> </label>
                                                    <select
                                                        className="form-control radius-8 form-select"
                                                        id="depart"
                                                        defaultValue={user.metadata?.department??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, department: event.target.value}}))}
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
                                                        defaultValue={user.metadata?.designation??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, designation: event.target.value}}))}
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
                                                        defaultValue={user.metadata?.partnership_dashboard_locale}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, partnership_dashboard_locale: event.target.value}}))}
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
                                                        name="description"
                                                        className="form-control radius-8"
                                                        id="desc"
                                                        placeholder={__('Write description...')}
                                                        defaultValue={user.metadata?.description??''}
                                                        onChange={(event) => setUser(prev => ({...prev, metadata: {...user.metadata, description: event.target.value}}))}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button type="reset" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"> 
                                                {__('Cancel')}
                                            </button>
                                            <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"> 
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
                                    {notifConfig ? (
                                        <div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                                <label htmlFor="companzNew" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                                <div className="d-flex align-items-center gap-3 justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Company News')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="companzNew" checked={notifConfig?.['pm_notis-news']} onChange={(e) => update_notif_config('pm_notis-news', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                                <label htmlFor="pushNotifcation" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                                <div className="d-flex align-items-center gap-3 justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Push Notification')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="pushNotifcation" checked={notifConfig?.['pm_notis-push']} onChange={(e) => update_notif_config('pm_notis-push', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                                <label htmlFor="weeklyLetters" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                                <div className="d-flex align-items-center gap-3 justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Weekly News Letters')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="weeklyLetters" checked={notifConfig?.['pm_notis-newsletter']} onChange={(e) => update_notif_config('pm_notis-newsletter', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                                <label htmlFor="meetUp" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                                <div className="d-flex align-items-center gap-3 justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Meetups Near you')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="meetUp" checked={notifConfig?.['pm_notis-meetup']} onChange= {(e) => update_notif_config('pm_notis-meetup', e.target.checked)} />
                                                </div>
                                            </div>
                                            <div className="form-switch switch-primary py-12 px-16 border radius-8 position-relative mb-16">
                                                <label htmlFor="orderNotification" className="position-absolute w-100 h-100 start-0 top-0"></label>
                                                <div className="d-flex align-items-center gap-3 justify-content-between">
                                                    <span className="form-check-label line-height-1 fw-medium text-secondary-light">{__('Orders Notifications')}</span>
                                                    <input className="form-check-input" type="checkbox" role="switch" id="orderNotification" checked={notifConfig?.['pm_notis-order']} onChange={(e) => update_notif_config('pm_notis-order', e.target.checked)} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
