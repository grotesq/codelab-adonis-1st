import Ws from 'App/Services/Ws'
import Post from 'App/Models/Post';
import {DateTime} from "luxon";

Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  let latest : Post | null = null;
  setInterval( async () => {
    const post = await Post.query()
      .where('publish_at', '<', DateTime.now().toISO())
      .orderBy( 'created_at', 'desc')
      .first();
    if( post && latest?.id !== post.id ) {
      latest = post;
      socket.emit('new-post', latest )
    }
  }, 5000 );

  socket.on('disconnect', () => {
    console.log( '연결 끊어짐' )
  })
})
