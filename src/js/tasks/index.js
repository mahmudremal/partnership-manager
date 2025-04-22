const { default: axios } = require("axios");

class Tasks {
	constructor() {
		this.config = window?.partnershipmangConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {confirming: 'Confirming', ...i18n};
		this.setup_hooks();
	}
	setup_hooks() {
		// this.setup_events();
	}
    setup_events() {
        document.querySelectorAll('.toplevel_page_automated-jobs select[name="job-status"]').forEach(element => {
			element.addEventListener('change', (event) => {
				event.preventDefault();event.stopPropagation();
				const job_id = parseInt(element.parentElement.parentElement.dataset.jobId);
				const task_key = parseInt(element.parentElement.dataset.key);
				const update_value = event.target.value
				if (job_id) {
					axios.post(`https://tools4everyone.local/wp-json/partnership/v1/tasks/${job_id}`, {task_key, update_value}, {headers: {'X-WP-Nonce': this.ajaxNonce}});
				}
			});
		});
    }
}
new Tasks();