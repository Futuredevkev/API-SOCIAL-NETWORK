#Generar Migración

npm run typeorm -- migration:generate src/database/migrations/MigrationName -d ./src/config/typeorm.ts

#Ejecutar las Migracion

npm run migration:run

#Revertir migración

npm run migration:revert

#Mostrar el Estado de las Migraciones

npm run migration:show
