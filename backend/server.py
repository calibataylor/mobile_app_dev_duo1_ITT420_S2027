from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ucc_connect')]

# Create the main app
app = FastAPI(title="UCC Connect API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== Models ==============

class FacultyMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str  # HOD, Lecturer, Admin
    title: str
    email: str
    phone: str
    office: str
    photo: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    office_hours: Optional[str] = None

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    title: str
    credits: int
    description: str
    prerequisites: List[str] = []
    lecturer: str
    semester: str
    assessment_methods: List[str] = []
    learning_outcomes: List[str] = []

class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str  # Notice, Deadline, Seminar, Event
    date: str
    important: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str

class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    url: str
    category: str
    icon: str

class EmergencyContact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    phone: str
    email: str
    available: str

class Deadline(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    category: str
    important: bool = False
    completed: bool = False

class Note(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

# ============== API Endpoints ==============

@api_router.get("/")
async def root():
    return {"message": "UCC Connect API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "UCC Connect API"}

# Faculty Endpoints
@api_router.get("/faculty", response_model=List[FacultyMember])
async def get_faculty():
    faculty = await db.faculty.find().to_list(100)
    return [FacultyMember(**f) for f in faculty]

@api_router.get("/faculty/{faculty_id}", response_model=FacultyMember)
async def get_faculty_member(faculty_id: str):
    faculty = await db.faculty.find_one({"id": faculty_id})
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    return FacultyMember(**faculty)

# Course Endpoints
@api_router.get("/courses", response_model=List[Course])
async def get_courses():
    courses = await db.courses.find().to_list(100)
    return [Course(**c) for c in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)

# Announcements Endpoints
@api_router.get("/announcements", response_model=List[Announcement])
async def get_announcements():
    announcements = await db.announcements.find().sort("created_at", -1).to_list(100)
    return [Announcement(**a) for a in announcements]

# FAQ Endpoints
@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find().to_list(100)
    return [FAQ(**f) for f in faqs]

# Resources Endpoints
@api_router.get("/resources", response_model=List[Resource])
async def get_resources():
    resources = await db.resources.find().to_list(100)
    return [Resource(**r) for r in resources]

# Emergency Contacts Endpoints
@api_router.get("/emergency-contacts", response_model=List[EmergencyContact])
async def get_emergency_contacts():
    contacts = await db.emergency_contacts.find().to_list(100)
    return [EmergencyContact(**c) for c in contacts]

# Deadlines Endpoints
@api_router.get("/deadlines", response_model=List[Deadline])
async def get_deadlines():
    deadlines = await db.deadlines.find().sort("date", 1).to_list(100)
    return [Deadline(**d) for d in deadlines]

@api_router.put("/deadlines/{deadline_id}/toggle")
async def toggle_deadline_completion(deadline_id: str):
    deadline = await db.deadlines.find_one({"id": deadline_id})
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    
    new_completed = not deadline.get("completed", False)
    await db.deadlines.update_one(
        {"id": deadline_id}, 
        {"$set": {"completed": new_completed}}
    )
    updated = await db.deadlines.find_one({"id": deadline_id})
    return Deadline(**updated)

# Notes Endpoints (CRUD)
@api_router.get("/notes", response_model=List[Note])
async def get_notes():
    notes = await db.notes.find().sort("updated_at", -1).to_list(100)
    return [Note(**n) for n in notes]

@api_router.post("/notes", response_model=Note)
async def create_note(note_data: NoteCreate):
    note = Note(**note_data.dict())
    await db.notes.insert_one(note.dict())
    return note

@api_router.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, note_data: NoteUpdate):
    existing = await db.notes.find_one({"id": note_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = {k: v for k, v in note_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.notes.update_one({"id": note_id}, {"$set": update_data})
    updated = await db.notes.find_one({"id": note_id})
    return Note(**updated)

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    result = await db.notes.delete_one({"id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

# ============== Seed Data ==============

async def seed_database():
    """Seed the database with initial UCC IT Department data"""
    
    # Check if data already exists
    faculty_count = await db.faculty.count_documents({})
    if faculty_count > 0:
        logging.info("Database already seeded")
        return
    
    logging.info("Seeding database with UCC Connect data...")
    
    # Faculty Members
    faculty_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Marcus Johnson",
            "role": "HOD",
            "title": "Head of Department - Information Technology",
            "email": "m.johnson@ucc.edu.jm",
            "phone": "+1 (876) 555-0101",
            "office": "IT Building, Room 301",
            "bio": "Dr. Johnson brings over 20 years of experience in computer science and IT education. He specializes in software engineering and systems architecture.",
            "specialization": "Software Engineering, Systems Architecture",
            "office_hours": "Monday & Wednesday: 10:00 AM - 2:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Prof. Angela Williams",
            "role": "Lecturer",
            "title": "Senior Lecturer - Database Systems",
            "email": "a.williams@ucc.edu.jm",
            "phone": "+1 (876) 555-0102",
            "office": "IT Building, Room 205",
            "bio": "Professor Williams is an expert in database management systems with extensive industry experience at major tech companies.",
            "specialization": "Database Design, Data Analytics",
            "office_hours": "Tuesday & Thursday: 1:00 PM - 4:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Kevin Brown",
            "role": "Lecturer",
            "title": "Lecturer - Mobile Development",
            "email": "k.brown@ucc.edu.jm",
            "phone": "+1 (876) 555-0103",
            "office": "IT Building, Room 208",
            "bio": "Dr. Brown specializes in mobile application development for both Android and iOS platforms.",
            "specialization": "Mobile Development, Android, iOS",
            "office_hours": "Monday & Friday: 9:00 AM - 12:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ms. Patricia Campbell",
            "role": "Lecturer",
            "title": "Lecturer - Web Technologies",
            "email": "p.campbell@ucc.edu.jm",
            "phone": "+1 (876) 555-0104",
            "office": "IT Building, Room 210",
            "bio": "Ms. Campbell is passionate about web development and modern frontend frameworks.",
            "specialization": "Web Development, React, Node.js",
            "office_hours": "Wednesday & Friday: 2:00 PM - 5:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mr. David Thompson",
            "role": "Lecturer",
            "title": "Lecturer - Network Administration",
            "email": "d.thompson@ucc.edu.jm",
            "phone": "+1 (876) 555-0105",
            "office": "IT Building, Room 212",
            "bio": "Mr. Thompson has extensive experience in network infrastructure and cybersecurity.",
            "specialization": "Networking, Cybersecurity, Linux",
            "office_hours": "Tuesday & Thursday: 10:00 AM - 1:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mrs. Sandra Reid",
            "role": "Admin",
            "title": "Administrative Assistant",
            "email": "s.reid@ucc.edu.jm",
            "phone": "+1 (876) 555-0106",
            "office": "IT Building, Room 101",
            "bio": "Mrs. Reid handles all administrative matters for the IT Department.",
            "specialization": "Administration, Student Services",
            "office_hours": "Monday - Friday: 8:00 AM - 4:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Dr. Michelle Grant",
            "role": "Lecturer",
            "title": "Senior Lecturer - AI & Machine Learning",
            "email": "m.grant@ucc.edu.jm",
            "phone": "+1 (876) 555-0107",
            "office": "IT Building, Room 215",
            "bio": "Dr. Grant leads research in artificial intelligence and machine learning applications.",
            "specialization": "AI, Machine Learning, Data Science",
            "office_hours": "Monday & Wednesday: 2:00 PM - 5:00 PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mr. Robert Clarke",
            "role": "Admin",
            "title": "IT Lab Technician",
            "email": "r.clarke@ucc.edu.jm",
            "phone": "+1 (876) 555-0108",
            "office": "IT Lab, Room 105",
            "bio": "Mr. Clarke manages the IT labs and provides technical support to students.",
            "specialization": "Technical Support, Hardware",
            "office_hours": "Monday - Friday: 8:00 AM - 5:00 PM"
        }
    ]
    
    # Courses
    courses_data = [
        {
            "id": str(uuid.uuid4()),
            "code": "ITT101",
            "title": "Introduction to Information Technology",
            "credits": 3,
            "description": "This foundational course provides an overview of information technology concepts, including computer hardware, software, networks, and the role of IT in modern organizations.",
            "prerequisites": [],
            "lecturer": "Prof. Angela Williams",
            "semester": "Fall 2027",
            "assessment_methods": ["Midterm Exam (30%)", "Final Exam (40%)", "Assignments (20%)", "Participation (10%)"],
            "learning_outcomes": ["Understand basic IT concepts", "Identify computer components", "Explain network fundamentals"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT201",
            "title": "Programming Fundamentals",
            "credits": 4,
            "description": "Learn the basics of programming using Python. Topics include variables, control structures, functions, and object-oriented programming principles.",
            "prerequisites": ["ITT101"],
            "lecturer": "Dr. Kevin Brown",
            "semester": "Fall 2027",
            "assessment_methods": ["Coding Assignments (40%)", "Midterm Project (20%)", "Final Project (30%)", "Quizzes (10%)"],
            "learning_outcomes": ["Write basic Python programs", "Apply OOP concepts", "Debug and test code"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT301",
            "title": "Database Management Systems",
            "credits": 4,
            "description": "Comprehensive study of database design, SQL, normalization, and database administration. Hands-on experience with MySQL and PostgreSQL.",
            "prerequisites": ["ITT201"],
            "lecturer": "Prof. Angela Williams",
            "semester": "Spring 2027",
            "assessment_methods": ["Database Projects (35%)", "Midterm Exam (25%)", "Final Exam (30%)", "Lab Work (10%)"],
            "learning_outcomes": ["Design relational databases", "Write complex SQL queries", "Implement database security"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT320",
            "title": "Web Application Development",
            "credits": 4,
            "description": "Build modern web applications using HTML5, CSS3, JavaScript, and popular frameworks. Learn both frontend and backend development.",
            "prerequisites": ["ITT201", "ITT301"],
            "lecturer": "Ms. Patricia Campbell",
            "semester": "Spring 2027",
            "assessment_methods": ["Web Projects (40%)", "Midterm (20%)", "Final Project (30%)", "Presentations (10%)"],
            "learning_outcomes": ["Create responsive websites", "Use modern JavaScript frameworks", "Build REST APIs"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT350",
            "title": "Network Fundamentals",
            "credits": 3,
            "description": "Study of computer networking concepts including TCP/IP, routing, switching, and network security fundamentals.",
            "prerequisites": ["ITT101"],
            "lecturer": "Mr. David Thompson",
            "semester": "Fall 2027",
            "assessment_methods": ["Lab Practicals (35%)", "Midterm Exam (25%)", "Final Exam (30%)", "Assignments (10%)"],
            "learning_outcomes": ["Configure network devices", "Implement network security", "Troubleshoot network issues"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT420",
            "title": "Mobile Application Development",
            "credits": 4,
            "description": "Design and develop mobile applications for Android and iOS platforms using modern frameworks and development tools.",
            "prerequisites": ["ITT201", "ITT320"],
            "lecturer": "Dr. Kevin Brown",
            "semester": "Spring 2027",
            "assessment_methods": ["App Projects (45%)", "Midterm (15%)", "Final Project (30%)", "Code Reviews (10%)"],
            "learning_outcomes": ["Build native mobile apps", "Implement mobile UI/UX", "Deploy to app stores"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT430",
            "title": "Artificial Intelligence",
            "credits": 4,
            "description": "Introduction to AI concepts including machine learning, neural networks, natural language processing, and computer vision.",
            "prerequisites": ["ITT201", "ITT301"],
            "lecturer": "Dr. Michelle Grant",
            "semester": "Spring 2027",
            "assessment_methods": ["AI Projects (40%)", "Research Paper (20%)", "Final Exam (25%)", "Presentations (15%)"],
            "learning_outcomes": ["Implement ML algorithms", "Build AI models", "Apply AI to real problems"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT450",
            "title": "Cybersecurity Fundamentals",
            "credits": 3,
            "description": "Learn essential cybersecurity concepts including threat analysis, cryptography, ethical hacking, and security compliance.",
            "prerequisites": ["ITT350"],
            "lecturer": "Mr. David Thompson",
            "semester": "Fall 2027",
            "assessment_methods": ["Security Labs (35%)", "Case Studies (20%)", "Final Exam (30%)", "Group Project (15%)"],
            "learning_outcomes": ["Identify security threats", "Implement security measures", "Conduct security audits"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT480",
            "title": "Cloud Computing",
            "credits": 3,
            "description": "Explore cloud computing platforms, services, and deployment models. Hands-on experience with AWS, Azure, and Google Cloud.",
            "prerequisites": ["ITT350", "ITT320"],
            "lecturer": "Dr. Marcus Johnson",
            "semester": "Spring 2027",
            "assessment_methods": ["Cloud Projects (40%)", "Certifications (20%)", "Final Exam (25%)", "Labs (15%)"],
            "learning_outcomes": ["Deploy cloud applications", "Manage cloud resources", "Implement cloud security"]
        },
        {
            "id": str(uuid.uuid4()),
            "code": "ITT499",
            "title": "IT Capstone Project",
            "credits": 6,
            "description": "Apply all learned skills in a comprehensive final project. Students work in teams to develop a complete IT solution for a real-world problem.",
            "prerequisites": ["ITT420", "ITT430"],
            "lecturer": "Dr. Marcus Johnson",
            "semester": "Spring 2027",
            "assessment_methods": ["Project Development (50%)", "Documentation (20%)", "Presentation (20%)", "Peer Review (10%)"],
            "learning_outcomes": ["Lead IT projects", "Work in teams", "Deliver professional solutions"]
        }
    ]
    
    # Announcements
    announcements_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Welcome to Spring Semester 2027",
            "content": "Welcome back to all IT students! Classes begin January 15th. Please check your course schedules and ensure you have completed registration.",
            "category": "Notice",
            "date": "2027-01-10",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Midterm Examination Schedule",
            "content": "Midterm examinations will be held from February 20-27. Detailed schedules will be posted on Moodle. Prepare accordingly.",
            "category": "Deadline",
            "date": "2027-02-15",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Guest Lecture: Future of AI in Jamaica",
            "content": "Join us for an exciting seminar featuring industry experts discussing AI applications in the Caribbean region. IT Lab, March 5th at 2PM.",
            "category": "Seminar",
            "date": "2027-03-01",
            "important": False
        },
        {
            "id": str(uuid.uuid4()),
            "title": "IT Department Career Fair",
            "content": "Annual career fair featuring top tech companies. Bring your resumes! March 15th, 9AM - 4PM at the Main Auditorium.",
            "category": "Event",
            "date": "2027-03-10",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Course Registration Opens",
            "content": "Registration for Summer semester courses opens April 1st. Plan your courses early and consult with your advisor.",
            "category": "Notice",
            "date": "2027-03-25",
            "important": False
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Hackathon: Code for Change",
            "content": "48-hour hackathon challenging students to build solutions for social good. Prizes include internships and tech gear!",
            "category": "Event",
            "date": "2027-04-05",
            "important": False
        }
    ]
    
    # FAQs
    faqs_data = [
        {
            "id": str(uuid.uuid4()),
            "question": "How do I access Moodle?",
            "answer": "Visit moodle.ucc.edu.jm and log in with your student credentials (Student ID and password). If you're having trouble, contact IT Support.",
            "category": "Academic"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "What are the lab hours?",
            "answer": "IT Labs are open Monday-Friday 8AM-8PM and Saturday 9AM-3PM. Extended hours during exam periods.",
            "category": "Facilities"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "How can I request a consultation with a lecturer?",
            "answer": "Use the UCC Connect app to send a consultation request, or email the lecturer directly with your preferred times.",
            "category": "Academic"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "What is the add/drop deadline?",
            "answer": "You have two weeks from the start of semester to add or drop courses without penalty. Check the academic calendar for exact dates.",
            "category": "Academic"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "How do I get my student ID card?",
            "answer": "Visit the Student Services office in the Administration Building with a valid government ID. Allow 3-5 business days for processing.",
            "category": "Administrative"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "Is there parking available for students?",
            "answer": "Yes, student parking is available in Lots B and C. Parking permits can be obtained from Campus Security.",
            "category": "Facilities"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "What programming languages are taught?",
            "answer": "Our curriculum includes Python, Java, JavaScript, C++, SQL, and various frameworks like React, Node.js, and Django.",
            "category": "Academic"
        },
        {
            "id": str(uuid.uuid4()),
            "question": "How can I apply for graduation?",
            "answer": "Apply through the Student Portal at least 3 months before your expected graduation date. Ensure all requirements are met.",
            "category": "Administrative"
        }
    ]
    
    # Resources
    resources_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Moodle Learning Platform",
            "description": "Access course materials, assignments, and grades",
            "url": "https://moodle.ucc.edu.jm",
            "category": "Learning",
            "icon": "school"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Student Portal",
            "description": "View your academic records and register for courses",
            "url": "https://portal.ucc.edu.jm",
            "category": "Administrative",
            "icon": "person"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Library Resources",
            "description": "Access digital library, journals, and research databases",
            "url": "https://library.ucc.edu.jm",
            "category": "Learning",
            "icon": "library"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "IT Career Resources",
            "description": "Resume templates, interview tips, and job listings",
            "url": "https://careers.ucc.edu.jm/it",
            "category": "Career",
            "icon": "work"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "GitHub Student Pack",
            "description": "Free developer tools for UCC students",
            "url": "https://education.github.com/pack",
            "category": "Development",
            "icon": "code"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Microsoft Azure for Students",
            "description": "Free Azure credits for learning cloud computing",
            "url": "https://azure.microsoft.com/free/students",
            "category": "Development",
            "icon": "cloud"
        }
    ]
    
    # Emergency Contacts
    emergency_contacts_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Campus Security",
            "role": "24/7 Emergency Response",
            "phone": "+1 (876) 555-9111",
            "email": "security@ucc.edu.jm",
            "available": "24/7"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "IT Help Desk",
            "role": "Technical Support",
            "phone": "+1 (876) 555-0199",
            "email": "helpdesk@ucc.edu.jm",
            "available": "Mon-Fri: 8AM-6PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Student Counseling",
            "role": "Mental Health Support",
            "phone": "+1 (876) 555-0150",
            "email": "counseling@ucc.edu.jm",
            "available": "Mon-Fri: 9AM-5PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Medical Center",
            "role": "Health Services",
            "phone": "+1 (876) 555-0175",
            "email": "health@ucc.edu.jm",
            "available": "Mon-Fri: 8AM-4PM"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "IT Department Office",
            "role": "Academic Support",
            "phone": "+1 (876) 555-0100",
            "email": "it.dept@ucc.edu.jm",
            "available": "Mon-Fri: 8AM-5PM"
        }
    ]
    
    # Deadlines
    deadlines_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Course Add/Drop Deadline",
            "description": "Last day to add or drop courses without penalty",
            "date": "2027-01-29",
            "category": "Registration",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "ITT420 Project Proposal Due",
            "description": "Submit your mobile app project proposal",
            "date": "2027-02-05",
            "category": "Assignment",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Midterm Exams Begin",
            "description": "Mid-semester examination period starts",
            "date": "2027-02-20",
            "category": "Exam",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "ITT301 Database Project Due",
            "description": "Final database project submission",
            "date": "2027-03-10",
            "category": "Assignment",
            "important": False
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Scholarship Application Deadline",
            "description": "Apply for IT Department scholarships",
            "date": "2027-03-15",
            "category": "Administrative",
            "important": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Final Exams Begin",
            "description": "End of semester examination period",
            "date": "2027-04-20",
            "category": "Exam",
            "important": True
        }
    ]
    
    # Insert all data
    await db.faculty.insert_many(faculty_data)
    await db.courses.insert_many(courses_data)
    await db.announcements.insert_many(announcements_data)
    await db.faqs.insert_many(faqs_data)
    await db.resources.insert_many(resources_data)
    await db.emergency_contacts.insert_many(emergency_contacts_data)
    await db.deadlines.insert_many(deadlines_data)
    
    logging.info("Database seeded successfully!")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
