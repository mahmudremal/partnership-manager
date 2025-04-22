import React from "react";
import CoverPhoto from '@img/cover-photo.png';

export default function UsersView() {
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
                        <img src={ CoverPhoto } alt={__('Cover photo')} className="w-100 object-fit-cover" />
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
