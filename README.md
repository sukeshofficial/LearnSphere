## OUTPUTS:
1. Organizer/Admin/Backend View
![Dashboard Admin](outputs/image.png)
![Courses](outputs/image-2.png)
![Course Lesson](outputs/image-3.png)
![course content](outputs/image-4.png)
![Lesson Form](outputs/image-5.png)
![preview](outputs/image-6.png)
![edit quiz](outputs/image-14.png)
![reward](outputs/image-15.png)
![report](outputs/image-7.png)
![settings](outputs/image-8.png)
![share profile](outputs/image-9.png)
![delete account](outputs/image-10.png)

2. Participant/ Portal/ Front-End View
![Courses](outputs/image-11.png)
![Course full view](outputs/image-13.png)
![edit progile](outputs/image-16.png)

## Clone the Repository

```bash
git clone https://github.com/sukeshofficial/LearnSphere.git .
````

---

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000

JWT_SECRET=<your_JWT_secret>
JWT_EXPIRES_IN=1d

DB_HOST="localhost"
DB_PORT=5432
DB_USER="<your_db_user>"
DB_PASSWORD="<your_db_password>"
DB_NAME="<your_db_name>"

EMAIL_USER=<your_email_user>
EMAIL_PASS=<your_email_pass>
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

Backend will start on `http://localhost:5000`

---

## Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## Author

**Name:** Sukesh D </br>
**Email:** [sukesh.official.2006@gmail.com](mailto:sukesh.official.2006@gmail.com)</br>
**LinkedIn:** [https://www.linkedin.com/in/sukeshd/](https://www.linkedin.com/in/sukeshd/)

---
