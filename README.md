# ATS (Applicant Tracking System)

A modern, full-stack recruitment management system inspired by Manatal ATS, featuring client management, job tracking, and a Kanban-based candidate pipeline.

## 🚀 Features

- **Client Management (CRM)** - Track prospects, active clients, and relationships
- **Job Management** - Create and manage job positions linked to clients
- **Candidate Management** - Maintain comprehensive candidate profiles
- **Kanban Pipeline** - Visual drag-and-drop candidate tracking through recruitment stages
- **Dashboard** - Real-time statistics and quick actions
- **Modern UI** - Built with TailwindCSS for a premium, responsive design

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2.1** - Java framework
- **MySQL** - Database (`smartborn_ats_db`)
- **Spring Data JPA** - ORM
- **Lombok** - Reduce boilerplate code

### Frontend
- **Angular 21** - TypeScript framework
- **TailwindCSS v4** - Utility-first CSS
- **Angular CDK** - Drag-and-drop functionality
- **RxJS** - Reactive programming

## 📋 Prerequisites

- **Java 17** or higher
- **Maven** 3.6+
- **Node.js** 18+ and npm
- **MySQL** 8.0+ running on localhost:3306
- Angular CLI (`npm install -g @angular/cli`)

## 🔧 Setup Instructions

### 1. Database Setup

Create a MySQL database (or it will be auto-created):
```sql
CREATE DATABASE smartborn_ats_db;
```

Ensure MySQL is running with credentials:
- Username: `root`
- Password: `root`
- Port: `3306`

### 2. Backend Setup

```bash
cd ats-backend

# Run the Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Note**: Database tables will be auto-created on first run via Hibernate DDL.

### 3. Frontend Setup

```bash
cd ats-frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:4200` (or an alternate port if 4200 is occupied)

## 📱 Usage

1. **Start Backend** - `mvn spring-boot:run` in `ats-backend` directory
2. **Start Frontend** - `npm start` in `ats-frontend` directory
3. **Access Application** - Open browser to `http://localhost:4200`

### Workflow

1. **Add Clients** - Navigate to "Clients" and create your first client company
2. **Create Jobs** - Go to "Jobs", create a job position, and link it to a client
3. **Add Candidates** - Add candidate profiles with their details
4. **Use Kanban** - Click "View Kanban" on any job to see the pipeline
5. **Drag & Drop** - Move candidates between stages (New → Screening → Interview → Offer → Hired)

## 🗂️ Project Structure

```
antigravity/
├── ats-backend/                 # Spring Boot backend
│   ├── src/main/java/com/ats/
│   │   ├── entity/             # JPA entities
│   │   ├── repository/         # Data repositories
│   │   ├── service/            # Business logic
│   │   ├── controller/         # REST API controllers
│   │   └── config/             # Configuration (CORS, etc.)
│   └── pom.xml                  # Maven dependencies
│
└── ats-frontend/                # Angular frontend
    ├── src/app/
    │   ├── models/              # TypeScript interfaces
    │   ├── services/            # API services
    │   ├── pages/               # Page components
    │   │   ├── dashboard/
    │   │   ├── clients/
    │   │   ├── jobs/
    │   │   ├── candidates/
    │   │   └── kanban/          # Kanban board
    │   └── app.component.ts     # Main component with sidebar
    └── tailwind.config.js       # Tailwind configuration
```

## 🔌 API Endpoints

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/client/{clientId}` - Jobs by client
- `POST /api/jobs` - Create job (auto-creates default pipeline stages)
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job

### Candidates
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/{id}` - Update candidate
- `DELETE /api/candidates/{id}` - Delete candidate

### Pipeline (Kanban)
- `GET /api/pipeline/job/{jobId}` - Get job pipeline with candidates
- `GET /api/pipeline/job/{jobId}/stages` - Get stages for job
- `POST /api/pipeline/job/{jobId}/candidate/{candidateId}/stage/{stageId}` - Add candidate to job
- `PUT /api/pipeline/candidate/{candidateId}/job/{jobId}/move/{stageId}` - Move candidate to different stage

## 🎨 Design Features

- **Modern Color Palette** - Primary (Indigo #6366f1), Secondary (Purple #8b5cf6)
- **Glassmorphism** - Translucent cards with backdrop blur
- **Smooth Animations** - Card hover effects and drag transitions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Custom Scrollbars** - Styled for better aesthetics

## 🔮 Default Pipeline Stages

When a job is created, 8 default stages are automatically created:
1. **New Applications** (Blue)
2. **Screening** (Purple)
3. **Phone Interview** (Pink)
4. **Technical Interview** (Amber)
5. **Final Interview** (Green)
6. **Offer** (Cyan)
7. **Hired** (Green)
8. **Rejected** (Red)

## 🐛 Troubleshooting

**Port 4200 already in use:**
- Angular will automatically use an alternate port (check terminal output)
- Or stop the conflicting process

**Backend won't start:**
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify Java 17+ is installed

**Database connection issues:**
- Check MySQL is running on localhost:3306
- Verify username/password are `root/root`
- Database `smartborn_ats_db` should auto-create

## 📝 License

This project is built for demonstration purposes.

## 👨‍💻 Author

Built with Angular 21, Spring Boot 3, and modern web technologies.
