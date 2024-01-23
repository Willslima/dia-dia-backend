import { Sequelize, DataTypes, Model } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../data/database.sqlite'
})

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'User'
  }
)

// Função para criar um novo usuário
export async function createUser(userData: {
  username: string
  email: string
  password: string
}) {
  try {
    const newUser = await User.create(userData)
    console.log('User created successfully:', newUser.toJSON())
    return newUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error // Rejeita a promise para que o erro possa ser tratado por quem chama a função
  }
}

export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

export async function Database() {
  await sequelize.sync()
  return User
}
