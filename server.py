#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import threading
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "server_data"
TRANSPORT_STATE_FILE = DATA_DIR / "transport_state.json"
STUDENTS_FILE = DATA_DIR / "students.json"
DRIVERS_FILE = DATA_DIR / "drivers.json"
HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))
FARE_PER_RIDE = 20
STATE_VERSION = 2
DATA_LOCK = threading.Lock()


DEFAULT_TRANSPORT_STATE = {
    "version": STATE_VERSION,
    "buses": [
        {
            "id": "VIT-MH",
            "code": "Mens Loop",
            "shuttleNumber": "MH-01",
            "routeName": "Men's Hostel Shuttle",
            "driver": "Rahul Nair",
            "status": "On Time",
            "etaMinutes": 5,
            "etaProvider": "Schedule",
            "nextStop": "Tunnel H Block",
            "totalSeats": 40,
            "availableSeats": 27,
            "note": "Main Gate to Men's Hostel loop via SMV, tunnel, food court, Enzo, and hostel blocks.",
            "routePath": [
                "Main Gate",
                "SMV",
                "Tunnel H Block",
                "One Food World",
                "Enzo",
                "K Block",
                "L Block",
                "R/M Block",
                "N Block",
            ],
            "currentLocationLabel": "SMV",
            "currentLat": None,
            "currentLng": None,
            "sensorProvider": "Demo",
            "updatedAt": "2026-04-01T10:00:00Z",
        },
        {
            "id": "VIT-LA",
            "code": "Ladies Acad",
            "shuttleNumber": "LH-01",
            "routeName": "Ladies Hostel Shuttle",
            "driver": "Priya Menon",
            "status": "Boarding",
            "etaMinutes": 7,
            "etaProvider": "Schedule",
            "nextStop": "Health Center",
            "totalSeats": 40,
            "availableSeats": 31,
            "note": "Main Gate to ladies hostel and academic loop via Health Center, Anna Audi, SMV, G/H Ladies, TT, SJT, PRP, and MGB.",
            "routePath": [
                "Main Gate",
                "Health Center",
                "Anna Audi",
                "SMV",
                "G/H Ladies Block",
                "TT",
                "SJT",
                "PRP",
                "MGB",
                "Main Gate",
            ],
            "currentLocationLabel": "Main Gate",
            "currentLat": None,
            "currentLng": None,
            "sensorProvider": "Demo",
            "updatedAt": "2026-04-01T10:04:00Z",
        },
    ],
    "notifications": [
        {
            "id": "VIT-LA-seed-1",
            "busId": "VIT-LA",
            "title": "Boarding Update",
            "message": "Ladies Hostel Shuttle is boarding at Main Gate before leaving for Health Center.",
            "createdAt": "2026-04-01T10:01:00Z",
        },
        {
            "id": "VIT-MH-seed-1",
            "busId": "VIT-MH",
            "title": "Arrival Notice",
            "message": "Men's Hostel Shuttle is passing SMV and will reach Tunnel H Block in approximately 5 minutes.",
            "createdAt": "2026-04-01T10:02:00Z",
        },
    ],
}

DEFAULT_STUDENT_STORE = {
    "students": {},
    "sessions": {},
}

DEFAULT_DRIVER_STORE = {
    "drivers": {
        "DRV001": {
            "driverId": "DRV001",
            "password": "driver123",
            "name": "Campus Driver 1",
            "createdAt": "2026-04-01T10:00:00Z",
        }
    },
    "sessions": {},
}


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def create_empty_payments() -> dict:
    return {
        "totalDue": 0,
        "rideCount": 0,
        "history": [],
    }


def deep_clone(value):
    return deepcopy(value)


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_transport_state(payload: dict | None) -> dict:
    base = deep_clone(DEFAULT_TRANSPORT_STATE)
    if not isinstance(payload, dict):
        return base

    result = {
        "version": STATE_VERSION,
        "buses": [],
        "notifications": payload.get("notifications") if isinstance(payload.get("notifications"), list) else base["notifications"],
    }

    payload_buses = payload.get("buses")
    if isinstance(payload_buses, list) and payload_buses:
        for index, bus_payload in enumerate(payload_buses):
            template = base["buses"][index % len(base["buses"])]
            if isinstance(bus_payload, dict):
                result["buses"].append({**template, **bus_payload})
        if not result["buses"]:
            result["buses"] = base["buses"]
    else:
        result["buses"] = base["buses"]

    result["notifications"] = result["notifications"][:10]
    return result


def normalize_student_store(payload: dict | None) -> dict:
    base = deep_clone(DEFAULT_STUDENT_STORE)
    if not isinstance(payload, dict):
        return base
    base["students"] = payload.get("students") if isinstance(payload.get("students"), dict) else {}
    base["sessions"] = payload.get("sessions") if isinstance(payload.get("sessions"), dict) else {}
    return base


def normalize_driver_store(payload: dict | None) -> dict:
    base = deep_clone(DEFAULT_DRIVER_STORE)
    if not isinstance(payload, dict):
        return base
    base["drivers"] = payload.get("drivers") if isinstance(payload.get("drivers"), dict) else base["drivers"]
    base["sessions"] = payload.get("sessions") if isinstance(payload.get("sessions"), dict) else {}
    return base


def ensure_data_files() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    if not TRANSPORT_STATE_FILE.exists():
        write_json(TRANSPORT_STATE_FILE, DEFAULT_TRANSPORT_STATE)
    if not STUDENTS_FILE.exists():
        write_json(STUDENTS_FILE, DEFAULT_STUDENT_STORE)
    if not DRIVERS_FILE.exists():
        write_json(DRIVERS_FILE, DEFAULT_DRIVER_STORE)


def load_transport_state() -> dict:
    return normalize_transport_state(read_json(TRANSPORT_STATE_FILE))


def save_transport_state(payload: dict) -> dict:
    normalized = normalize_transport_state(payload)
    write_json(TRANSPORT_STATE_FILE, normalized)
    return normalized


def load_student_store() -> dict:
    return normalize_student_store(read_json(STUDENTS_FILE))


def save_student_store(payload: dict) -> dict:
    normalized = normalize_student_store(payload)
    write_json(STUDENTS_FILE, normalized)
    return normalized


def load_driver_store() -> dict:
    return normalize_driver_store(read_json(DRIVERS_FILE))


def save_driver_store(payload: dict) -> dict:
    normalized = normalize_driver_store(payload)
    write_json(DRIVERS_FILE, normalized)
    return normalized


def require_session_token(handler: "ShuttleRequestHandler", student_store: dict) -> tuple[str | None, dict | None]:
    token = handler.headers.get("X-Session-Token", "").strip()
    if not token:
        return None, None
    session = student_store["sessions"].get(token)
    if not isinstance(session, dict):
        return None, None
    regno = str(session.get("regno", "")).strip().upper()
    student = student_store["students"].get(regno)
    if not regno or not isinstance(student, dict):
        return None, None
    return token, student


def require_driver_session(handler: "ShuttleRequestHandler", driver_store: dict) -> tuple[str | None, dict | None]:
    token = handler.headers.get("X-Driver-Session-Token", "").strip()
    if not token:
        return None, None
    session = driver_store["sessions"].get(token)
    if not isinstance(session, dict):
        return None, None
    driver_id = str(session.get("driverId", "")).strip().upper()
    driver = driver_store["drivers"].get(driver_id)
    if not driver_id or not isinstance(driver, dict):
        return None, None
    return token, driver


class ShuttleRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def log_message(self, format: str, *args) -> None:
        return

    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def parse_json_body(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0") or "0")
        if content_length <= 0:
            return {}
        raw_body = self.rfile.read(content_length)
        if not raw_body:
            return {}
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            return {}
        return payload if isinstance(payload, dict) else {}

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/health":
            self.send_json(HTTPStatus.OK, {"status": "ok", "time": iso_now()})
            return

        if parsed.path == "/api/transport-state":
            with DATA_LOCK:
                state = load_transport_state()
            self.send_json(HTTPStatus.OK, {"state": state})
            return

        if parsed.path == "/api/student-profile":
            with DATA_LOCK:
                student_store = load_student_store()
                _, student = require_session_token(self, student_store)
                if not student:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Student session expired. Log in again."})
                    return

                self.send_json(
                    HTTPStatus.OK,
                    {
                        "student": {
                            "regno": student["regno"],
                            "loggedInAt": student.get("lastLoginAt", ""),
                        },
                        "payments": student.get("payments", create_empty_payments()),
                    },
                )
            return

        if parsed.path == "/api/driver-profile":
            with DATA_LOCK:
                driver_store = load_driver_store()
                _, driver = require_driver_session(self, driver_store)
                if not driver:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Driver session expired. Log in again."})
                    return

                self.send_json(
                    HTTPStatus.OK,
                    {
                        "driver": {
                            "driverId": driver["driverId"],
                            "name": driver.get("name", driver["driverId"]),
                        }
                    },
                )
            return

        return super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        payload = self.parse_json_body()

        if parsed.path == "/api/student-signup":
            regno = str(payload.get("regno", "")).strip().upper()
            password = str(payload.get("password", "")).strip()
            if not regno or not password:
                self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Enter registration number and password."})
                return

            with DATA_LOCK:
                student_store = load_student_store()
                if regno in student_store["students"]:
                    self.send_json(HTTPStatus.CONFLICT, {"error": "Student account already exists. Please log in."})
                    return

                student_store["students"][regno] = {
                    "regno": regno,
                    "password": password,
                    "payments": create_empty_payments(),
                    "createdAt": iso_now(),
                }
                save_student_store(student_store)

            self.send_json(
                HTTPStatus.CREATED,
                {
                    "status": "created",
                    "student": {
                        "regno": regno,
                    },
                },
            )
            return

        if parsed.path == "/api/student-login":
            regno = str(payload.get("regno", "")).strip().upper()
            password = str(payload.get("password", "")).strip()
            if not regno or not password:
                self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Enter registration number and password."})
                return

            with DATA_LOCK:
                student_store = load_student_store()
                student = student_store["students"].get(regno)

                if student is None or student.get("password") != password:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Invalid registration number or password."})
                    return

                token = uuid.uuid4().hex
                logged_in_at = iso_now()
                student_store["sessions"][token] = {
                    "regno": regno,
                    "createdAt": logged_in_at,
                }
                student["lastLoginAt"] = logged_in_at
                save_student_store(student_store)

            self.send_json(
                HTTPStatus.OK,
                {
                    "session": {
                        "token": token,
                        "regno": regno,
                        "loggedInAt": logged_in_at,
                    },
                    "payments": student.get("payments", create_empty_payments()),
                },
            )
            return

        if parsed.path == "/api/driver-login":
            driver_id = str(payload.get("driverId", "")).strip().upper()
            password = str(payload.get("password", "")).strip()
            if not driver_id or not password:
                self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Enter driver ID and password."})
                return

            with DATA_LOCK:
                driver_store = load_driver_store()
                driver = driver_store["drivers"].get(driver_id)

                if driver is None or driver.get("password") != password:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Invalid driver ID or password."})
                    return

                token = uuid.uuid4().hex
                driver_store["sessions"][token] = {
                    "driverId": driver_id,
                    "createdAt": iso_now(),
                }
                save_driver_store(driver_store)

            self.send_json(
                HTTPStatus.OK,
                {
                    "session": {
                        "token": token,
                        "driverId": driver_id,
                        "name": driver.get("name", driver_id),
                    }
                },
            )
            return

        if parsed.path == "/api/student-logout":
            token = self.headers.get("X-Session-Token", "").strip()
            if token:
                with DATA_LOCK:
                    student_store = load_student_store()
                    student_store["sessions"].pop(token, None)
                    save_student_store(student_store)
            self.send_json(HTTPStatus.OK, {"status": "logged-out"})
            return

        if parsed.path == "/api/driver-logout":
            token = self.headers.get("X-Driver-Session-Token", "").strip()
            if token:
                with DATA_LOCK:
                    driver_store = load_driver_store()
                    driver_store["sessions"].pop(token, None)
                    save_driver_store(driver_store)
            self.send_json(HTTPStatus.OK, {"status": "logged-out"})
            return

        if parsed.path == "/api/student/board":
            bus_id = str(payload.get("busId", "")).strip()
            if not bus_id:
                self.send_json(HTTPStatus.BAD_REQUEST, {"error": "Select a shuttle first."})
                return

            with DATA_LOCK:
                student_store = load_student_store()
                _, student = require_session_token(self, student_store)
                if not student:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Student login required."})
                    return

                transport_state = load_transport_state()
                bus = next((entry for entry in transport_state["buses"] if entry.get("id") == bus_id), None)
                if not bus:
                    self.send_json(HTTPStatus.NOT_FOUND, {"error": "Selected shuttle was not found."})
                    return
                if int(bus.get("availableSeats", 0)) <= 0:
                    self.send_json(HTTPStatus.CONFLICT, {"error": "No seats are available on this shuttle."})
                    return

                payments = student.setdefault("payments", create_empty_payments())
                payments["totalDue"] = int(payments.get("totalDue", 0)) + FARE_PER_RIDE
                payments["rideCount"] = int(payments.get("rideCount", 0)) + 1
                payments_history = payments.setdefault("history", [])
                payments_history.insert(
                    0,
                    {
                        "id": uuid.uuid4().hex,
                        "busId": bus["id"],
                        "routeName": bus["routeName"],
                        "amount": FARE_PER_RIDE,
                        "location": bus.get("currentLocationLabel", "VIT Campus"),
                        "createdAt": iso_now(),
                    },
                )
                payments["history"] = payments_history[:10]

                bus["availableSeats"] = max(0, int(bus.get("availableSeats", 0)) - 1)
                bus["sensorProvider"] = "Online passenger count"
                bus["updatedAt"] = iso_now()

                transport_state["notifications"] = [
                    {
                        "id": f"{bus['id']}-{uuid.uuid4().hex}",
                        "busId": bus["id"],
                        "title": "Boarding Charge",
                        "message": f"Rs {FARE_PER_RIDE} added for entering {bus['routeName']}.",
                        "createdAt": iso_now(),
                    },
                    *transport_state["notifications"],
                ][:10]

                save_student_store(student_store)
                save_transport_state(transport_state)

            self.send_json(
                HTTPStatus.OK,
                {
                    "payments": payments,
                    "state": transport_state,
                },
            )
            return

        if parsed.path == "/api/student/reset-payments":
            with DATA_LOCK:
                student_store = load_student_store()
                _, student = require_session_token(self, student_store)
                if not student:
                    self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "Student login required."})
                    return

                student["payments"] = create_empty_payments()
                save_student_store(student_store)

            self.send_json(HTTPStatus.OK, {"payments": student["payments"]})
            return

        self.send_json(HTTPStatus.NOT_FOUND, {"error": "API route not found."})

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        payload = self.parse_json_body()

        if parsed.path == "/api/transport-state":
            next_state = payload.get("state", payload)
            with DATA_LOCK:
                stored_state = save_transport_state(next_state)
            self.send_json(HTTPStatus.OK, {"state": stored_state})
            return

        self.send_json(HTTPStatus.NOT_FOUND, {"error": "API route not found."})


def main() -> None:
    ensure_data_files()
    server = ThreadingHTTPServer((HOST, PORT), ShuttleRequestHandler)
    print(f"Serving VIT shuttle app on http://127.0.0.1:{PORT}")
    print(f"LAN access: http://<your-local-ip>:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
