import { defineStore } from 'pinia';
import { FleetApi } from '../infrastructure/fleet-api.js';
import { BicycleAssembler } from '../infrastructure/bicycle.assembler.js';
import { BikePointAssembler } from '../infrastructure/bike-point.assembler.js';
import { Bicycle } from '../domain/model/bicycle.entity.js';
import { BikePoint } from '../domain/model/bikePoint.entity.js';
import { BicycleStatus } from '../domain/model/bicycle-status.enum.js';
import { BikePointStatus } from '../domain/model/bike-point-status.enum.js';

const fleetApi = new FleetApi();

export const useFleetStore = defineStore('fleet', {
    state: () => ({
        bicycles: [],
        bikePoints: [],
        errors: [],
        bicyclesLoaded: false,
        bikePointsLoaded: false,
        loading: false
    }),

    getters: {
        bicyclesCount: (state) => state.bicycles.length,
        bikePointsCount: (state) => state.bikePoints.length,
        availableBicyclesCount: (state) =>
            state.bicycles.filter(b => b.status === BicycleStatus.AVAILABLE).length,
        operationalBikePointsCount: (state) =>
            state.bikePoints.filter(bp => bp.status === BikePointStatus.OPERATIONAL).length,
        getBicycleById: (state) => (id) =>
            state.bicycles.find(b => String(b.bicycleId) === String(id)),
        getBikePointById: (state) => (id) =>
            state.bikePoints.find(bp => String(bp.bikePointId) === String(id))
    },

    actions: {
        // ==========================================
        // CARGA DE DATOS (QUERIES)
        // ==========================================
        async fetchBikePoints() {
            this.loading = true;
            try {
                const response = await fleetApi.getBikePoints();
                this.bikePoints = BikePointAssembler.toEntitiesFromResponse(response);
                this.bikePointsLoaded = true;
            } catch (error) {
                this.errors.push(error);
                console.error('Error fetching bike points:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchBicycles() {
            this.loading = true;
            try {
                const response = await fleetApi.getBicycles();
                this.bicycles = BicycleAssembler.toEntitiesFromResponse(response);
                this.bicyclesLoaded = true;
            } catch (error) {
                this.errors.push(error);
                console.error('Error fetching bicycles:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchAll() {
            await Promise.all([this.fetchBikePoints(), this.fetchBicycles()]);
        },

        // ==========================================
        // CASOS DE USO DE BIKE POINTS (ESTACIONES)
        // ==========================================
        async addBikePoint(command) {
            this.loading = true;
            try {
                const newBikePoint = new BikePoint({
                    name: command.name,
                    district: command.district,
                    address: command.address,
                    latitude: command.latitude,
                    longitude: command.longitude,
                    capacity: command.capacity,
                    currentBicyclesCount: 0,
                    status: BikePointStatus.OPERATIONAL
                });

                const payload = BikePointAssembler.toResourceFromEntity(newBikePoint);
                const response = await fleetApi.createBikePoint(payload);
                const createdEntity = BikePointAssembler.toEntityFromResource(response.data || response);
                this.bikePoints.push(createdEntity);
                return createdEntity;
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateBikePoint(bikePoint) {
            this.loading = true;
            try {
                const payload = BikePointAssembler.toResourceFromEntity(bikePoint);
                const response = await fleetApi.updateBikePoint(payload);
                const updatedEntity = BikePointAssembler.toEntityFromResource(response.data || response);
                const index = this.bikePoints.findIndex(bp => String(bp.bikePointId) === String(updatedEntity.bikePointId));
                if (index !== -1) {
                    this.bikePoints[index] = updatedEntity;
                }
                return updatedEntity;
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteBikePoint(bikePointId) {
            this.loading = true;
            try {
                // Validación de dominio: no eliminar si tiene bicicletas asignadas
                const hasBicycles = this.bicycles.some(b => String(b.currentBikePointId) === String(bikePointId));
                if (hasBicycles) {
                    throw new Error('Cannot delete BikePoint because it currently contains bicycles.');
                }
                await fleetApi.deleteBikePoint(bikePointId);
                this.bikePoints = this.bikePoints.filter(bp => String(bp.bikePointId) !== String(bikePointId));
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async disableBikePoint(bikePointId) {
            const bikePoint = this.getBikePointById(bikePointId);
            if (!bikePoint) throw new Error('BikePoint not found');
            bikePoint.disable();
            return await this.updateBikePoint(bikePoint);
        },

        async assignCapacityToBikePoint(bikePointId, newCapacity) {
            const bikePoint = this.getBikePointById(bikePointId);
            if (!bikePoint) throw new Error('BikePoint not found');
            bikePoint.assignCapacity(newCapacity);
            return await this.updateBikePoint(bikePoint);
        },

        // ==========================================
        // CASOS DE USO DE BICYCLES (FLOTA)
        // ==========================================
        async addBicycle(command) {
            this.loading = true;
            try {
                const newBicycle = new Bicycle({
                    serialNumber: command.serialNumber,
                    bikeCode: command.bikeCode,
                    qrCode: command.qrCode,
                    model: command.model,
                    status: BicycleStatus.AVAILABLE,
                    currentBikePointId: command.currentBikePointId || null
                });

                // Si se asigna a una estación inicial, validar y aumentar contador
                if (newBicycle.currentBikePointId) {
                    const bikePoint = this.getBikePointById(newBicycle.currentBikePointId);
                    if (bikePoint) {
                        bikePoint.addBicycle();
                        await this.updateBikePoint(bikePoint);
                    }
                }

                const payload = BicycleAssembler.toResourceFromEntity(newBicycle);
                const response = await fleetApi.createBicycle(payload);
                const createdEntity = BicycleAssembler.toEntityFromResource(response.data || response);
                this.bicycles.push(createdEntity);
                return createdEntity;
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateBicycle(bicycle) {
            this.loading = true;
            try {
                const payload = BicycleAssembler.toResourceFromEntity(bicycle);
                const response = await fleetApi.updateBicycle(payload);
                const updatedEntity = BicycleAssembler.toEntityFromResource(response.data || response);
                const index = this.bicycles.findIndex(b => String(b.bicycleId) === String(updatedEntity.bicycleId));
                if (index !== -1) {
                    this.bicycles[index] = updatedEntity;
                }
                return updatedEntity;
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteBicycle(bicycleId) {
            this.loading = true;
            try {
                const bicycle = this.getBicycleById(bicycleId);
                if (bicycle && bicycle.currentBikePointId) {
                    const bikePoint = this.getBikePointById(bicycle.currentBikePointId);
                    if (bikePoint) {
                        bikePoint.removeBicycle();
                        await this.updateBikePoint(bikePoint);
                    }
                }
                await fleetApi.deleteBicycle(bicycleId);
                this.bicycles = this.bicycles.filter(b => String(b.bicycleId) !== String(bicycleId));
            } catch (error) {
                this.errors.push(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async unlockBicycle(bicycleId) {
            const bicycle = this.getBicycleById(bicycleId);
            if (!bicycle) throw new Error('Bicycle not found');

            // Regla de dominio: desbloquear cambia a IN_USE y sale de la estación
            bicycle.unlock();
            if (bicycle.currentBikePointId) {
                const bikePoint = this.getBikePointById(bicycle.currentBikePointId);
                if (bikePoint) {
                    bikePoint.removeBicycle();
                    await this.updateBikePoint(bikePoint);
                }
                bicycle.removeFromBikePoint();
            }
            return await this.updateBicycle(bicycle);
        },

        async updateBicycleStatus(bicycleId, newStatus) {
            const bicycle = this.getBicycleById(bicycleId);
            if (!bicycle) throw new Error('Bicycle not found');
            bicycle.updateStatus(newStatus);
            return await this.updateBicycle(bicycle);
        },

        async assignBicycleToBikePoint(bicycleId, targetBikePointId) {
            const bicycle = this.getBicycleById(bicycleId);
            if (!bicycle) throw new Error('Bicycle not found');
            const targetBikePoint = this.getBikePointById(targetBikePointId);
            if (!targetBikePoint) throw new Error('Target BikePoint not found');


            if (bicycle.currentBikePointId && String(bicycle.currentBikePointId) !== String(targetBikePointId)) {
                const previousBikePoint = this.getBikePointById(bicycle.currentBikePointId);
                if (previousBikePoint) {
                    previousBikePoint.removeBicycle();
                    await this.updateBikePoint(previousBikePoint);
                }
            }


            targetBikePoint.addBicycle();
            await this.updateBikePoint(targetBikePoint);

            bicycle.assignToBikePoint(targetBikePointId);
            return await this.updateBicycle(bicycle);
        }
    }
});
