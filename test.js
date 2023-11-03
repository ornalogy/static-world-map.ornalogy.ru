import { resolve } from 'path'
import { fastify } from 'fastify'
import { fastifyStatic } from '@fastify/static'

const rootPort = 8080

const app = fastify()

app.register(fastifyStatic, {
  root: resolve('docs'),
  prefix: '/'
})

app.ready(async err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    try {
      await app.listen({ host: '0.0.0.0', port: rootPort })
      console.log(`App listening at http://localhost:${rootPort}`)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
})

