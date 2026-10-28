# CampusGig API Request Examples (cURL & HTTP)

Practical examples for interacting with the CampusGig API via `curl` or Postman.

---

## 1. Check API Health
```bash
curl -X GET http://localhost:5000/api/health
```

---

## 2. Register Student Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "name": "Sarah Chen",
    "email": "sarah.chen@university.edu",
    "username": "sarahchen_ui",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "college": "MIT"
  }'
```

---

## 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "sarah.chen@university.edu",
    "password": "Password123!"
  }'
```

---

## 4. Publish a Service (Authenticated)
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Full-Stack Web App Development with React & Node",
    "description": "Experienced senior student building responsive, database-driven web applications with clean architecture and test coverage.",
    "category": "web_development",
    "price": 120,
    "currency": "USD",
    "deliveryTime": 5,
    "tags": ["react", "nodejs", "mongodb", "fullstack"],
    "portfolioUrl": "https://github.com/sarahchen_ui",
    "status": "published"
  }'
```

---

## 5. Search Public Marketplace
```bash
# Search by keyword
curl -X GET "http://localhost:5000/api/services?search=react"

# Filter by category and price range
curl -X GET "http://localhost:5000/api/services?category=web_development&minPrice=50&maxPrice=200&sort=price_asc"
```

---

## 6. Send an Inquiry to a Freelancer
```bash
curl -X POST http://localhost:5000/api/inquiries \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "serviceId": "<SERVICE_OBJECT_ID>",
    "message": "Hello Sarah, I need help building an interactive student dashboard for our campus club. Are you available this month?"
  }'
```

---

## 7. Retrieve Received Inquiries (Workspace)
```bash
curl -X GET http://localhost:5000/api/inquiries/received \
  -b cookies.txt
```
