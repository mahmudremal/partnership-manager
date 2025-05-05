import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import request from "@common/request";
import { rest_url } from "@functions";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { useLoading } from "@context/LoadingProvider";
import { sprintf } from "sprintf-js";

export default function InvoiceEdit() {
  const { __ } = useTranslation();
  const { setPopup } = usePopup();
  const { setLoading } = useLoading();
  const { invoice_id } = useParams();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    invoice_id,
    first_name: "",
    middle_name: "",
    last_name: "",
    client_email: "",
    client_phone: "",
    currency: "USD",
    items: [{ label: "", price: "" }],
    total: 0,
  });

  const fetchInvoice = async () => {
    if (!invoice_id || invoice_id <= 0) return;
    setLoading(true);
    try {
      const data = await request(rest_url(`/partnership/v1/invoice/${invoice_id}`));
      const nameParts = data.client_name?.split(" ") || [];
      setForm({
        invoice_id: data.invoice_id,
        first_name: nameParts[0] || "",
        middle_name: nameParts[1] || "",
        last_name: nameParts[2] || "",
        client_email: data.client_email,
        client_phone: data.client_phone || "",
        currency: data.currency,
        items: data.items,
        total: parseFloat(data.total),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    const total = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    setForm({ ...form, items, total });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { label: "", price: "" }] });
  };

  const submitInvoice = async () => {
    setLoading(true);
    request(
        rest_url("/partnership/v1/invoice/create"),
        {method: "POST", body: JSON.stringify({...form})}
    )
    .then(res => {
        setForm(res);setStep(4);
    })
    .catch(e => setPopup(<div>Failed to submit invoice</div>))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoice_id]);

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
                  <input type="text" className="form-control" value={form?.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Middle Name')}</label>
                  <input type="text" className="form-control" value={form?.middle_name} onChange={(e) => setForm({ ...form, middle_name: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Last Name')}</label>
                  <input type="text" className="form-control" value={form?.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Email')}</label>
                  <input type="email" className="form-control" value={form?.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Phone')}</label>
                  <PhoneInput country={'us'} value={form?.client_phone} onChange={(phone) => setForm({ ...form, client_phone: phone })} inputClass="form-control w-100" />
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
                {form.items.map((item, index) => (
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
                ))}
                <div className="col-12 text-end">
                  <button type="button" className="btn btn-outline" onClick={addItem}>{__('Add Item')}</button>
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <strong>{__('Total')}:</strong>
                  <span className="text-xl fw-bold">{form.total.toFixed(2)} {form.currency}</span>
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
                  <div>{[form.first_name, form.middle_name, form.last_name].filter(Boolean).join(" ")}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Email')}:</strong>
                  <div>{form.client_email}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Phone')}:</strong>
                  <div>{form.client_phone}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Currency')}:</strong>
                  <div>{form.currency}</div>
                </div>
                <div className="col-12">
                  <strong>{__('Items')}:</strong>
                  <ul className="list-group">
                    {form.items.filter(item => item.label && item.price).map((item, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between">
                        <span>{item.label}</span>
                        <span>{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-12 d-flex justify-content-between border-top pt-3 mt-3">
                  <strong>{__('Total')}</strong>
                  <span>{form.total.toFixed(2)} {form.currency}</span>
                </div>
              </div>
              <div className="form-group d-flex align-items-center justify-content-end gap-8 mt-4">
                <button type="button" className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32" onClick={() => setStep(2)}>{__('Back')}</button>
                <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={submitInvoice}>{__('Confirm Invoice')}</button>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="wizard-fieldset show text-center">
              <h3 className="text-lg fw-semibold">{__('Invoice Submitted Successfully')}</h3>
              <p>{__('You can now share your invoice using the links below:')}</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-3">
                {[__('Whatsapp'), __('Messenger'), __('Twitter'), __('LinkedIn'), __('Instagram'), __('Email')].map((platform) => (
                  <button key={platform} className="btn btn-outline">
                    {sprintf(__('Share on %s'), platform)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </div>
  );
}