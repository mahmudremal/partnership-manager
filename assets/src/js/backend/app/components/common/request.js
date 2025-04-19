const cacheStore = new Map();
const configStore = new Map();
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

function request(url, options = {}) {
    const cacheKey = url + JSON.stringify(options);
    const now = Date.now();

    // Check cache
    const cached = cacheStore.get(cacheKey);
    if (cached && now - cached.timestamp < cached.ttl) {
        return Promise.resolve(cached.data);
    }

    // Inject global config headers if needed
    const headers = {
        ...(options.headers || {}),
        ...(
            configStore.has('_nonce') ? {
                'X-Nonce': configStore.get('_nonce')
            } : {}
        ),
    };
    
    if (configStore.has('Authorization')) {
        headers.Authorization = `Bearer ${configStore.get('Authorization')}`;
    }

    const finalOptions = {...options, headers};

    return fetch(url, finalOptions)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .then(data => {
            cacheStore.set(cacheKey, {
                data,
                timestamp: now,
                ttl: options.cacheTTL || DEFAULT_CACHE_TTL,
            });
            return data;
        });
}
// === Cache API ===
request.cache = {
    clear: () => cacheStore.clear(),
    remove: (key) => {
        for (let k of cacheStore.keys()) {
            if (k.includes(key)) cacheStore.delete(k);
        }
    },
    add: (key, data, ttl = DEFAULT_CACHE_TTL) => {
        cacheStore.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    },
    get: (key) => {
        const cached = cacheStore.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        return null;
    },
};
// === Global Config Setter ===
request.set = (key, value) => {
    configStore.set(key, value);
};
request.getConfig = (key) => configStore.get(key);

export default request;

// // Set global config (e.g., nonce)
// request.set('_nonce', 'abc123');

// // Make a request (automatically caches it for 30 mins)
// request('https://api.example.com/data')
//     .then(data => console.log(data))
//     .catch(console.error);

// // Clear all cache
// request.cache.clear();

// // Remove specific cache key
// request.cache.remove('https://api.example.com/data');

// // Manually add something to the cache
// request.cache.add('customKey', { foo: 'bar' });

// // Get from cache manually
// const data = request.cache.get('customKey');
