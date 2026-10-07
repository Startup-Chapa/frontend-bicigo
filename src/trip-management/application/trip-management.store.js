/**
 * Application service store for the Trip Management bounded context.
 * It coordinates Trip and QRValidation use cases and exposes UI-facing state.
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {TripManagementApi} from "../infrastructure/trip-management-api.js";
import {TripAssembler} from "../infrastructure/trip.assembler.js";
import {QRValidationAssembler} from "../infrastructure/qr-validation.assembler.js";

const tripManagementApi = new TripManagementApi();

const useTripManagementStore = defineStore('trip-management', () => {
    const trips = ref([]);
    const qrValidations = ref([]);
    const errors = ref([]);
    const tripsLoaded = ref(false);
    const qrValidationsLoaded = ref(false);

    const tripsCount = computed(() => tripsLoaded.value ? trips.value.length : 0);
    const activeTrips = computed(() => trips.value.filter(trip => trip.status === 'IN_PROGRESS'));

    function clearSession() {
        trips.value = [];
        qrValidations.value = [];
        errors.value = [];
        tripsLoaded.value = false;
        qrValidationsLoaded.value = false;
    }

    function fetchTrips() {
        return tripManagementApi.getTrips().then(response => {
            trips.value = TripAssembler.toEntitiesFromResponse(response);
            tripsLoaded.value = true;
            return trips.value;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    function fetchQRValidations() {
        return tripManagementApi.getQRValidations().then(response => {
            qrValidations.value = QRValidationAssembler.toEntitiesFromResponse(response);
            qrValidationsLoaded.value = true;
            return qrValidations.value;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    function getTripById(id) {
        return trips.value.find(trip => String(trip.tripId) === String(id));
    }

    function addTrip(trip) {
        return tripManagementApi.createTrip(trip).then(response => {
            const newTrip = TripAssembler.toEntityFromResource(response.data);
            trips.value.push(newTrip);
            return newTrip;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    function updateTrip(trip) {
        return tripManagementApi.updateTrip(trip).then(response => {
            const updatedTrip = TripAssembler.toEntityFromResource(response.data);
            const index = trips.value.findIndex(item => String(item.tripId) === String(updatedTrip.tripId));
            if (index !== -1) trips.value[index] = updatedTrip;
            return updatedTrip;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    function deleteTrip(trip) {
        return tripManagementApi.deleteTrip(trip.tripId).then(() => {
            const index = trips.value.findIndex(item => String(item.tripId) === String(trip.tripId));
            if (index !== -1) trips.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    function startTrip(trip) {
        trip.startTrip();
        return updateTrip(trip);
    }

    function finishTrip(trip, distanceKm, pricePerKm = 1, isPremium = false) {
        trip.finishTrip(distanceKm);
        trip.calculateCost(pricePerKm, isPremium);
        return updateTrip(trip);
    }

    function validateQR(validation, expectedQrCode) {
        validation.validate(expectedQrCode);
        return tripManagementApi.createQRValidation(validation).then(response => {
            const newValidation = QRValidationAssembler.toEntityFromResource(response.data);
            qrValidations.value.push(newValidation);
            return newValidation;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    return {
        trips,
        qrValidations,
        errors,
        tripsLoaded,
        qrValidationsLoaded,
        tripsCount,
        activeTrips,
        fetchTrips,
        fetchQRValidations,
        getTripById,
        addTrip,
        updateTrip,
        deleteTrip,
        startTrip,
        finishTrip,
        validateQR,
        clearSession
    };
});

export default useTripManagementStore;
