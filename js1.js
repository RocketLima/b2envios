let totalCost = 0;
let mapService;
const discountCode = 'nav24';
const discountRate = 0.15;

const costPerKm = {
    moto: { rate: 1.25, min: 5 },
    auto: { rate: 1.50, min: 7 }
};

const ecommerceFlatRate = {
    moto: 11,
    auto: 14
};

setTimeout(() => {
    document.getElementById("animationContainer").style.display = "none";
}, 1700);

function displayTotalCost() {
    const enteredCode = document.getElementById('discountCode').value.trim();
    let finalCost = totalCost;

    if (enteredCode === discountCode) {
        finalCost = totalCost * (1 - discountRate);
    }

    // Redondear al múltiplo más cercano de 0.05
    finalCost = Math.ceil(finalCost * 20) / 20;
    document.getElementById('totalCost').textContent = `Importe total: S/ ${finalCost.toFixed(2)}`;
}

function initAutocomplete() {
    mapService = new google.maps.DistanceMatrixService();
    const initialAddressInput = document.querySelector('#additionalAddresses .address-field input');
    if (initialAddressInput) {
        addAutocomplete(initialAddressInput);
    }
    addAutocomplete(document.getElementById('pickupAddress'));
}

function addAutocomplete(input) {
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', updateTotalCost);
}

document.querySelectorAll('input[name="shippingType"], input[name="deliveryMethod"]').forEach(el => {
    el.addEventListener('change', updateTotalCost);
});

document.getElementById('addAddressBtn').addEventListener('click', () => {
    const container = document.getElementById('additionalAddresses');
    const addressField = document.createElement('div');
    addressField.classList.add('address-field');

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'receiverAddress[]';
    input.required = true;
    input.classList.add('address-input');
    addressField.appendChild(input);
    addAutocomplete(input);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-btn');
    removeButton.textContent = '-';
    removeButton.addEventListener('click', () => {
        container.removeChild(addressField);
        updateTotalCost();
    });
    addressField.appendChild(removeButton);

    container.appendChild(addressField);
    updateTotalCost();
});

function updateTotalCost() {
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const shippingType = document.querySelector('input[name="shippingType"]:checked').value;
    const pickupAddress = document.getElementById('pickupAddress').value;
    const addresses = Array.from(document.querySelectorAll('#additionalAddresses input[name="receiverAddress[]"]')).map(i => i.value);

    if (shippingType === 'ecommerce') {
        if (addresses.length >= 2) {
            totalCost = addresses.length * ecommerceFlatRate[deliveryMethod];
        } else {
            totalCost = 0;
        }
        displayTotalCost();
    } else {
        calculateDistanceCosts(pickupAddress, addresses, deliveryMethod);
    }
}

function calculateDistanceCosts(origin, destinations, method) {
    if (!origin || destinations.some(dest => !dest)) {
        totalCost = 0;
        displayTotalCost();
        return;
    }

    mapService.getDistanceMatrix({
        origins: [origin],
        destinations,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status !== 'OK') {
            console.error("Error en la distancia: ", status);
            totalCost = 0;
            displayTotalCost();
            return;
        }

        let cost = 0;
        response.rows[0].elements.forEach(element => {
            if (element.status === 'OK') {
                const distanceKm = element.distance.value / 1000;
                const { rate, min } = costPerKm[method];
                cost += Math.max(min, rate * distanceKm);
            }
        });

        totalCost = cost;
        displayTotalCost();
    });
}

document.getElementById('shippingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const senderName = document.getElementById('senderName').value;
    const senderPhone = document.getElementById('senderPhone').value;
    const pickupAddress = document.getElementById('pickupAddress').value;
    const receiverName = document.getElementById('receiverName').value;
    const receiverPhone = document.getElementById('receiverPhone').value;
    const addresses = Array.from(document.querySelectorAll('#additionalAddresses input[name="receiverAddress[]"]')).map(i => i.value).join(' | ');
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const shippingType = document.querySelector('input[name="shippingType"]:checked').value;
    const comments = document.getElementById('comments').value;
    const enteredCode = document.getElementById('discountCode').value.trim();

    let finalCost = totalCost;
    if (enteredCode === discountCode) {
        finalCost = totalCost * (1 - discountRate);
    }
    finalCost = Math.ceil(finalCost * 20) / 20;

    const message = `*Nuevo Envío Registrado*\n\n` +
        `*Remitente:* ${senderName} (${senderPhone})\n` +
        `*Recojo:* ${pickupAddress}\n` +
        `*Destinatario:* ${receiverName} (${receiverPhone})\n` +
        `*Dirección de Envío:* ${addresses}\n` +
        `*Tipo de Envío:* ${shippingType}\n` +
        `*Método:* ${deliveryMethod}\n` +
        `*Comentarios:* ${comments || 'Ninguno'}\n` +
        `*Importe:* S/ ${finalCost.toFixed(2)}\n` +
        (enteredCode === discountCode ? `*Cupón aplicado:* ${discountCode}\n` : '');

    const encodedMsg = encodeURIComponent(message);
    const whatsappNumber = "51981610742"; // Tu número en formato internacional
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
    window.open(whatsappURL, '_blank');

    document.getElementById('successMessage').style.display = 'block';
    this.reset();
    // Reset only the first address field after submission
    const firstAddressInput = document.querySelector('#additionalAddresses .address-field input');
    const otherAddressFields = document.querySelectorAll('#additionalAddresses .address-field:not(:first-child)');
    otherAddressFields.forEach(field => field.remove());
    if (firstAddressInput) {
        firstAddressInput.value = '';
    }
    document.getElementById('totalCost').textContent = "Importe total: S/ 0.00";
});