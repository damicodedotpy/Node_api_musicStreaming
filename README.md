Set up instructions:

1. Create an '.env' file with the following variables:
    MONGO_URL = database connection engine
    SECRET_KEY = API secret key string
    EXPRESS_PORT = 3910
    USER_ROUTE_PREFIX = "/api/v1/user"
    ARTIST_ROUTE_PREFIX = "/api/v1/artist"
    ALBUM_ROUTE_PREFIX = "/api/v1/album"
    SONG_ROUTE_PREFIX = "/api/v1/song"
2. The http requests must have a field named 'authorization' with
the user token