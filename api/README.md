# Headstart API

## Installation

```bash
cd api
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

## Testing REST

```bash
curl -X POST http://localhost:8000/api/meetings
# sample response:
# {"room_id":"a1b2c3d4","created_at":1626791234.56789}
```

## Testing WebSocket

Install wscat:

```bash
npm install -g wscat
```

Connect to WebSocket:

```bash
wscat -c ws://localhost:8000/ws/meetings/<room_id>
```

Send binary data and observe JSON acks:

```bash
# in wscat shell, type some text and press enter (sent as UTF-8 bytes)
``` 