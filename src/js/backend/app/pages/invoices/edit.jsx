import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import request from "@common/request";
import { notify, rest_url, home_url } from "@functions";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { useLoading } from "@context/LoadingProvider";
import { useCurrency } from "@context/CurrencyProvider";
import { X } from "lucide-react";



export default function InvoiceEdit() {
  const { print_money } = useCurrency();
  const { __ } = useTranslation();
  const { setPopup } = usePopup();
  const { setLoading } = useLoading();
  const { invoice_id } = useParams();
  const [packagesList, setPackagesList] = useState([]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    invoice_id,
    client_email: "",
    client_phone: "",
    currency: "USD",
    items: [{ label: "", price: "" }],
    total: 0,
    metadata: {
      first_name: '',
      middle_name: '',
      last_name: '',
      city: '',
      address: '',
      emirate: '',
      phone: '',
      phone_code: '',
    }
  });

  const fetchInvoice = async () => {
    if (!invoice_id || invoice_id <= 0) return;
    setLoading(true);
    request(rest_url(`/partnership/v1/invoice/${invoice_id}`)).then(data => {
      setForm({
        ...data,
        invoice_id: data.invoice_id,
        client_email: data.client_email,
        currency: data.currency,
        items: data.items,
        total: parseFloat(data.total)
      });
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
    request(rest_url(`/partnership/v1/contracts/packages`)).then(list => setPackagesList(list.filter(l => Object.keys(l?.pricing??[])?.length))).catch(e => console.error(e));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    const total = items.reduce((sum, item) => sum + parseFloat(get_item_price(item) || 0), 0);
    setForm({ ...form, items, total });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { label: '', price: '', type: 'custom', identifier: null }] });
  };

  const submitInvoice = async () => {
    setLoading(true);
    request(rest_url("/partnership/v1/invoice/create"), {
      method: "POST",
      headers: {'Cache-Control': 'no-cache', 'Content-Type': 'application/json'},
      body: JSON.stringify({...form})
    })
    .then(res => {
        setForm(res);setStep(4);
    })
    .catch(e => setPopup(<div>Failed to submit invoice</div>))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoice_id]);

  const get_item_price = (item) => {
    return (item.type === 'custom' ? item.price : packagesList.find(p => p.id == item.identifier)?.pricing[item.plan] || 0).toFixed(2);
  }

  const get_item_label = (item) => {
    return item.type === 'custom' ? item.label : packagesList.find(p => p.id == item.identifier)?.name + ' - ' + packagesList.find(p => p.id == item.identifier)?.packagefor;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-4 text-xl">{__('Edit Invoice')} #{invoice_id}</h6>
        <p className="text-neutral-500">{__('Please complete each step to create or edit your invoice.')}</p>

        <div className="form-wizard">
          <div className="form-wizard-header overflow-x-auto scroll-sm pb-8 my-32">
            <ul className="list-unstyled form-wizard-list style-three">
              {[1, 2, 3, 4].map((s) => (
                <li
                  key={s}
                  className={`form-wizard-list__item d-flex align-items-center gap-8 ${step === s ? 'active' : ''}`}
                >
                  <div className="form-wizard-list__line">
                    <span className="count">{s}</span>
                  </div>
                  <span className="text text-xs fw-semibold">
                    {s === 1 ? __('Invoice Details') : s === 2 ? __('Invoice Items') : s === 3 ? __('Review invoice') : __('Share')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {step === 1 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md text-neutral-500">{__('Personal Information')}</h6>
              <div className="row gy-3">
                <div className="col-sm-6">
                  <label className="form-label">{__('First Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.first_name} onChange={(e) => setForm({ ...form, metadata: {...form.metadata, first_name: e.target.value} })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Middle Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.middle_name} onChange={(e) => setForm({ ...form, metadata: {...form.metadata, middle_name: e.target.value} })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Last Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.last_name} onChange={(e) => setForm({ ...form, metadata: {...form.metadata, last_name: e.target.value} })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Email')}</label>
                  <input type="email" className="form-control" value={form?.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  {/* <label className="form-label">{__('Phone')}</label> */}
                  <PhoneInput
                    country={'us'}
                    value={form.metadata?.phone}
                    onChange={(phone, countryData) => {
                      setForm({
                        ...form,
                        metadata: {
                          ...form.metadata,
                          phone: phone.replace(/\D/g, ''),
                          countryCode: countryData.iso2
                        }
                      });
                    }}
                    // onChange={(phone) => setForm({ ...form, metadata: {...form.metadata, phone: e.target.value} })}
                    inputClass="form-control w-100"
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Currency')}</label>
                  <select className="form-control" value={form?.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div className="form-group text-end">
                  <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={() => setStep(2)}>{__('Next')}</button>
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md text-neutral-500">{__('Invoice Items')}</h6>
              <div className="row gy-3">
                {/* {form.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="col-sm-6">
                      <label className="form-label">{__('Item Label')}</label>
                      <input type="text" className="form-control" value={item.label} onChange={(e) => handleItemChange(index, 'label', e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label">{__('Item Price')}</label>
                      <input type="number" className="form-control" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
                    </div>
                  </React.Fragment>
                ))} */}

                {form.items.map((item, index) => (
                  <React.Fragment key={index}>

                    <div className="col-sm-4">
                      <label className="form-label">{__('Item Type')}</label>
                      <select
                        value={item.type}
                        className="form-control"
                        onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                      >
                        <option value="custom">{__('Custom')}</option>
                        <option value="package">{__('Package')}</option>
                      </select>
                    </div>

                    {item.type === 'custom' ? (
                      <>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Item Label')}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={item.label}
                            onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                          />
                        </div>

                        <div className="col-sm-4">
                          <label className="form-label">{__('Item Price')}</label>
                          <input
                            type="number"
                            value={item.price}
                            className="form-control"
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Identifier')}</label>
                          <select
                            className="form-control"
                            value={item.identifier}
                            onChange={(e) => handleItemChange(index, 'identifier', e.target.value)}
                          >
                            <option value="">Select Identifier</option>
                            {packagesList.map((opt, index) => (
                              <option key={index} value={opt.id}>
                                {opt?.name??''} - {opt?.packagefor??''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Plan')}</label>
                          <select
                            className="form-control"
                            value={item?.plan??null}
                            onChange={(e) => handleItemChange(index, 'plan', e.target.value)}
                          >
                            <option value="">Select Plan</option>
                            {Object.entries(packagesList.find(p => p.id == form.items.find(i => i.id == item.id).identifier)?.pricing || {}).map(([key, value]) => ({ value: key, label: `${key} - ${value}` })).map((opt, optIndex) => (
                              <option key={optIndex} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                  </React.Fragment>
                ))}

                
                <div className="col-12 text-end">
                  <button type="button" className="btn btn-outline" onClick={addItem}>{__('Add Item')}</button>
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <strong>{__('Total')}:</strong>
                  <span className="text-xl fw-bold">{print_money(form.total.toFixed(2), form.currency)}</span>
                </div>
                <div className="form-group d-flex align-items-center justify-content-end gap-8">
                  <button type="button" className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32" onClick={() => setStep(1)}>{__('Back')}</button>
                  <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={() => setStep(3)}>{__('Next')}</button>
                </div>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md text-neutral-500">{__('Review Invoice')}</h6>
              <div className="row gy-3">
                <div className="col-sm-6">
                  <strong>{__('Client Name')}:</strong>
                  <div>{[form.metadata?.first_name, form.metadata?.middle_name, form.metadata?.last_name].filter(Boolean).join(" ")}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Email')}:</strong>
                  <div>{form.client_email}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Phone')}:</strong>
                  <div>{form.metadata?.phone}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Currency')}:</strong>
                  <div>{form.currency}</div>
                </div>
                <div className="col-12">
                  <strong>{__('Items')}:</strong>
                  <ul className="list-group">
                    {form.items.filter(item => item).map((item, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between">
                        <span>{get_item_label(item)}</span>
                        <span>{get_item_price(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-12 d-flex justify-content-between border-top pt-3 mt-3">
                  <strong>{__('Total')}</strong>
                  <span>{print_money(form.total.toFixed(2), form.currency)}</span>
                </div>
              </div>
              <div className="form-group d-flex align-items-center justify-content-end gap-8 mt-4">
                <button type="button" className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32" onClick={() => setStep(2)}>{__('Back')}</button>
                <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={submitInvoice}>{__('Confirm Invoice')}</button>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="wizard-fieldset show">
              <div className="xpo_flex xpo_flex-col xpo_gap-8">
                <div>
                  <h3 className="text-lg fw-semibold">{__('Invoice Submitted Successfully')}</h3>
                  <p>{__('You can now share your invoice using the links below:')}</p>
                </div>
                <div>
                  <ShareInperson link={ home_url(`invoice/${form.invoice_id}/pay`) } __={__} />
                </div>
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </div>
  );
}



const ShareInperson = ({ link, __ }) => {
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');

  const addEmail = () => {
    const trimmed = inputValue.trim();
    if (trimmed && validateEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      emails,
      subject: __('You have been invited!'),
      body: `${message || link}`,
    };
    try {
      const res = await request(rest_url('partnership/v1/invoice/share'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        notify.success('Link shared successfully!');
        emails = [];
        setMessage('');
      } else {
        notify.error('Failed to share link.');
      }
    } catch (err) {
      console.error(err);
      notify.error('Error sending the request.');
    }
  };

  const handleShareTo = (platform) => {
    let shareUrl;
    const encodedLink = encodeURIComponent(link);
    switch (platform) {
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodedLink}&app_id=123456789&redirect_uri=${encodedLink}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedLink}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedLink}`;
        break;
      case 'wechat':
        notify.success('Please use the WeChat app to share this link.');
        return;
      default:
        return;
    }
    if (shareUrl) {
      const win = window.open(shareUrl, '_blank', 'width=600,height=400');
      if (win) win.focus();
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="xpo_p-4 xpo_border xpo_rounded xpo_shadow-sm xpo_bg-white xpo_space-y-4">
      <div className="xpo_flex xpo_gap-2">
        <button
          onClick={() => handleShareTo('messenger')}
          className="xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-blue-700"
        >{__('Messenger')}</button>
        <button
          onClick={() => handleShareTo('whatsapp')}
          className="xpo_bg-green-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-green-600"
        >{__('WhatsApp')}</button>
        <button
          onClick={() => handleShareTo('twitter')}
          className="xpo_bg-blue-400 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-blue-500"
        >{__('Twitter')}</button>
        <a
          href={`mailto:?subject=You've got a link!&body=${encodeURIComponent(link)}`}
          className="xpo_inline-block xpo_bg-gray-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded hover:xpo_bg-gray-700"
        >{__('Share Email')}</a>
      </div>

      <form onSubmit={handleShareSubmit} className="xpo_space-y-4">
        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Invite via Email')}</label>

        <div className="xpo_flex xpo_flex-wrap xpo_gap-2 xpo_p-2 xpo_border xpo_rounded xpo_bg-gray-50">
          {emails.map(email => (
            <div key={email} className="xpo_flex xpo_items-center xpo_bg-gray-200 xpo_px-2 xpo_py-1 xpo_rounded xpo_text-sm">
              {email}
              <button
                type="button"
                onClick={() => setEmails(prev => prev.filter(e => e !== email))}
                className="xpo_ml-1 xpo_text-red-600 hover:xpo_text-red-800"
              ><X /></button>
            </div>
          ))}
          <input
            type="text"
            onBlur={addEmail}
            value={inputValue}
            onKeyDown={handleKeyDown}
            placeholder={__('Enter email...')}
            onChange={(e) => setInputValue(e.target.value)}
            className="xpo_flex-grow xpo_border-none focus:xpo_ring-0 xpo_outline-none xpo_text-sm xpo_bg-transparent"
          />
        </div>

        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={__('Enter your message here (Optional)...')}
          className="xpo_w-full xpo_border xpo_rounded xpo_p-2 xpo_text-sm"
        />

        <button
          type="submit"
          className="xpo_bg-indigo-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded hover:xpo_bg-indigo-700"
        >{__('Share Link')}</button>
      </form>
    </div>
  );
};
