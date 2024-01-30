import 'express-async-errors'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import {
  testConnection,
  Database,
  createUser,
  hashPassword
} from './models/usuario'
import { DiarioDatabase, createDiario } from './models/registro'

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

    // Se uma nova senha foi fornecida, codificar a senha antes de atualizar
    if (password) {
      const hashedPassword = await hashPassword(password)
      await userToUpdate.update({
        username: username || userToUpdate.username,
        email: email || userToUpdate.email,
        password: hashedPassword
      })
    } else {
      // Se nenhuma nova senha foi fornecida, atualizar sem alterar a senha
      await userToUpdate.update({
        username: username || userToUpdate.username,
        email: email || userToUpdate.email
      })
    }

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

app.get('/diario', async (req: Request, res: Response) => {
  res.status(200)
  const Diario = await DiarioDatabase()
  const result = await Diario.findAll()
  res.send(result)
})

app.get('/diario/:idUsuario', async (req: Request, res: Response) => {
  try {
    const idUsuario = req.params.idUsuario

    // Validar se o idUsuario é um número
    if (isNaN(Number(idUsuario))) {
      return res.status(400).json({ error: 'idUsuario deve ser um número' })
    }

    const User = await Database()
    const Diario = await DiarioDatabase()

    // Verificar se o usuário existe
    const user = await User.findByPk(idUsuario)

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Buscar diários associados ao usuário
    const diarios = await Diario.findAll({
      where: { idUsuario: Number(idUsuario) }
    })

    res.status(200).json(diarios)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao pesquisar diário por idUsuario' })
  }
})

app.post('/diario', async (req: Request, res: Response) => {
  try {
    const diarioData = req.body

    // Validação básica dos dados
    if (!diarioData.diasDaSemana || !diarioData.data || !diarioData.treino) {
      return res
        .status(400)
        .json({ error: 'Dias da semana, data e treino são obrigatórios' })
    }

    const Diario = await DiarioDatabase()

    // Crie uma nova entrada no diário
    const newDiarioEntry = await createDiario(diarioData)

    // Responda com os detalhes da nova entrada
    res.status(201).json(newDiarioEntry)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao criar entrada no diário' })
  }
})

app.put('/diario/:idDiario', async (req: Request, res: Response) => {
  try {
    const idDiario = req.params.idDiario
    const diarioData = req.body

    // Validar se o idDiario é um número
    if (isNaN(Number(idDiario))) {
      return res.status(400).json({ error: 'idDiario deve ser um número' })
    }

    const Diario = await DiarioDatabase()

    // Verificar se a entrada no diário existe
    const diarioToUpdate = await Diario.findByPk(idDiario)

    if (!diarioToUpdate) {
      return res.status(404).json({ error: 'Entrada no diário não encontrada' })
    }

    // Atualizar os dados da entrada no diário
    await diarioToUpdate.update(diarioData)

    res.status(200).json(diarioToUpdate)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar entrada no diário' })
  }
})

app.delete('/diario/:idDiario', async (req: Request, res: Response) => {
  try {
    const idDiario = req.params.idDiario

    const Diario = await DiarioDatabase()

    // Buscar usuário pelo ID
    const diarioToDelete = await Diario.findByPk(idDiario)

    // Verificar se o usuário existe
    if (!diarioToDelete) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Excluir o usuário
    await diarioToDelete.destroy()

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
