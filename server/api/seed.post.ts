export default defineEventHandler(async (event) => {
  const sampleUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: 'password123',
    },
  ]

  await useStorage('data').setItem('users', sampleUsers)

  return {
    success: true,
    message: 'Sample users created successfully',
    users: sampleUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })),
  }
})
