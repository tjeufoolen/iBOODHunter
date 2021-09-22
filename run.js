const axios = require('axios');
require('colors');

// Data
let offer = {};
let newOffer = {};
const timer = 5000; // Every 5 seconds

/**
 * Methods
 */
const getNewItem = () => {
    process.stdout.write(".".blue);
    axios.get("https://www.ibood.com/api/offers/website/nl/nl/slotitems")
        .then((res) => {
            const data = res.data;

            if (data === undefined || data.items === undefined || data.items.length == 0)
                handleError("No usable data response");

            const items = data.items.map(item => item.offer).filter(item => item !== undefined);
            const hunts = groupBy('sale_type', items)['hunt'];

            newOffer = hunts[0];
            updateStatus();
        })
        .catch(err => handleError);
}

const updateStatus = () => {
    if (offer.offer_id !== newOffer.offer_id) {
        offer = newOffer;

        console.log(''); // Newline
        console.log('==='.red + ' NEW OFFER: ' + String(offer.short_title).green);
        console.log('==='.red + ' PRICE: ' + parseCentsToEuros(offer.price.cents).green);
        console.log('==='.red + ' URL: ' + `https://www.ibood.com${offer.url}`.yellow);
    }
}

/**
 * Helpers
 */
const handleError = (e) => console.log(`Got error: ${e.message}`.red);

const groupBy = (key, array) => array.reduce((objectsByKeyValue, obj) => ({
    ...objectsByKeyValue, [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
}), {});

/**
 * Normalize data. 
 */
const parseCentsToEuros = (cents) => `€ ${(Number(cents) / 100).toLocaleString("nl-NL")}-`;

/**
 * Main loop
 */
console.log(`Hunting offers on ibood every ${timer / 1000} second(s)...`.yellow);

setInterval(() => getNewItem(), timer);