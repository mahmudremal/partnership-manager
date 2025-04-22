import toast from 'react-hot-toast';
// import { Notyf } from 'notyf';
// import 'notyf/notyf.min.css';

const location_host = "tools4everyone.local"; // location.host;

export const nl2br = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\n/g, '<br>');
}

export const site_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    return `https://${location.host}/${url}`;
}
export const home_route = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    return `/${url}`;
    // return `/partnership-dashboard/${url}`;
}
export const home_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    return site_url(`/${url}`);
    // return site_url(`/partnership-dashboard/${url}`);
}
export const rest_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    // return site_url(`wp-json/${url}`);
    return `https://${location_host}/wp-json/${url}`;
}

export const app_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    return `${partnershipmangConfig.buildPath}/${url}`
}

export const get_page = () => {
    return `${
        location.hash == '' ? '#/home' : location.hash
    }`.substring(1);
}

export const request_headers = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${partnershipmangConfig.ajax_nonce}`
        }
    }
}

export const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

class ToastNotification {
    constructor() {
        this.custom = toast.custom;
        this.loading = toast.loading;
        this.promise = toast.promise;
        this.dismiss = toast.dismiss;
    }
    success(msg) {
        return toast.success(msg)
    }
    error(msg) {
        return toast.error(msg)
    }
}

export const notify = new ToastNotification();




// https://react-hot-toast.com/docs/toast
// toast.promise(myPromise, {
//     loading: 'Loading',
//     success: 'Got the data',
//     error: 'Error when fetching',
// });

