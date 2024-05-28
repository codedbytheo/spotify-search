// importing all required modules for the application
const axios = require('axios')
const { URLSearchParams } = require('url')
const dotenv = require('dotenv').config()
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

// API credentials setup
const clientID = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

const searchTrack = async (trackName) => {
  const encodedCredentials = Buffer.from(`${clientID}:${clientSecret}`).toString('base64')

  const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
    grant_type: 'client_credentials'
  }), {
    headers:  {
      Authorization: `Basic ${encodedCredentials}`
    }
  })

  const accessToken = tokenResponse.data.access_token;
  const searchURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(trackName)}&type=track`

  const searchRequest = await axios.get(searchURL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const firstTrack = searchRequest.data.tracks.item[0]

  if (firstTrack) {
    return {
      artists: firstTrack.artists.map(artist => artist.name).join(', '),
      name: firstTrack.name,
      previewURL: firstTrack.preview_url,
      album: firstTrack.album.name,
      albumRelease: firstTrack.album.release_date
    }
  } else {
    return null
  }
}