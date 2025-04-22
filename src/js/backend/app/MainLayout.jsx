import React, { useEffect, useState } from 'react';
// import { Link } from "react-router-dom";
import { Nav } from '@components/sidebar/nav';
import { Link } from '@components/common/link';
import { app_url } from '@components/common/functions';
import Footer from '@components/element/Footer';
import { ChevronRight, Home, Menu, MoonStar, Search, SunMedium, X } from 'lucide-react';
import LanguageSwitcher from '@components/element/LanguageSwitcher';
// import MessageNotification from '@components/element/MessageNotification';
import Notifications from '@components/element/Notifications';
import { useTranslation } from '@context/LanguageProvider';
import ProfilePannel from '@components/element/ProfilePannel';

import logo from '@img/logo.png';
import logoIcon from '@img/logo-icon.png';
import logoLight from '@img/logo-light.png';


const MainLayout = ({ children }) => {
    const { __ } = useTranslation();
    const [themeMode, setThemeMode] = useState(null);
    const [miniSidebar, setMiniSidebar] = useState(null);
    
    useEffect(() => {
        document.querySelector('html').dataset.theme = themeMode ? 'dark' : 'light';
    }, [themeMode]);

    const toggleMiniSidebar = () => {
        setMiniSidebar(prevMode => !prevMode);
    }

    const toggleDarkMode = () => {
        setThemeMode(prevMode => !prevMode);
    }
    
    return (
        <section>
            <aside className={ `sidebar ${miniSidebar ? 'active' : ''}` }>
                <button type="button" className="sidebar-close-btn">
                    <X />
                </button>
                <div>
                    <Link to="/" className="sidebar-logo">
                        <img src={ logo } alt={__('Site logo')} className="light-logo" />
                        <img src={ logoLight } alt={__('Site logo')} className="dark-logo" />
                        <img src={ logoIcon } alt={__('Site logo')} className="logo-icon" />
                    </Link>
                </div>
                <div className="sidebar-menu-area">
                    <Nav />
                </div>
            </aside>
            <main className={ `dashboard-main ${miniSidebar && 'active'}` }>
                <div className="navbar-header">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-auto">
                            <div className="d-flex flex-wrap align-items-center gap-4">
                                <button type="button" className={ `sidebar-toggle ${miniSidebar && 'active'}` } onClick={toggleMiniSidebar}>
                                    <Menu className="icon text-2xl non-active" />
                                    <ChevronRight className="icon text-2xl active" />
                                </button>
                                <button type="button" className="sidebar-mobile-toggle">
                                    <Menu className="icon" />
                                </button>
                                <form className="navbar-search">
                                    <input type="text" name="search" placeholder={__('Search')} />
                                    <Search className="icon" />
                                </form>
                            </div>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex flex-wrap align-items-center gap-3">

                                <button type="button" data-theme-toggle className="w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center" onClick={toggleDarkMode}>
                                    {themeMode ? <MoonStar /> : <SunMedium />}
                                </button>
                                {/*  */}
                                <LanguageSwitcher />
                                {/* <MessageNotification /> */}
                                <Notifications />
                                <ProfilePannel />
                                {/*  */}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-main-body xpo_h-[calc(100vh-72px)] xpo_overflow-hidden xpo_overflow-y-scroll">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
                        <h6 className="fw-semibold mb-0">Dashboard</h6>
                        <ul className="d-flex align-items-center gap-2">
                            <li className="fw-medium">
                                <Link to="index.html" className="d-flex align-items-center gap-1 hover-text-primary">
                                    <Home className="icon text-lg" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>-</li>
                            <li className="fw-medium">AI</li>
                        </ul>
                    </div>



                    {/* Main section will be placed here */}
                    <div>
                        {children}
                    </div>
                    {/* end of main section */}

                </div>

                <Footer />
            </main>
        </section>
    );
};
export default MainLayout;
