import React from 'react';
import { createRoot } from 'react-dom/client';
import Pricing from './pricing';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-pricing');
    if (container) {
        const script = document.createElement("script");
        script.src = 'https://cdn.tailwindcss.com';
        script.onload = () => {
            window.tailwind = window.tailwind || {};
            window.tailwind.config = {prefix: 'xpo_'};
        }
        document.head.appendChild(script);
        const root = createRoot(container);root.render(<Pricing config={config} />);
    }
}