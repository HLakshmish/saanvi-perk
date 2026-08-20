async function test() {
    const res = await fetch('http://localhost:5000/api/users/', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaW5ub3ZhdGVzb2Z0LmNvbSIsInJvbGUiOiJTVVBFUkFETUlOIiwiY29tcGFueUlkIjoxLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc4NzE0MTg0NH0.uONjiRbtyVQhj51_7tRgYOyHkrsC4lQY5ra-2-mnrIk',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeCode: "TEST-" + Math.random(),
          roleIds: [ 1 ],
          departmentId: 1,
          designationId: 1,
          firstName: "John",
          lastName: "Doe",
          officialEmail: "test" + Math.random() + "@example.com",
          phoneNumber: "1234567890",
          password: "password123",
          employmentType: "FULL_TIME",
          joiningDate: "2026-08-19T00:00:00.000Z",
          dateOfBirth: "1990-05-15",
          status: "ACTIVE",
          companyId: 1
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
