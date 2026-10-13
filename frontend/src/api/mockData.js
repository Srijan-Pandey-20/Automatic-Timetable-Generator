export const mockLoginResponse = {
  access: "mock_access_token",
  refresh: "mock_refresh_token",
  role: "admin", // "admin" | "faculty" | "student"
  user_id: 1,
  name: "Test Admin",
};

export const mockTimetable = {
  slots: [
    {
      day: "Monday",
      start_time: "09:00",
      end_time: "10:00",
      subject: "Data Structures",
      faculty: "Dr. Rao",
      room: "R101",
      section: "CS-A",
      subgroup: null, // null = lecture (whole section)
    },
    {
      day: "Monday",
      start_time: "14:00",
      end_time: "16:00",
      subject: "DS Lab",
      faculty: "Dr. Rao",
      room: "Lab-1",
      section: "CS-A",
      subgroup: "CS-A1",
    },
  ],
};