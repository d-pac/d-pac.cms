'use strict';

function Collection( name,
                     model ){
  this.name = name;
  this.model = model;
}

module.exports = function( mongoose ){
  const collections = {};

  const PostSchema = new mongoose.Schema( {
    title: String,
    author: mongoose.Schema.Types.ObjectId,
  } );
  const PostModel = mongoose.model( 'Post', PostSchema );
  collections.Post = new Collection( 'Post', PostModel );

  const UserSchema = new mongoose.Schema( {
    name: {
      first: String,
      last: String,
    },
    isAdmin: Boolean
  } );
  const UserModel = mongoose.model( 'User', UserSchema );
  collections.User = new Collection( 'User', UserModel );

  return collections;
};
