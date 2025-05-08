import React from 'react';
import { createRoot } from 'react-dom/client';
import Invoice from './checkout';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-invoice');
    if (container) {
        const script = document.createElement("script");
        script.src = 'https://cdn.tailwindcss.com';
        script.onload = () => {
            window.tailwind = window.tailwind || {};
            window.tailwind.config = {prefix: 'xpo_'};
        }
        document.head.appendChild(script);
        const config = JSON.parse(atob(container.dataset.config));
        const root = createRoot(container);root.render(<Invoice config={config} />);
    }
}