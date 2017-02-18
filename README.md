### Create account

```
curl localhost:8000/v1/accounts/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"adamringhede@live.com", "password": "secret"}'
```