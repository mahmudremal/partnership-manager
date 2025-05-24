import React, { useState } from "react";
import { useTranslation } from "@context/LanguageProvider";

const Footer = () => {
    const { __ } = useTranslation();
    const [opening, setOpening] = useState(null);
    
    const openDeveloper = () => {
        setOpening(true);
        setTimeout(() => {
            setOpening(false);
            window.open('https://www.mahmudremal.com/');
        }, 1500);
    }

    const date = new Date();
    
    return (
        <footer className="d-footer">
            <div className="row align-items-center justify-content-between">
                <div className="col-auto">
                    <p className="mb-0">© {date.getFullYear()} ECommerized LLC. {__('All Rights Reserved.')}</p>
                </div>
                <div className="col-auto">
                    {date.getFullYear() >= 2026 &&
                        <p className="mb-0">{__('Made by')} <span className="text-primary-600 xpo_cursor-pointer" onClick={openDeveloper}>{opening ? __('Opening...') : 'Remal M.'}</span></p>
                    }
                </div>
            </div>
        </footer>
    );
};

export default Footer;

