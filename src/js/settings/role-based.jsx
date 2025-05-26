import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';

const __ = (t, d = null) => t;


const RoleBased = ({ config }) => {
  const [first, setFirst] = useState(true);
  const [form, setForm] = useState({
    partnership_project_manager: {
      all_access: true
    },
    ...Object.keys(config.roles).reduce((acc, roleKey) => {
      acc[roleKey] = config.roles[roleKey].capabilities;
      return acc;
    }, {})
  });
  const [roles, setRoles] = useState({
    // 'partnership_project_manager'   : __('Partnership Project Manager', 'partnership-manager'),
    // 'partnership_stuff'             : __('Partnership Stuff', 'partnership-manager'),
    // 'partnership_influencer'        : __('Partnership Influencer', 'partnership-manager'),
    // 'partnership_partner'           : __('Partnership Partner', 'partnership-manager'),
    // 'partnership_client'            : __('Partnership Client', 'partnership-manager')
    ...Object.keys(config.roles).reduce((acc, roleKey) => {
      acc[roleKey] = config.roles[roleKey].label;
      return acc;
    }, {})
  });
  const [abilities, setAbilities] = useState({
    'read'           : __('Read', 'partnership-manager'),
    'users'          : __('Users', 'partnership-manager'),
    'payouts'        : __('Payouts', 'partnership-manager'),
    'referral'       : __('Referral', 'partnership-manager'),
    'invoices'       : __('Invoices', 'partnership-manager'),
    'packages'       : __('Packages', 'partnership-manager'),
    'contracts'      : __('Contracts', 'partnership-manager'),
    'partner-docs'   : __('Partner Docs', 'partnership-manager'),
    'support-ticket' : __('Support Ticket', 'partnership-manager'),
    'team'           : __('Team', 'partnership-manager'),
    'stores'         : __('Stores', 'partnership-manager'),
    'service-docs'   : __('Service Docs', 'partnership-manager')
  });

  useEffect(() => {
    if (first) {setFirst(false);return;}
    const handler = setTimeout(() => {
      axios.post(`https://${location.host}/wp-json/partnership/v1/settings/roles`, {form}, {
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
      .then(res => console.log(res))
      .catch(err => console.error(err))
      .finally(() => {});
    }, 2000);

    return () => clearTimeout(handler);
  }, [form]);
  
  return (
    <div>
      <div className="xpo_w-full">
        <div className="">
          <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 xpo_gap-5">
            {Object.keys(roles).map((roleKey, rkIndex) => 
              <div key={rkIndex}>
                <div className="xpo_flex xpo_flex-col xpo_gap-5 xpo_shadow-md xpo_px-3 xpo_py-4 xpo_border-2 xpo_border-solid xpo_border-slate-100 xpo_bg-white xpo_rounded-lg">
                  <div className="xpo_flex xpo_justify-between xpo_items-center xpo_gap-5">
                    <h2 className="xpo_font-bold xpo_uppercase">{roles[roleKey]}</h2>
                    <div>
                      <input
                        type="checkbox"
                        className="!xpo_m-0"
                        title={__('Mark all access')}
                        checked={form?.[roleKey]?.['all_access']}
                        onChange={(e) => setForm(prev => ({...prev, [roleKey]: {...prev[roleKey], all_access: e.target.checked}}))}
                      />
                    </div>
                  </div>
                  <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-3">
                    {Object.keys(abilities).map((abilityKey, abilityIndex) => 
                      <div className="xpo_flex xpo_gap-3 xpo_items-center" key={abilityIndex}>
                        <label htmlFor={ `ability-${roleKey}-${abilityKey}` }>{abilities?.[abilityKey]}:</label>
                        <input
                          type="checkbox"
                          className="!xpo_m-0"
                          checked={form?.[roleKey]?.[abilityKey] || form?.[roleKey]?.['all_access']}
                          id={`ability-${roleKey}-${abilityKey}`}
                          onChange={(e) => setForm(prev => ({...prev, [roleKey]: {...prev[roleKey], [abilityKey]: e.target.checked}}))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default RoleBased;
