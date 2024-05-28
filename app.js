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

  const firstTrack = searchRequest.data.tracks.items[0]

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

const askQuestion = async (question) => {
  while (true) {
    const answer = await new Promise((resolve) => {
      readline.question(question, (value) => resolve(value))
    })

    

    if (answer.trim() !== '') {
      return answer
    } else {
      console.log('---------------------')
      console.error('No input received... Try again.')
      console.log('---------------------')
    }
  }
}

const mainMenu = async () => {
  while (true) {
    console.log('\nMenu:')
    console.log('---------------------')
    console.log(`1. Find Track`)
    console.log(`2. Exit Application`)
    console.log('---------------------')

    const option = await askQuestion(`Option (1 / 2): `)

    switch (option) {
      case '1':
        console.log('---------------------')
        const songName = await askQuestion('Search Track: ')
        const songDetails = await searchTrack(songName)
        if (songDetails) {
          console.log('---------------------')
          console.log(`Artists: ${songDetails.artists}`)
          console.log(`Song: ${songDetails.name}`)
          console.log(`Preview Link: ${songDetails.previewURL ? songDetails.previewURL : "No preview available..."}`)
          console.log(`Album: ${songDetails.album}`)
          console.log(`Album Release Date: ${songDetails.albumRelease}`)
          console.log('---------------------')
        } else {
          console.log('Song not found...')
        }
        break
      case '2':
        console.log('---------------------')
        console.log('Exiting the application...')
        readline.close()
        return
      default:
        console.log('---------------------')
        console.log('Invalid option selected... Try again.')
        console.log('---------------------')
    }
  }
}

mainMenu()