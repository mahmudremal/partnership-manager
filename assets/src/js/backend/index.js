import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

(function ($) {
	class Backend {
		constructor() {
			this.config = partnershipmangConfig;
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
			const container = document.getElementById('protoolsapp');
			if (container) {
				try {
					ReactDOM.render(<App config={this.config} />, container);
				} catch (e) {
					console.error('Failed to parse JSON:', e);
				}
			}
		}
	}
	

	new Backend();
})(jQuery);
