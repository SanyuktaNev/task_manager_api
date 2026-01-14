# Task Manager API

A simple **Task Manager Web Application** with authentication, role-based access, and task CRUD operations.  
Frontend is built with **Vanilla JS**, backend with **Flask**, and JWT authentication uses **HTTP-only cookies**.

---

## Features

- User registration & login with password hashing
- Role-based access (user vs admin)
- JWT authentication using cookies
- CRUD operations for tasks
- Basic frontend UI with Vanilla JS
- API documentation included in Postman collection

---

## Setup Instructions

### Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
## Scalability Notes

- The API is modular and can handle additional features via separate blueprints.  
- Multiple Flask instances can be deployed behind a load balancer to support more users.  
- JWT-based authentication with cookies ensures secure and stateless sessions.  
- Optional caching with Redis can reduce database load for frequent task queries.

