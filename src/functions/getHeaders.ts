const axios = require(`axios`);

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

export async function getHeaders() {
  const {
    data: { access_token },
  } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
  );

  const headers = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Client-ID': `${clientId}`,
    },
  };

  return headers;
}
