import 'express-async-errors'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { testConnection, Database, createUser } from './models/usuario'

const app = express()

app.use(morgan('tiny'))
app.use(cors())
app.use(helmet())
app.use(express.json())

// GET USERS
app.get('/users', async (req: Request, res: Response) => {
  res.status(200)
  const Users = await Database()
  const result = await Users.findAll()
  res.send(result)
})

// GET USERS WITH ID
app.get('/users/:id', async (req: Request, res: Response) => {
  const userId = req.params.id

  try {
    const Users = await Database()
    const result = await Users.findByPk(userId)
    if (result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
})

// POST REGISTER USERS
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    // Validação básica dos dados
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    const Users = await Database()

    // Crie um novo usuário no banco de dados
    const newUser = await createUser({
      username,
      email,
      password
    })

    // Responda com os detalhes do novo usuário
    res.status(201).json(newUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    const { username, email, password } = req.body

    // Validação básica dos dados
    if (!username && !email && !password) {
      return res
        .status(400)
        .json({ error: 'Nenhum dado de atualização fornecido' })
    }

    const Users = await Database()

    // Buscar usuário pelo ID
    const userToUpdate = await Users.findByPk(userId)

    // Verificar se o usuário existe
    if (!userToUpdate) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Atualizar os dados do usuário com os novos valores fornecidos
    await userToUpdate.update({
      username: username || userToUpdate.username,
      email: email || userToUpdate.email,
      password: password || userToUpdate.password
    })

    // Responda com os detalhes do usuário atualizado
    res.status(200).json(userToUpdate.toJSON())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
})

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id

    const Users = await Database()

    // Buscar usuário pelo ID
    const userToDelete = await Users.findByPk(userId)

    // Verificar se o usuário existe
    if (!userToDelete) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Excluir o usuário
    await userToDelete.destroy()

    res.status(204).send() // Responder com status 204 (No Content) indicando sucesso na exclusão
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao excluir usuário' })
  }
})

app.use(async (req: Request, res: Response, next: NextFunction) => {
  res.send('Server is running 🚀')
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send(error.message)
})

export default app
function CreateUser(arg0: { username: any; email: any; password: any }) {
  throw new Error('Function not implemented.')
}
