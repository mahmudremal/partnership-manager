import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import logo from '@img/logo.png';
import { CheckCircle, ChevronDown, XCircle } from 'lucide-react';

const Checkout = ({ publicKey = null, bgImage = '' }) => {
  const cardRef = useRef(null);
  const [tap, setTap] = useState(null);
  const [elements, setElements] = useState(null);
  const [card, setCard] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    city: '',
    emirate: '',
    email: '',
    phone: '',
    countryCode: 'sa'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceError, setInvoiceError] = useState(null);
  const [successUrl, setSuccessUrl] = useState(null);
  const [showCardForm, setShowCardForm] = useState(true);
  const [provider, setProvider] = useState('tap');
  const [popup, setPopup] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const invoiceId = window.location.pathname.split('/')[2];

  useEffect(() => {
    axios.get(`/wp-json/partnership/v1/invoice/${invoiceId}`)
      .then(res => {
        const data = res?.data??res;
        if (data && !data.code) {
          setInvoiceData(data);
          switch (data?.status) {
            case 'unpaid':
              // setInvoiceData(data);
              break;
            case 'void':
              setInvoiceError('Invoice voided');
              break;
            case 'expired':
              setInvoiceError('Invoice expired');
              break;
            case 'paid':
              setInvoiceError('Invoice has beed paid');
              break;
            default:
              break;
          }
        } else {
          setError(res.data.message || 'Failed to load invoice');
        }
      })
      .catch(() => setError('Failed to load invoice'));
  }, [invoiceId]);

  useEffect(() => {
    if (showCardForm && invoiceData) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js";
      script.async = true;
      document.body.appendChild(script);

      const tapScript = document.createElement("script");
      tapScript.src = "https://secure.gosell.io/js/sdk/tap.min.js";
      tapScript.async = true;
      tapScript.onload = initializeTap;
      document.body.appendChild(tapScript);

      return () => {
        document.body.removeChild(script);
        document.body.removeChild(tapScript);
      };
    }
  }, [showCardForm, invoiceData]);

  useEffect(() => {
    if (successUrl) {
      const win = window.open(successUrl, '_blank', 'width=600,height=800');
      const checkClosed = setInterval(() => {
        if (win?.closed) {clearInterval(checkClosed);}
        // setPaymentStatus('success');
      }, 500);
    }
  }, [successUrl]);

  useEffect(() => {
    axios.get(`/wp-json/partnership/v1/payment/gateways`)
    .then(res => res.data)
    .then(list => setGateways(Object.keys(list).map(id => ({id, ...list[id]}))))
    .catch(() => setError('Failed to load invoice'));
  }, [])
  
  const initializeTap = () => {
    if (!window.Tapjsli || !publicKey) {
      setError('Payment system is not initialized. Please refresh the page.');
      return;
    }

    try {
      const tapInstance = window.Tapjsli(publicKey);
      const elementsInstance = tapInstance.elements({
        currencyCode: invoiceData?.currency??'SAR',
        locale: 'en',
      });

      const cardElement = elementsInstance.create(
        'card',
        {
          style: {
            base: {
              color: '#333',
              fontSize: '16px',
            },
          }
        },
        {
          currencyCode:["KWD","USD","SAR"],
          labels : {
            cardNumber:"Card Number",
            expirationDate:"MM/YY",
            cvv:"CVV",
            cardHolder:"Card Holder Name"
          },
          TextDirection:'ltr',
          paymentAllowed: ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'MADA']
        }
      );

      // cardElement.mount(cardRef.current); it not working. it need valid selector
      cardElement.mount('#tap-element-container');
      setTap(tapInstance);
      setElements(elementsInstance);
      setCard(cardElement);
    } catch (err) {
      console.error('Tap initialization failed:', err);
      setError('Could not load card payment. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
      countryCode: country.countryCode
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessUrl(null);

    try {
      const payload = {...formData, provider};
      if (provider == 'tap') {
        if (!card) {
          setError('Card form not initialized.');
          return;
        }
        const { id: tokenId, error: tokenError } = await createToken(card);
        if (tokenError) throw new Error(tokenError.message);
        payload.cardToken = tokenId;
      }


      const response = await axios.post(`/wp-json/partnership/v1/invoice/${invoiceId}/pay`, payload);

      if (response.data && response.data.payment_url) {
        setSuccessUrl(response.data.payment_url);
      } else {
        let message = 'Unexpected response from server.';
        const data = response?.data;
        if (data?.errors && data.errors?.length) {
          message = data.errors.map(e => `Error (${e.code}): ${e.description}`).join('<br />')
        }
        throw new Error(message);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const isActiveProvider = (provdr) => {
    return provdr == provider;
  }

  if (error && !invoiceData) {
    return (
      <div className="xpo_min-h-screen xpo_flex xpo_items-center xpo_justify-center xpo_text-red-600 xpo_text-xl" dangerouslySetInnerHTML={{__html: error}}></div>
    );
  }

  return (
    <div className="xpo_min-h-screen xpo_bg-cover xpo_bg-center xpo_flex xpo_items-center xpo_justify-center" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'unset' }}>
      <div className="xpo_bg-white xpo_shadow-2xl xpo_w-full xpo_min-h-screen xpo_flex xpo_flex-col">
        <div className="xpo_flex xpo_justify-center xpo_py-3 xpo_border-solid xpo_border-b-2 xpo_border-slate-700">
          <a href="#" className="xpo_relative">
            <img
              className="xpo_max-h-20 xpo_w-auto"
              src={ logo }
              alt={'Logo'}
            />
            <div className="xpo_absolute xpo_h-full xpo_w-full xpo_top-0 xpo_left-0"></div>
          </a>
        </div>
        <div className="xpo_flex xpo_flex-col md:xpo_flex-row xpo_max-w-screen-xl xpo_mx-auto">
          {invoiceError ?
            <div className="xpo_w-full md:xpo_w-1/2 xpo_flex xpo_items-center xpo_justify-center xpo_bg-white">
              <div className="xpo_bg-red-100 xpo_text-red-800 xpo_p-4 xpo_rounded-lg xpo_border xpo_border-red-300 xpo_mb-4">
                <div className="xpo_flex xpo_items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="xpo_h-5 xpo_w-5 xpo_mt-1 xpo_mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 5.07a10 10 0 1113.86 13.86A10 10 0 015.07 5.07z" />
                  </svg>
                  <span>{invoiceError}</span>
                </div>
              </div>
            </div>
            :
            <div className="xpo_w-full md:xpo_w-1/2 xpo_p-8">
              <h2 className="xpo_text-3xl xpo_font-bold xpo_mb-6">Complete Your Payment</h2>
              <form onSubmit={handleSubmit} className="xpo_space-y-4">
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} />
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
                </div>
                
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="address" placeholder="Address" required value={formData.address} onChange={handleInputChange} />
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                  <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="emirate" placeholder="Emirate" required value={formData.emirate} onChange={handleInputChange} />
                </div>
                
                <input className="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500" name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} />
                <PhoneInput
                  country={formData.countryCode}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  containerClass="xpo_w-full"
                  inputClass="xpo_bg-gray-50 xpo_border xpo_border-gray-300 xpo_text-gray-900 xpo_text-sm xpo_rounded-lg xpo_focus:ring-blue-500 xpo_focus:border-blue-500 xpo_block !xpo_w-full xpo_p-2.5 dark:xpo_bg-gray-700 dark:xpo_border-gray-600 dark:xpo_placeholder-gray-400 dark:xpo_text-white dark:focus:xpo_ring-blue-500 dark:focus:xpo_border-blue-500"
                  enableSearch
                />
                
                <div data-accordion="collapse">
                  {gateways.map((g, index) => (
                    <div key={index} className="xpo_px-3">
                      <h2>
                        <div
                          onClick={() => !isActiveProvider(g.id) && setProvider(g.id)}
                          className={`xpo_cursor-pointer xpo_flex xpo_items-center xpo_justify-between xpo_w-full xpo_py-5 xpo_font-medium rtl:text-right ${
                            isActiveProvider(g.id)
                              ? 'xpo_bg-white dark:xpo_bg-gray-900 xpo_text-gray-900 dark:xpo_text-white'
                              : 'xpo_text-gray-500 dark:xpo_text-gray-400'
                          } xpo_border-b xpo_border-gray-200 dark:xpo_border-gray-700 xpo_gap-3`}
                          aria-expanded="true"
                        >
                          <div className="xpo_flex xpo_flex-nowrap xpo_gap-4 xpo_items-center">
                            <img src={g.icon} alt={g.title} className="xpo_w-auto xpo_h-4" />
                            <span>{g.title}</span>
                          </div>
                          <ChevronDown className={ `xpo_transition-all xpo_duration-300 xpo_ease-in-out xpo_w-5 xpo_h-5 xpo_shrink-0 ${isActiveProvider(g.id) ? 'xpo_rotate-180' : ''}` } />
                        </div>
                      </h2>
                      <div className={ `xpo_overflow-hidden xpo_transition-all xpo_duration-700 xpo_ease-in-out ${isActiveProvider(g.id) ? '' : 'xpo_h-0 xpo_hidden'}` }>
                        <div className="xpo_py-5 xpo_border-b xpo_border-gray-200 dark:xpo_border-gray-700">
                          <div className="xpo_mb-2 xpo_text-gray-500 dark:xpo_text-gray-400" dangerouslySetInnerHTML={{__html: g.description}}></div>
                          {g.fields.map((f, fIndex) => {
                            switch (f.type) {
                              case 'cards':
                                return (
                                  <div key={fIndex}>
                                    <label className="xpo_block xpo_mb-1 xpo_font-medium">Card Details</label>
                                    <div ref={cardRef} id="tap-element-container" className="xpo_p-3 xpo_border xpo_rounded xpo_bg-gray-50" />
                                  </div>
                                )
                                break;
                              default:
                                return <div key={fIndex}></div>
                                break;
                            }
                          })}
                        </div>
                      </div>
                  </div>
                  ))}
                </div>
                
                {error && <div className="xpo_text-red-600">{error}</div>}
                <button type="submit" className=" xpo_text-white xpo_bg-gradient-to-r xpo_from-red-400 xpo_via-red-500 xpo_to-red-600 hover:xpo_bg-gradient-to-br focus:xpo_ring-4 focus:xpo_outline-none focus:xpo_ring-red-300 dark:focus:xpo_ring-red-800 xpo_font-medium xpo_rounded-lg xpo_text-sm xpo_px-5 xpo_py-2.5 xpo_text-center xpo_me-2 xpo_mb-2" disabled={loading}>
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </form>

              {successUrl && (
                <div className="xpo_mt-4">
                  <a href={successUrl} target="_blank" rel="noopener noreferrer" className="xpo_text-blue-600 xpo_underline">
                    Click here to complete payment
                  </a>
                </div>
              )}
            </div>
          }

          {invoiceData && (
            <div
              // id="rightPage"
              className="xpo_w-full md:xpo_w-1/2 xpo_bg-gray-50 xpo_p-8 xpo_border-l"
            >
              <h3 className="xpo_text-xl xpo_font-semibold xpo_mb-4">Invoice Summary</h3>
              <ul className="xpo_space-y-2">
                {(invoiceData.items??[]).map((item, idx) => (
                  <li key={idx} className="xpo_flex xpo_justify-between">
                    <span>{item.label}</span>
                    <span>{item.price} {invoiceData.currency}</span>
                  </li>
                ))}
              </ul>
              <div className="xpo_border-t xpo_mt-4 xpo_pt-4 xpo_text-right xpo_font-bold">
                Total: {invoiceData.total} {invoiceData.currency}
              </div>
            </div>
          )}
        </div>
      </div>
      {paymentStatus && <Popup status={ paymentStatus } />}
    </div>
  );
};

export default Checkout;


const Popup = ({ status = "success" }) => {
  const isSuccess = status === "success";

  return (
    <div className="xpo_fixed xpo_inset-0 xpo_bg-black/50 xpo_flex xpo_items-center xpo_justify-center xpo_z-50">
      <div className="xpo_bg-white xpo_rounded-2xl xpo_p-6 xpo_shadow-xl xpo_max-w-sm xpo_w-full xpo_text-center">
        {isSuccess ? (
          <CheckCircle className="xpo_text-green-500 xpo_w-12 xpo_h-12 xpo_mx-auto" />
        ) : (
          <XCircle className="xpo_text-red-500 xpo_w-12 xpo_h-12 xpo_mx-auto" />
        )}
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mt-4">
          {isSuccess ? "Payment Successful" : "Payment Failed"}
        </h2>
        <p className="xpo_text-sm xpo_text-gray-600 xpo_mt-2">
          {isSuccess
            ? "Your transaction was completed successfully."
            : "There was an issue with your transaction. Please try again."}
        </p>
      </div>
    </div>
  );
};