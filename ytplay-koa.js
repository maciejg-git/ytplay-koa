const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const { mande, defaults } = require("mande")

const app = new Koa();
const router = new Router({
  prefix: "/ytplay"
});

let apiKey = process.env.API_KEY

let playlistItems = mande("https://www.googleapis.com/youtube/v3/playlistItems")
let playlists = mande("https://www.googleapis.com/youtube/v3/playlists")
let commentThreads = mande("https://www.googleapis.com/youtube/v3/commentThreads")

defaults.headers.Referer = 'youtube-vue-server.herokuapp.com'

router.get("/playlist", async (ctx, next) => {
  let { nextPageToken } = ctx.request.query

  let query = {
    part: "snippet",
    playlistId: ctx.request.query.id,
    key: apiKey,
    maxResults: 50,
    fields: 'nextPageToken,pageInfo,items(id,snippet(title,description,thumbnails/default,resourceId))',
  }

  if (nextPageToken) {
    query.pageToken = nextPageToken
  }

  try {
    let items = await playlistItems.get({ query })
    ctx.body = items
  } catch(err) {
    console.log(err)
    ctx.response.status = err.body.error.code
  }
})

router.get("/playlists", async (ctx, next) => {
  let query = {
    part: "snippet",
    id: ctx.request.query.id,
    key: apiKey,
  }

  try {
    let playlistProperties = await playlists.get({ query })
    ctx.body = playlistProperties
  } catch(err) {
    console.log(err)
    ctx.response.status = err.body.error.code
  }
})

router.get("/comments", async (ctx, next) => {
  let { nextPageToken } = ctx.request.query

  let query = {
    part: "snippet",
    videoId: ctx.request.query.id,
    key: apiKey,
    maxResults: 50,
    order: "relevance",
    fields: 'nextPageToken,items(id,snippet(topLevelComment(snippet(authorDisplayName,authorProfileImageUrl,textOriginal))))',
  }

  if (nextPageToken) {
    query.pageToken = nextPageToken
  }

  try {
    let comments = await commentThreads.get({ query })
    ctx.body = comments
  } catch(err) {
    console.log(err)
    ctx.response.status = err.body.error.code
  }
})

app
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
