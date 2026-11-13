from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

# Temporary student storage
students = []
next_id = 1


class StudentServer(BaseHTTPRequestHandler):

    # Send JSON response
    def send_json(self, status, data):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        self.wfile.write(response)

    # Handle browser preflight requests
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # Read JSON data
    def read_data(self):
        length = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(length)
        return json.loads(data.decode("utf-8"))

    # CREATE
    def do_POST(self):
        global next_id

        if self.path != "/students":
            self.send_json(404, {"message": "Route not found"})
            return

        try:
            student_data = self.read_data()

            name = student_data.get("name", "").strip()
            course = student_data.get("course", "").strip()
            age = student_data.get("age")

            if (
                not name
                or not course
                or not isinstance(age, int)
                or isinstance(age, bool)
                or age <= 0
            ):
                self.send_json(
                    400,
                    {"message": "Enter valid student details"}
                )
                return

            student = {
                "id": next_id,
                "name": name,
                "age": age,
                "course": course
            }

            students.append(student)
            next_id += 1

            self.send_json(201, {
                "message": "Student added successfully!",
                "student": student
            })

        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"message": "Invalid JSON data"})

    # READ
    def do_GET(self):
        if self.path == "/students":
            self.send_json(200, {"students": students})
        else:
            self.send_json(404, {"message": "Route not found"})

    # UPDATE
    def do_PUT(self):
        try:
            student_id = int(self.path.split("/")[-1])
            updated_data = self.read_data()

            for student in students:
                if student["id"] == student_id:

                    name = updated_data.get(
                        "name", student["name"]
                    ).strip()

                    course = updated_data.get(
                        "course", student["course"]
                    ).strip()

                    age = updated_data.get("age", student["age"])

                    if (
                        not name
                        or not course
                        or not isinstance(age, int)
                        or isinstance(age, bool)
                        or age <= 0
                    ):
                        self.send_json(
                            400,
                            {"message": "Enter valid details"}
                        )
                        return

                    student.update({
                        "name": name,
                        "age": age,
                        "course": course
                    })

                    self.send_json(200, {
                        "message": "Student updated successfully!",
                        "student": student
                    })
                    return

            self.send_json(404, {"message": "Student not found"})

        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"message": "Invalid request"})

    # DELETE
    def do_DELETE(self):
        try:
            student_id = int(self.path.split("/")[-1])

            for student in students:
                if student["id"] == student_id:

                    students.remove(student)

                    self.send_json(200, {
                        "message": "Student deleted successfully!"
                    })
                    return

            self.send_json(404, {"message": "Student not found"})

        except ValueError:
            self.send_json(400, {"message": "Invalid student ID"})

    # Log requests
    def log_message(self, format, *args):
        print(format % args)


# RENDER SERVER CONFIGURATION
PORT = int(os.environ.get("PORT", 8000))

server = HTTPServer(
    ("0.0.0.0", PORT),
    StudentServer
)

print(f"Student Management Server running on port {PORT}")

server.serve_forever()
