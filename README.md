# Simple-Fullstack-App
## Installation

1. clone or download this repository

2.open your command line and navigate to this repository

3. run ```npm install```

## make cert and key for https

```
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```
