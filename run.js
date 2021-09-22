const axios = require('axios');
require('colors');

/**
 * Local variables 
 */
let offer = {};
let newOffer = {};

/**
 * Methods
 */
const getNewItem = async () => {
    axios.get("https://www.ibood.com/api/offers/website/nl/nl/slotitems")
        .then((res) => {
            const data = res.data;

            if (data === undefined || data.items === undefined || data.items.length == 0)
                handleError("No usable data response");

            const items = data.items.map(item => item.offer).filter(item => item !== undefined);
            const hunt = groupBy('sale_type', items)['hunt'][0];
            newOffer = hunt;

            if (!updateStatus()) getNewItem();
        })
        .catch(err => {
            handleError(err);
            getNewItem();
        });
}

const waitUntillEnd = async () => {
    const end = Date.parse(newOffer.end);
    const now = Date.now();

    if (end > now) {
        await delay(end - now);
        getNewItem();
    } else {
        getNewItem();
    }
}

const updateStatus = () => {
    if (offer.offer_id == newOffer.offer_id) return false;

    offer = newOffer;

    console.log(''); // Newline
    console.log('==='.red + ' NEW OFFER: ' + String(offer.short_title).green);
    console.log('==='.red + ' PRICE: ' + parseCentsToEuros(offer.price.cents).green);
    console.log('==='.red + ' URL: ' + `https://www.ibood.com${offer.url}`.yellow);

    waitUntillEnd();

    return true;
}

/**
 * Helpers
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

const handleError = (e) => console.log(`Got error: ${e.message}`.red);

const groupBy = (key, array) => array.reduce((objectsByKeyValue, obj) => ({
    ...objectsByKeyValue, [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
}), {});

/**
 * Normalize data 
 */
const parseCentsToEuros = (cents) => `€ ${(Number(cents) / 100).toLocaleString("nl-NL")}-`;

/**
 * Start
 */
getNewItem();