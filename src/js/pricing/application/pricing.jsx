import React, { useEffect, useRef, useState } from 'react';
import { Check, Package } from 'lucide-react';

const Pricing = ({ }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [packages, setPackages] = useState([]);
  const [successUrl, setSuccessUrl] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    fetch(`${location.origin}/wp-json/partnership/v1/contracts/packages`)
    .then(r => {
      if (r.ok) {
        return r.json();
      } else {
        return Promise.reject(r);
      }
    })
    .then(res => {
      setPackages(res);
      const sorted_plans = ['Monthly', 'Yearly']; // [...new Set(res.flatMap(item => Object.keys(item.pricing)))];
      setPlans(sorted_plans);
      setPlan(sorted_plans[0]);
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (successUrl) {
      location.href = successUrl;
      // const win = window.open(successUrl, '_blank', 'width=600,height=800');
      // const checkClosed = setInterval(() => {
      //   if (win?.closed) {clearInterval(checkClosed);}
      // }, 500);
    }
  }, [successUrl]);

  const __ = (text) => text;

  const handleGetStarted = async (e, packId) => {
    e.preventDefault();
  
    setLoading(true);
  
    try {
      const res = await fetch(`${location.origin}/wp-json/partnership/v1/contracts/packages/${packId}/${plan}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: null,
          currency: 'AED',
          client_email: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          countryCode: '',
          client_phone: ''
        })
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
  
      const data = await res.json();
  
      if (data?.invoice_link) {
        setSuccessUrl(data.invoice_link);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="xpo_block xpo_m-auto xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_shadow-sm hover:xpo_bg-gray-100 dark:xpo_bg-gray-800 dark:xpo_border-gray-700 dark:hover:xpo_bg-gray-700 xpo_h-100 xpo_p-0 xpo_radius-12 xpo_overflow-hidden">
      <div className="xpo_border-b xpo_bg-base xpo_py-4 xpo_px-6 xpo_flex xpo_justify-between xpo_gap-5">
        <div>
          <h6 className="xpo_mb-0 xpo_text-lg">{__('Pricing Plan')}</h6>
        </div>
        <div>
          <ul className="xpo_flex xpo_gap-2 xpo_m-0">
            {plans.map((p, index) => 
              <li key={index}>
                <button onClick={() => setPlan(p)} className={`xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-md xpo_text-secondary-light xpo_font-medium ${plan == p ? 'xpo_bg-gray-200 dark:xpo_bg-gray-600' : ''}`}>{__(p)}</button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="xpo_px-4 xpo_py-2">
        <div className="xpo_justify-center">
          <div className="xpo_w-full">
            <div className="xpo_grid xpo_gap-4 xpo_grid-cols-3">
              {packages.map((pack, index) => 
                <div className="xpo_relative xpo_flex xpo_flex-col xpo_my-6 xpo_bg-white xpo_shadow-sm xpo_border xpo_border-slate-200 xpo_rounded-lg xpo_p-4" key={index}>
                  <div className="xpo_pricing-plan xpo_relative xpo_radius-2 xpo_overflow-hidden xpo_bg-lilac-100">
                    <div className="xpo_flex xpo_items-center xpo_gap-16">
                      <span className="xpo_w-72-px xpo_h-72-px xpo_flex xpo_justify-center xpo_items-center xpo_radius-16 xpo_bg-base">
                        <Package color="#ccc" />
                      </span>
                      <div>
                        <span className="xpo_fw-medium xpo_text-md xpo_text-secondary-light">{__(pack?.packagefor??'For individuals')}</span>
                        <h6 className="xpo_mb-0">{__(pack?.name??'BASIC')}</h6>
                      </div>
                    </div>
                    <p className="xpo_mt-16 xpo_text-secondary-light xpo_mb-28">{__(pack?.shortdesc??'')}</p>
                    {pack?.pricing?.[plan] && (
                      <h3 className="xpo_mb-24">
                        ${pack?.pricing?.[plan]??0} <span className="xpo_fw-medium xpo_text-md xpo_text-secondary-light xpo_lowercase">/{plan}</span>
                      </h3>
                    )}
                    <span className="xpo_mb-20 xpo_fw-medium">{__(pack?.list_title??'What’s included')}</span>
                    <ul>
                      {pack.list.map((itemTitle, itemIndex) => 
                        <li className="xpo_flex xpo_items-center xpo_gap-16 xpo_mb-16" key={itemIndex}>
                          <span className="xpo_w-24-px xpo_h-24-px xpo_flex xpo_justify-center xpo_items-center xpo_bg-lilac-600 xpo_rounded-full">
                            <Check className="xpo_text-white xpo_text-lg" />
                          </span>
                          <span className="xpo_text-secondary-light xpo_text-lg">{itemTitle}</span>
                        </li>
                      )}
                    </ul>
                    <button
                      onClick={(e) => handleGetStarted(e, pack.id)}
                      className="xpo_bg-blue-500 hover:xpo_bg-blue-700 xpo_text-white xpo_font-bold xpo_py-2 xpo_px-4 xpo_rounded"
                    >{__('Get started')}</button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;