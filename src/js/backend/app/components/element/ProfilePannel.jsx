import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@common/link';
import { useAuth } from "@context/AuthProvider";
import { useSession } from "@context/SessionProvider";
import { useTranslation } from "@context/LanguageProvider";
import { createPopper } from '@popperjs/core';
import { Cross, MailCheck, Power, Settings, User } from 'lucide-react';
import { get_user_role, home_url } from '@functions';

export default function ProfilePannel() {
    const { logout } = useAuth();
    const { session } = useSession();
    const { __ } = useTranslation();
    const [menuOpened, setMenuOpened] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setMenuOpened(prev => !prev);
    };
    
    useEffect(() => {
        if (menuOpened && buttonRef.current && dropdownRef.current) {
        createPopper(buttonRef.current, dropdownRef.current, {
            placement: 'bottom-end',
            modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
            ],
        });
        }
    }, [menuOpened]);

    const user = session?.user;

    return (
        <div className="dropdown">
            <button
                className={`d-flex justify-content-center align-items-center rounded-circle ${menuOpened ? 'show' : ''}`}
                type="button"
                data-bs-toggle="dropdown"
                ref={buttonRef}
                onClick={toggleDropdown}
                aria-expanded={menuOpened ? 'true' : 'false'}
            >
                <img src={ user?.avater??'' } alt="image" className="w-40-px h-40-px object-fit-cover rounded-circle" />
            </button>
            <div
                ref={dropdownRef}
                className={`dropdown-menu to-top dropdown-menu-sm xpo_z-10 ${menuOpened ? 'show d-block' : ''}`}
            >
                <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                    <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">{[user?.firstName??'', user?.lastName??''].join(' ')}</h6>
                        <span className="text-secondary-light fw-medium text-sm">{__(get_user_role(user))}</span>
                    </div>
                    <button type="button" className="hover-text-danger">
                        <Cross className="icon text-xl" />
                    </button>
                </div>
                <ul className="to-top-list">
                    <li>
                        <Link to={ home_url(`/users/${user?.id??''}/view`) } className="dropdown-item text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary d-flex align-items-center gap-3"> 
                        <User className="icon text-xl" />  {__('My Profile')}</Link>
                    </li>
                    <li>
                        <Link to={ home_url('/notifications') } className="dropdown-item text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary d-flex align-items-center gap-3"> 
                        <MailCheck className="icon text-xl" />  {__('Notifications')}</Link>
                    </li>
                    <li>
                        <Link to={ home_url('/settings') } className="dropdown-item text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-primary d-flex align-items-center gap-3"> 
                        <Settings className="icon text-xl" />  {__('Setting')}</Link>
                    </li>
                    <li>
                        <button
                            onClick={logout}
                            className="dropdown-item text-black px-0 py-8 hover-bg-transparent cursor-pointer hover-text-danger d-flex align-items-center gap-3"
                        > 
                        <Power className="icon text-xl" />  {__('Log Out')}</button>
                    </li>
                </ul>
            </div>
        </div>
    );
}