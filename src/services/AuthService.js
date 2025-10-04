// // const baseUrl = 'http://localhost:8000/'; // For development
// const baseUrl = 'http://api.marshallcodes.local:81/'; // For production

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
                localStorage.setItem('tokens', JSON.stringify(newTokens));
                return true;
            }

            return false;


        } catch (error) {
            console.log(error);
            return false;
        }
    },

    async makeRequestData({ urlExtension, method, body }) {
        // Refresh tokens before request
        await this.refreshTokens();
        const authorization = localStorage.getItem('tokens') ? `JWT ${JSON.parse(localStorage.getItem('tokens')).access}` : null;

        const response = await fetch((baseUrl + urlExtension), {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            redirect: 'follow', // manual, *follow, error
            body: body ? JSON.stringify(body) : null,
        });
    
        // Read response body. If it's not empty, parse the JSON from it. If I don't do this, it causes a problem when the server doesn't return anything.
        let json = null;
        try {
            json = await response.json();
        } catch (e) {
            // If it's not JSON, ignore
        }
    
        if (response.ok) {
            return {
                data: json,
                error: false
            };
        }
    
        return {
            data: json,
            error: true
        }
    },

    refreshTokens() {
        return this.refreshTokensData();
    },

    makeRequest({ urlExtension, method, body }) {
        return this.makeRequestData({ urlExtension, method, body });
    },

}