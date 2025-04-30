import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "@context/LanguageProvider";
import { Camera } from "lucide-react";

export default function UsersEdit({ viewType = 'list' }) {
    const { userid } = useParams();
    const { __ } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        description: '',
    });

    const [previewImage, setPreviewImage] = useState(null);
    const imageInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        // Reset form or redirect
        console.log('Cancelled');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted data:', formData);
        // Add submit logic here
    };

    return (
        <div>
            <div className="card h-100 p-0 radius-12">
                <div className="card-body p-24">
                    <div className="row justify-content-center">
                        <div className="col-xxl-6 col-xl-8 col-lg-10">
                            <div className="card border">
                                <div className="card-body">
                                    <h6 className="text-md text-primary-light mb-16">{__('Profile Image')}</h6>
                                    <div className="mb-24 mt-16">
                                        <div className="avatar-upload position-relative">
                                            <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    id="imageUpload"
                                                    accept=".png, .jpg, .jpeg"
                                                    hidden
                                                    ref={imageInputRef}
                                                    onChange={handleImageChange}
                                                />
                                                <label
                                                    htmlFor="imageUpload"
                                                    className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                                                >
                                                    <Camera className="icon" />
                                                </label>
                                            </div>
                                            <div className="avatar-preview">
                                                <div id="imagePreview" className="w-100-px h-100-px rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                                    {previewImage ? (
                                                        <img src={previewImage} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <span className="text-sm text-muted">{__('No image')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-20">
                                            <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Full Name')} <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="name"
                                                placeholder={__('Enter Full Name')}
                                                defaultValue={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Email')} <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control radius-8"
                                                id="email"
                                                placeholder={__('Enter email address')}
                                                defaultValue={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="phone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Phone')}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="phone"
                                                placeholder={__('Enter phone number')}
                                                defaultValue={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="department" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Department')} <span className="text-danger-600">*</span>
                                            </label>
                                            <select
                                                id="department"
                                                className="form-control radius-8 form-select"
                                                defaultValue={formData.department}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">{__('Select Department')}</option>
                                                <option value={__('HR')}>{__('HR')}</option>
                                                <option value={__('Design')}>{__('Design')}</option>
                                                <option value={__('Engineering')}>{__('Engineering')}</option>
                                            </select>
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="designation" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Designation')} <span className="text-danger-600">*</span>
                                            </label>
                                            <select
                                                id="designation"
                                                className="form-control radius-8 form-select"
                                                defaultValue={formData.designation}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">{__('Select Designation')}</option>
                                                <option value={__('Manager')}>{__('Manager')}</option>
                                                <option value={__('Designer')}>{__('Designer')}</option>
                                                <option value={__('Developer')}>{__('Developer')}</option>
                                            </select>
                                        </div>

                                        <div className="mb-20">
                                            <label htmlFor="description" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                {__('Description')}
                                            </label>
                                            <textarea
                                                id="description"
                                                className="form-control radius-8"
                                                placeholder={__('Write description...')}
                                                defaultValue={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                            >
                                                {__('Cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            >
                                                {__('Save')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};