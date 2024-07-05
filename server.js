require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const PORT = process.env.PORT || 3000;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.use(express.static('public'));

app.get('/api/spotify-data', async (req, res) => {
    try {
        const token = await getClientCredentialsToken();
        const response = await axios.get('https://api.spotify.com/v1/search', {
            params: {
                q: 'year:2024',
                type: 'track',
                market: 'IN',
                limit: 50
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(response.data); // Log the data to verify the structure

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Spotify API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch data from Spotify API' });
    }
});

async function getClientCredentialsToken() {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'client_credentials'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify API token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
