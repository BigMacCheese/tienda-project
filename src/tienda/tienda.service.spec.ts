import { Test, TestingModule } from '@nestjs/testing';
import { TiendaService } from './tienda.service';
import { Repository } from 'typeorm';
import { TiendaEntity } from './tienda.entity/tienda.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker/.';

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>
  let tiendasList: TiendaEntity[]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear()
    tiendasList = [];

    for(let i=0; i<5; i++){
      const tienda: TiendaEntity = await repository.save({
        nombre: faker.commerce.product(),
        ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])})
      tiendasList.push(tienda)
    }
  }

  it('findAll deberia retornar todas las tiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(tiendasList.length);
  });

  it('findOne deberia retornar una tienda por su id', async () => {
    const storedTienda: TiendaEntity = tiendasList[0];
    const tienda: TiendaEntity = await service.findOne(storedTienda.id);
    expect(tienda).not.toBeNull();
    expect(tienda.nombre).toEqual(storedTienda.nombre)
    expect(tienda.ciudad).toEqual(storedTienda.ciudad)
  });

  it('findOne deberia lanzar una excepcion para una tienda invalida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "La tienda con el id dado no existe")
  });

  it('create deberia retornar una nueva tienda', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED']),
      productos: null
    }
 
    const newTienda: TiendaEntity = await service.create(tienda);
    expect(newTienda).not.toBeNull();
 
    const storedTienda: TiendaEntity = await repository.findOne({where: {id: newTienda.id}})
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toEqual(newTienda.nombre)
    expect(storedTienda.ciudad).toEqual(newTienda.ciudad)
  });

  it('create deberia lanzar una excepcion para una tienda invalido', async () => {
    const tienda: TiendaEntity = {
      id: "",
      nombre: faker.commerce.product(),
      ciudad: 'Bogota',
      productos: null
    }
    await expect(() => service.create(tienda)).rejects.toHaveProperty("message", "La ciudad de la tienda no es un codigo de tres caracteres")
  });

  it('update deberia modificar una tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "Nuevo nombre";
    tienda.ciudad = 'MED';

    const updatedTienda: TiendaEntity = await service.update(tienda.id, tienda);
    expect(updatedTienda).not.toBeNull();

    const storedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toEqual(tienda.nombre)
    expect(storedTienda.ciudad).toEqual(tienda.ciudad)
  });

  it('update deberia lanzar una excepcion para una tienda invalida', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "Nuevo nombre";
    tienda.ciudad = 'Santa Marta';
    
    await expect(() => service.update(tienda.id, tienda)).rejects.toHaveProperty("message", "La ciudad de la tienda no es un codigo de tres caracteres")
  });

  it('delete deberia eliminar una tienda', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await service.delete(tienda.id);
    const deletedTienda: TiendaEntity = await repository.findOne({ where: { id: tienda.id } })
    expect(deletedTienda).toBeNull();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
