import React, { useState } from 'react';
// import { Link } from '../common/link';
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "@context/LanguageProvider";


import { Bolt, BookMarked, BookOpenText, Boxes, ChevronFirst, ChevronRight, CreditCard, HeartHandshake, LayoutDashboard, Network, Receipt, Signature, Store, ToggleRight, Users, UsersRound } from 'lucide-react';
import { home_route } from '../common/functions';

const Icon = ({ icon: IconComponent, ...attrs }) => {
  return <IconComponent {...attrs} />;
};

export const Nav = () => {
  const { __ } = useTranslation();

  const navMenus = () => [
    {
      label: __('Dashboard'),
      icon: LayoutDashboard,
      route: '/insights',
      order: 0,
      // childrens: [
      //   {
      //     label: __('Analytics'),
      //     route: '/analytics',
      //     icon: ChartNoAxesCombined,
      //   },
      //   {
      //     label: __('Sales'),
      //     route: '/sales',
      //     icon: ChartSpline,
      //   }
      // ]
    },
    {
      label: __('Application'),
      order: 1,
      class: 'sidebar-menu-group-title'
    },
    {
      label: __('Users'),
      icon: Users,
      route: '/users',
      order: 3,
      // childrens: [
      //   {
      //     label: __('Users List'),
      //     route: '/users',
      //     icon: LayoutList,
      //     iconClass: 'text-primary-600'
      //   },
      //   {
      //     label: __('Add User'),
      //     route: '/users/0/edit',
      //     icon: UserRoundPlus,
      //     iconClass: 'text-info-main'
      //   }
      // ]
    },
    {
      label: __('Stores'),
      icon: Store,
      route: '/stores',
      order: 4
    },
    {
      label: __('Referrals'),
      icon: Network,
      route: '/referrals',
      order: 5,
      // childrens: [
      //   {
      //     label: __('Active referrals'),
      //     route: '/referrals/active',
      //     icon: ToggleRight
      //   },
      //   {
      //     label: __('Inactive referrals'),
      //     route: '/referrals/inactive',
      //     icon: ToggleLeft
      //   },
      //   // {
      //   //   label: __('Retargetting'),
      //   //   route: '/referrals/retargetting',
      //   //   icon: Crosshair
      //   // }
      // ]
    },
    {
      label: __('Contracts'),
      icon: Signature,
      route: '/contracts',
      order: 6,
      childrens: [
        {
          label: __('Active contracts'),
          route: '/contracts/active',
          icon: ToggleRight
        },
        {
          label: __('Previous contracts'),
          route: '/contracts/previous',
          icon: ChevronFirst
        }
      ]
    },
    {
      label: __('Packages'),
      icon: Boxes,
      route: '/packages',
      order: 7
    },
    {
      label: __('Invoices'),
      icon: Receipt,
      route: '/invoices',
      order: 7
    },
    {
      label: __('Resources'),
      order: 8,
      class: 'sidebar-menu-group-title'
    },
    {
      label: __('Partner docs'),
      icon: BookMarked,
      route: '/resources/partner-docs',
      order: 9
    },
    {
      label: __('Service docs'),
      icon: BookOpenText,
      route: '/resources/service-docs',
      order: 10
    },
    {
      label: __('Support'),
      icon: HeartHandshake,
      route: '/support/supports',
      order: 11,
      // childrens: [
      //   {
      //     label: __('Supports'),
      //     route: '/support/supports',
      //     icon: LifeBuoy
      //   },
      //   {
      //     label: __('Open Ticket'),
      //     route: '/support/open-ticket',
      //     icon: TicketPlus
      //   }
      // ]
    },
    {
      label: __('Admin'),
      order: 12,
      class: 'sidebar-menu-group-title'
    },
    {
      label: __('Payouts'),
      icon: CreditCard,
      route: '/payouts',
      order: 13
    },
    {
      label: __('Team'),
      icon: UsersRound,
      route: '/team',
      order: 14
    },
    {
      label: __('Settings'),
      icon: Bolt,
      route: '/settings',
      order: 15
    }
  ];

  return (
    <>
      <Outlet />
      <ul className="sidebar-menu" id="sidebar-menu">
        {navMenus().filter(r => 
        location.host !== 'partners.ecommerized.com' ? r :
        (
          // , '/resources/service-docs', '/resources/partner-docs'
          !['/users', '/stores', '/contracts', '/packages', '/invoices', '/support', '/team', '/settings'].includes(r.route)
          && ! ['sidebar-menu-group-title'].includes(r?.class)
        )
      ).map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </ul>
    </>
  );
};

const NavItem = ({ item }) => {
  const [open, setOpen] = useState(false);

  if (item.class === 'sidebar-menu-group-title') {
    return <li className={item.class}>{item.label}</li>;
  }

  const hasChildren = item.childrens && item.childrens.length > 0;

  const toggleDropdown = (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  return (
    <li className={`${hasChildren ? 'dropdown' : ''} ${open ? '' : ''}`}>
      <NavLink to={home_route(item.route??'#')} onClick={hasChildren ? toggleDropdown : undefined} className={({ isActive }) => isActive ? 'active-page' : ''}>
        {item.icon && <Icon icon={item.icon} className="menu-icon" />}
        <span>{item.label}</span>
        {hasChildren && <ChevronRight />}
      </NavLink>

      {hasChildren && (
        <ul className="sidebar-submenu" style={{ display: open ? 'block' : 'none' }}>
          {item.childrens.map((child, idx) => (
            <li key={idx} className="xpo_cursor-pointer">
              <NavLink to={home_route(child.route)} className={({ isActive }) => isActive ? 'active-page' : ''}>
                {child.icon && <Icon icon={child.icon} className="menu-icon" />}
                {!child.icon && child.iconClass && (
                  <i className={`ri-circle-fill circle-icon ${child.iconClass} w-auto`} />
                )}
                <span>{child.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
