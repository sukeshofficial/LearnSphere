## OUTPUTS:
1. Organizer/Admin/Backend View
![Dashboard Admin](../odoo-final/frontend/src/outputs/image.png)
![Courses](../odoo-final/frontend/src/outputs/image-2.png)
![Course Lesson](../odoo-final/frontend/src/outputs/image-3.png)
![course content](../odoo-final/frontend/src/outputs/image-4.png)
![Lesson Form](../odoo-final/frontend/src/outputs/image-5.png)
![preview](../odoo-final/frontend/src/outputs/image-6.png)
![edit quiz](../odoo-final/frontend/src/outputs/image-14.png)
![reward](../odoo-final/frontend/src/outputs/image-15.png)
![report](../odoo-final/frontend/src/outputs/image-7.png)
![settings](../odoo-final/frontend/src/outputs/image-8.png)
![share profile](../odoo-final/frontend/src/outputs/image-9.png)
![delete account](../odoo-final/frontend/src/outputs/image-10.png)

2. Participant/ Portal/ Front-End View
![Courses](../odoo-final/frontend/src/outputs/image-11.png)
![Course full view](../odoo-final/frontend/src/outputs/image-13.png)
![edit progile](../odoo-final/frontend/src/outputs/image-16.png)

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
