import { Sequelize, DataTypes, Model } from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
})

class Diario extends Model {
  idUsuario!: number
  diasDaSemana!: string
  data!: Date
  treino!: string
  leuHoje!: boolean
  tirouFoto!: boolean
  dieta!: boolean
  lembrete!: string
  foto!: string
  lendo!: string
  textArea!: string

  static associate(models: any) {
    Diario.belongsTo(models.User, { foreignKey: 'idUsuario' })
  }
}

Diario.init(
  {
    idUsuario: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    diasDaSemana: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false
    },
    treino: {
      type: DataTypes.STRING,
      allowNull: false
    },
    leuHoje: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    tirouFoto: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    dieta: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    lembrete: {
      type: DataTypes.STRING
    },
    foto: {
      type: DataTypes.STRING
    },
    lendo: {
      type: DataTypes.STRING
    },
    textArea: {
      type: DataTypes.STRING
    }
  },
  {
    sequelize,
    modelName: 'Diario'
  }
)

export async function createDiario(diarioData: {
  idUsuario: number
  diasDaSemana: string
  data: Date
  treino: string
  leuHoje: boolean
  tirouFoto: boolean
  dieta: boolean
  lembrete: string
  foto: string
  lendo: string
  textArea: string
}) {
  try {
    const newDiario = await Diario.create(diarioData)
    console.log('Diário entry created successfully:', newDiario.toJSON())
    return newDiario
  } catch (error) {
    console.error('Error creating diário entry:', error)
    throw error
  }
}

export async function testDiarioConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection to Diario table has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the Diario table:', error)
  }
}

export async function DiarioDatabase() {
  await Diario.sync()
  return Diario
}
