import request from 'supertest'
import express from 'express'
import cors from 'cors'

// Create a test app similar to the main app but without Clerk middleware for basic testing
const createTestApp = () => {
  const app = express()
  app.use(cors())
  app.use(express.json())
  
  app.get('/', (req, res) => {
    res.send('Server running 🚀')
  })
  
  return app
}

describe('Server API', () => {
  const app = createTestApp()

  describe('GET /', () => {
    it('should return server running message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
      
      expect(response.text).toBe('Server running 🚀')
    })
  })

  describe('CORS', () => {
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
      
      // CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })
})
