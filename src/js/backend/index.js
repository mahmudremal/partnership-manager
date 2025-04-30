import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './app';


class Backend {
	constructor() {
		this.config = window?.partnershipmangConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {submit: 'Submit', ...i18n};
		// window.partnershipmangConfig = null;
		this.setup_hooks();
	}
	setup_hooks() {
		window.i18ns = window?.i18ns??{};
		this.init_metabox();
	}
	async init_metabox() {
		const container = document.getElementById('partnershipapp');
		if (container) {
			try {
				const script = document.createElement("script");
				script.src = 'https://cdn.tailwindcss.com';
				script.onload = () => {
					window.tailwind = window.tailwind || {};
					window.tailwind.config = {prefix: 'xpo_'};
				}
				document.head.appendChild(script);
				const root = createRoot(container);root.render(<App config={this.config} />);
				// ReactDOM.render(<App config={this.config} />, container);
			} catch (e) {
				console.error('Failed to parse JSON:', e);
			}
		}
	}
}

new Backend();