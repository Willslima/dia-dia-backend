import { Sequelize, DataTypes, Model } from 'sequelize'
import bcrypt from 'bcrypt'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
})

class User extends Model {
  username!: string
  email!: string
  password!: string

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.getDataValue('password'))
  }
}

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
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        // Antes de criar o usuário, criptografa a senha
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(user.password, saltRounds)
        user.password = hashedPassword
      }
    }
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
    throw error
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
