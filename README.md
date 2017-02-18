### Create account

```
curl localhost:8000/v1/accounts/register \
  -H 'Content-Type: application/json' \
  -d '{"email": "hi@example.com", "password": "pass"}'
```