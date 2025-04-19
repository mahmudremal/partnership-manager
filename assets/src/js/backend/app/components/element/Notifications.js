import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "../common/link";
import { createPopper } from "@popperjs/core";
import { timeAgo } from "../common/functions";
import { useTranslation } from "../context/LanguageProvider";


export default function Notifications() {
    const { __ } = useTranslation();
    const [menuOpened, setMenuOpened] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    
    const toggleDropdown = () => {
        setMenuOpened(prev => !prev);
    };

    const showableNotifications = [
        {
            image: "https://randomuser.me/api/portraits/women/1.jpg",
            title: "New follower",
            subtitle: "Alice started following you",
            time: Date.now() - 5 * 60 * 1000
        },
        {
            image: "https://randomuser.me/api/portraits/men/2.jpg",
            title: "Comment",
            subtitle: "John commented on your post",
            time: Date.now() - 2 * 60 * 60 * 1000
        },
        {
            image: "https://randomuser.me/api/portraits/women/3.jpg",
            title: "Mentioned you",
            subtitle: "Sophia mentioned you in a story",
            time: Date.now() - 3 * 24 * 60 * 60 * 1000
        },
    ];
    
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

    return (
        <div className="dropdown">
            <button
                className={`has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center ${menuOpened ? 'show' : ''}`}
                type="button"
                data-bs-toggle="dropdown"
                ref={buttonRef}
                onClick={toggleDropdown}
                aria-expanded={menuOpened ? 'true' : 'false'}
            >
                <Icon icon="iconoir:bell" className="text-primary-light text-xl" />
            </button>
            <div
                ref={dropdownRef}
                className={`dropdown-menu to-top dropdown-menu-lg p-0 ${menuOpened ? 'show d-block' : ''}`}
            >
                <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                    <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">{__('Notifications')}</h6>
                    </div>
                    <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">{showableNotifications?.length??0}</span>
                </div>
                
                <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                    {showableNotifications.map((n, i) => <NotificationItem key={i} image={n.image} title={n.title} subtitle={n.subtitle} time={n.time} bg="" isActive={i % 2} />)}
                </div>

                <div className="text-center py-12 px-16"> 
                    <Link to="#" className="text-primary-600 fw-semibold text-md">{__('See All Notification')}</Link>
                </div>

            </div>
        </div>
    );
}


const NotificationItem = ({ to = "#", image, initials, icon, title, subtitle, time, bg = "", isActive = false }) => {
    return (
      <Link
        to={to}
        className={`px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between ${isActive ? "bg-neutral-50" : ""}`}
      >
        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
          <span
            className={`w-44-px h-44-px ${bg} rounded-circle d-flex justify-content-center align-items-center flex-shrink-0`}
          >
            {icon && <Icon icon={icon} className="icon text-xxl text-success-main" />}
            {image && <img src={image} alt={title} className="xpo_rounded-full xpo_aspect-square" />}
            {!image && !icon && initials}
          </span>
          <div>
            <h6 className="text-md fw-semibold mb-4">{title}</h6>
            <p className="mb-0 text-sm text-secondary-light text-w-200-px">{subtitle}</p>
          </div>
        </div>
        <span className="text-sm text-secondary-light flex-shrink-0">{timeAgo(time)}</span>
      </Link>
    );
};
