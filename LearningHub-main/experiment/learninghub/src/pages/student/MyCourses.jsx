import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisteredCoursesViewer = () => {
  const [username, setUsername] = useState("");
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load logged-in user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.username) {
      setUsername(storedUser.username);
    } else {
      setError("Username is missing. Please log in.");
    }
  }, []);

  // Fetch all courses created by the instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `http://localhost:8083/courses?username=${username}`
        );

        if (!response.ok) throw new Error("Failed to fetch courses.");

        const data = await response.json();
        console.log("Fetched Courses:", data);

        setCourses(data);
        setError("");
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      }
    };

    if (username) fetchCourses();
  }, [username]);

  const handleViewContent = (courseId) => {
    navigate(`/course-content-view?courseId=${courseId}&username=${username}`);
  };

  return (
    <div className="styled-section">
      <h2 className="styled-title">My Courses</h2>
      {error && <p className="error-message">{error}</p>}

      {courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-info">
                <h3>{course.title}</h3>

                <div className="course-meta">
                  <span>
                    <strong>Course ID:</strong> {course.coursed}
                  </span>
                  <span>
                    <strong>Description:</strong> {course.description}
                  </span>
                  <span>
                    <strong>Duration:</strong> {course.time} hours
                  </span>
                </div>

                <button
                  className="view-course-button"
                  onClick={() => handleViewContent(course.coursed)}
                >
                  View Course Content
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="empty-courses">
            <p>No courses found.</p>
            <p>Add a course to get started!</p>
          </div>
        )
      )}

      {/* Inline CSS */}
      <style jsx>{`
        .styled-section {
          padding: 30px;
          background: white;
          border-radius: 12px;
          margin: 20px;
        }

        .styled-title {
          font-size: 28px;
          color: rgb(33, 118, 203);
          text-align: center;
          border-bottom: 2px solid #6ac1c5;
          padding-bottom: 10px;
          margin-bottom: 25px;
          display: inline-block;
        }

        .error-message {
          color: #f44336;
          background: rgba(244, 67, 54, 0.1);
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .course-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border-top: 4px solid #6ac1c5;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: 0.3s;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .course-info h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .course-meta span {
          display: block;
          margin-bottom: 10px;
          color: #555;
        }

        .view-course-button {
          background: linear-gradient(135deg, #6ac1c5, #bda5ff);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
        }

        .view-course-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(106, 193, 197, 0.3);
        }

        .empty-courses {
          background: white;
          padding: 30px;
          text-align: center;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default RegisteredCoursesViewer;
