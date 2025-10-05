// const baseUrl = 'http://127.0.0.1:8000/'; // For development
const baseUrl = 'https://api.marshallcodes.com/'; // For production

export const AuthService = {
    
    async refreshTokensData() {
        const tokens = JSON.parse(localStorage.getItem('tokens'));

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
                const existingTokens = JSON.parse(localStorage.getItem('tokens')) || {};
                const updatedTokens = { ...existingTokens, ...newTokens };
                localStorage.setItem('tokens', JSON.stringify(updatedTokens));
                return true;
            }

            return false;


        } catch (error) {
            console.error(`[AuthService] ${error}`);
            return false;
        }
    },

    async makeRequestData({ urlExtension, method, body, retrying = false }) {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
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

        let json = null;
        try {
            json = await response.json();
        } catch {}

        // If successful, return
        if (response.ok) {
            return { data: json, error: false };
        }

        // Handle 401 (unauthorized) once, if not already retried
        if (response.status === 401 && !retrying) {
            console.warn(`[AuthService] Received 401 — trying to refresh token...`);
            const refreshed = await this.refreshTokens();
            if (refreshed) {
                // Retry original request once after refreshing
                return this.makeRequestData({ urlExtension, method, body, retrying: true });
            } else {
                console.error(`[AuthService] Token refresh failed`);
            }
        }

        return {
            data: json,
            error: true,
        };
    },

    refreshTokens() {
        return this.refreshTokensData();
    },

    makeRequest({ urlExtension, method, body }) {
        return this.makeRequestData({ urlExtension, method, body });
    },

}