# real-estate

Naija Homes — property listings for realtors (Express, MongoDB, EJS).

## Running

```
npm install
npm start
```

Requires MongoDB. Sessions are stored in MongoDB, so logins survive restarts.

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/naijaHomes` | |
| `PORT` | `5500` | |
| `SESSION_SECRET` | insecure development default | **Required** when `NODE_ENV=production`; the server refuses to start without it. Use a long random string. |
