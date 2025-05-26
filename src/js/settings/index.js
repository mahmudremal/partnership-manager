import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const RoleBased = lazy(() => import('./role-based'));

const __ = (t) => t;

document.querySelectorAll('#roles-assign-interface').forEach(field => {
    const container = field.parentElement;
    container.previousElementSibling.remove();
    if (container) {
        const script = document.createElement("script");
        script.src = 'https://cdn.tailwindcss.com';
        script.onload = () => {
            window.tailwind = window.tailwind || {};
            window.tailwind.config = {
                prefix: 'xpo_',
                theme: {
                    extend: {
                        colors: {
                            primary: {
                                100: '#FDECEA',
                                200: '#F9D1D4',
                                300: '#F4B7BD',
                                400: '#EF9DA6',
                                DEFAULT: '#E03C33',
                                500: '#E03C33',
                                600: '#B82E27',
                                700: '#90201B',
                                800: '#68120F',
                                900: '#400403',
                            },
                            secondary: {
                                100: '#E5E7EB',
                                200: '#D1D5DB',
                                300: '#B0B6C1',
                                400: '#9CA3AF',
                                DEFAULT: '#6B7280',
                                500: '#6B7280',
                                600: '#4B5563',
                                700: '#374151',
                                800: '#1F2937',
                                900: '#111827',
                            },
                            accent: {
                                100: '#F0F9FF',
                                200: '#DBEFFE',
                                300: '#BEE3F8',
                                400: '#9ECEF4',
                                DEFAULT: '#67B8EF',
                                500: '#67B8EF',
                                600: '#4F9DDA',
                                700: '#3D83C1',
                                800: '#2B69A2',
                                900: '#1A4D82',
                            },
                            'brand-dark': '#1D2327'
                        },
                    },
                },
            };
        }
        document.head.appendChild(script);
        const config = JSON.parse(field.dataset.config);
        container.innerHTML = '';
        const root = createRoot(container);root.render(
            <Suspense fallback={<div className="text-center p-4">{__('Loading...')}</div>}>
                <RoleBased config={config} />
            </Suspense>
        );
    }
});