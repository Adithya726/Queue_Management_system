# Queue Management System

A full-stack queue management app. A queue manager signs in, creates named queues, issues tokens to people, reorders and cancels them, serves the person at the top with one click, and tracks wait times and queue-length trends on an analytics dashboard.

## Features

1. Manager registration and login (JWT)
2. Create named queues (each manager sees only their own)
3. Add a person to a queue – a token number is generated automatically
4. Live waiting list in queue order
5. Move tokens up and down
6. "Serve next" assigns the token at the top of the queue in one click, then "Complete service"
7. Cancel a token (with confirmation)
8. Dashboard and analytics: average and longest wait, average service time, served and cancelled counts, queue-length trend chart

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, JWT (jjwt) |
| Database | MySQL 8 |
| Frontend | React 19, Vite, React Router, Axios, Recharts, Lucide icons |

## Project structure

```
Queue_backend/    Spring Boot REST API (port 4887)
queue_frontend/   React client (port 9642)
```

## Running locally

### Prerequisites
- Java 21
- Node.js 20+
- MySQL running on localhost:3306

### Backend
```bash
cd Queue_backend
# MySQL username/password are set in src/main/resources/application.properties
export JWT_SECRET=any-long-random-string-at-least-32-characters
./mvnw spring-boot:run
```
Create the database once in MySQL: `CREATE DATABASE queue_db;`

### Frontend
```bash
cd queue_frontend
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:9642, register a manager account and start creating queues.

## API

All endpoints except `/api/auth/**` need `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a manager |
| POST | `/api/auth/login` | Log in, returns JWT |
| POST | `/api/queues` | Create a queue |
| GET | `/api/queues` | List my queues |
| POST | `/api/queues/{queueId}/tokens` | Add a person (creates a token) |
| GET | `/api/queues/{queueId}/tokens` | Waiting and currently-serving tokens |
| PATCH | `/api/tokens/{tokenId}/move?direction=UP\|DOWN` | Move a token |
| POST | `/api/queues/{queueId}/serve-next` | Serve the token at the top |
| POST | `/api/tokens/{tokenId}/complete` | Finish serving a token |
| PATCH | `/api/tokens/{tokenId}/cancel` | Cancel a waiting token |
| GET | `/api/queues/{queueId}/analytics` | Wait-time stats and queue-length trend |

## UI highlights

- **Dashboard**: live overview of every queue (auto-refresh every 30s): people waiting, being served, served so far, average wait, now-serving and next-in-line per queue, one-click Serve next, busiest-queue spotlight, waiting vs served chart.
- **Queue counter screen**: big Now Serving ticket with live timer and Complete button, waiting list with estimated wait per person, move up/down, cancel with confirmation, quick add with Enter.
- **Analytics**: per-queue deep dive with tokens issued, served, cancelled, completion rate, average and longest wait, average service time, peak queue length, queue-length area chart, token outcome donut, time breakdown and auto-generated insights.
- Toast notifications, skeleton loaders, empty states and a fully responsive layout (desktop, tablet, mobile).

## Screenshots

| Dashboard | Queue counter |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Queue counter](docs/screenshots/queue-counter.png) |

| Analytics | Mobile |
| --- | --- |
| ![Analytics](docs/screenshots/analytics.png) | ![Mobile](docs/screenshots/mobile.png) |

## Design notes

- **Ordering:** each waiting token stores an integer `position`; moving swaps positions with the neighbour, cancelling shifts later tokens up, new tokens go after the last one.
- **Token states:** `WAITING → SERVING → SERVED`, or `WAITING → CANCELLED`. Only one token per queue can be SERVING at a time.
- **Wait time** = `servingStartedAt − createdAt`; **service time** = `completedAt − servingStartedAt`.
- **Queue-length trend** replays every join (+1) and leave (−1) event in time order.
- **Data isolation:** every queue, token and analytics request checks that the queue belongs to the logged-in manager.
- **Errors:** validation and business-rule errors return 400 with a readable message, missing resources 404, expired or missing login 401 (the client then returns to the login page).
