// const baseUrl = 'http://127.0.0.1:8000/'; // For development
const baseUrl = 'https://api.marshallcodes.com/'; // For production

export const AuthService = {
    
    async refreshTokensData() {
        const tokens = JSON.parse(sessionStorage.getItem('tokens'));

        if (!tokens) return false;

        try {
            const response = await fetch(baseUrl + 'token/refresh/', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'include', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                body: JSON.stringify(tokens),
            });

            if (response.ok) {
                const newTokens = await response.json();
                const existingTokens = JSON.parse(sessionStorage.getItem('tokens')) || {};
                const updatedTokens = { ...existingTokens, ...newTokens };
                sessionStorage.setItem('tokens', JSON.stringify(updatedTokens));
                return true;
            }

            return false;


        } catch (error) {
            console.error(`[AuthService] ${error}`);
            return false;
        }
    },

    async makeRequestData({ urlExtension, method, body, retrying = false, stream = false }) {
        const tokens = JSON.parse(sessionStorage.getItem('tokens'));
        const access = tokens?.access;

        const response = await fetch(baseUrl + urlExtension, {
            method,
            headers: {
                'Authorization': access ? `JWT ${access}` : undefined,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : null,
            credentials: 'include',
        });

        // Handle 401 (unauthorized) once, if not already retried
        if (response.status === 401 && !retrying) {
            console.warn(`[AuthService] Received 401 — trying to refresh token...`);
            const refreshed = await this.refreshTokens();
            if (refreshed) {
                // Retry original request once after refreshing
                return this.makeRequestData({ urlExtension, method, body, retrying: true, stream });
            } else {
                console.error(`[AuthService] Token refresh failed`);
                return { data: null, error: true };
            }
        }

        // If streaming, return the raw stream immediately
        if (stream && response.ok && response.body) {
            return { data: response.body, error: false, streamed: true };
        }

        // Non-streaming json response
        let json = null;
        try {
            json = await response.json();
        } catch {}

        return {
            data: response.ok ? json : json,
            error: !response.ok,
            streamed: false,
        };
    },

    refreshTokens() {
        return this.refreshTokensData();
    },

    makeRequest({ urlExtension, method, body, stream = false }) {
        return this.makeRequestData({ urlExtension, method, body, stream });
    },

}